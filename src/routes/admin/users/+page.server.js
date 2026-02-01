import { getKnex } from '$lib/server/db/knex.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { randomUUID, createHash } from 'crypto';
import { getClubsForEmail } from '$lib/server/sync-clubs.js';
import { getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';

const SESSION_COOKIE = 'sid';
const USERS_PER_PAGE = 25;

export async function load({ url }) {
    const knex = getKnex();
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const sort = url.searchParams.get('sort') || 'newest';
    const offset = (page - 1) * USERS_PER_PAGE;
    
    const [{ count }] = await knex('users').count('* as count');
    const totalUsers = parseInt(count, 10);
    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
    
    let query = knex('users')
        .select(
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'identity_verified',
            'is_admin',
            'is_suspended',
            'suspension_reason',
            'suspended_at',
            'created_at'
        );
    
    switch (sort) {
        case 'admin':
            query = query.orderBy('is_admin', 'desc').orderBy('created_at', 'desc');
            break;
        case 'suspended':
            query = query.orderBy('is_suspended', 'desc').orderBy('created_at', 'desc');
            break;
        case 'verified':
            query = query.orderBy('identity_verified', 'desc').orderBy('created_at', 'desc');
            break;
        case 'unverified':
            query = query.orderBy('identity_verified', 'asc').orderBy('created_at', 'desc');
            break;
        case 'oldest':
            query = query.orderBy('created_at', 'asc');
            break;
        case 'newest':
        default:
            query = query.orderBy('created_at', 'desc');
            break;
    }
    
    const users = await query.limit(USERS_PER_PAGE).offset(offset);
    
    return { 
        users,
        sort,
        pagination: {
            page,
            totalPages,
            totalUsers,
            perPage: USERS_PER_PAGE
        }
    };
}

function escapeLikeWildcards(str) {
    return str.replace(/[%_\\]/g, '\\$&');
}

export const actions = {
    search: async ({ request }) => {
        const formData = await request.formData();
        const query = formData.get('query')?.toString().trim();
        
        if (!query || query.length < 2) {
            return fail(400, { searchError: 'Search query must be at least 2 characters' });
        }
        
        const escapedQuery = escapeLikeWildcards(query);
        
        const knex = getKnex();
        const users = await knex('users')
            .where('email', 'ilike', `%${escapedQuery}%`)
            .orWhere('username', 'ilike', `%${escapedQuery}%`)
            .orWhere('first_name', 'ilike', `%${escapedQuery}%`)
            .orWhere('last_name', 'ilike', `%${escapedQuery}%`)
            .limit(50)
            .select('id', 'username', 'email', 'first_name', 'last_name', 'identity_verified', 'is_admin', 'is_suspended', 'suspension_reason', 'suspended_at', 'created_at');
        
        return { searchResults: users, searchQuery: query };
    },
    
    toggleAdmin: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const userId = formData.get('userId');
        const isAdmin = formData.get('isAdmin') === 'true';
        
        if (String(userId) === String(locals.userPublic.id)) {
            return fail(400, { error: 'Cannot modify your own admin status' });
        }
        
        const knex = getKnex();
        await knex('users')
            .where({ id: userId })
            .update({ is_admin: !isAdmin });
            
        return { success: true };
    },
    
    clearSessions: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const userId = formData.get('userId');
        
        const knex = getKnex();
        const deleted = await knex('sessions').where({ user_id: userId }).delete();
        
        return { success: true, clearedSessions: deleted };
    },
    
    delete: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const userId = formData.get('userId');
        
        if (String(userId) === String(locals.userPublic.id)) {
            return fail(400, { error: 'Cannot delete yourself' });
        }
        
        const knex = getKnex();
        await knex('users').where({ id: userId }).delete();
        
        return { success: true };
    },
    
    loginAs: async ({ request, locals, cookies }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const userId = formData.get('userId');
        
        const knex = getKnex();
        
        const targetUser = await knex('users').where({ id: userId }).first();
        if (!targetUser) {
            return fail(400, { error: 'User not found' });
        }
        
        const sessionToken = randomUUID();
        const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await knex('sessions').insert({
            id: randomUUID(),
            user_id: userId,
            session_token_hash: tokenHash,
            created_at: now,
            last_activity_at: now,
            expires_at: expiresAt,
            ip: null,
            user_agent: 'Admin impersonation by ' + locals.userPublic.email
        });
        
        cookies.set(SESSION_COOKIE, sessionToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
        
        throw redirect(302, '/');
    },
    
    suspend: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const userId = formData.get('userId');
        const reason = formData.get('reason')?.toString().trim() || 'No reason provided';
        
        if (String(userId) === String(locals.userPublic.id)) {
            return fail(400, { error: 'Cannot suspend yourself' });
        }
        
        const knex = getKnex();
        
        const targetUser = await knex('users').where({ id: userId }).first();
        if (targetUser?.is_admin) {
            return fail(400, { error: 'Cannot suspend an admin user. Demote them first.' });
        }
        
        await knex('users')
            .where({ id: userId })
            .update({ 
                is_suspended: true, 
                suspension_reason: reason,
                suspended_at: new Date(),
                suspended_by: locals.userPublic.id
            });
        
        await knex('sessions').where({ user_id: userId }).delete();
            
        return { success: true, action: 'suspended' };
    },
    
    unsuspend: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const userId = formData.get('userId');
        
        const knex = getKnex();
        await knex('users')
            .where({ id: userId })
            .update({ 
                is_suspended: false, 
                suspension_reason: null,
                suspended_at: null,
                suspended_by: null
            });
            
        return { success: true, action: 'unsuspended' };
    },
    
    viewClubs: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const userId = formData.get('userId');
        
        const knex = getKnex();
        const user = await knex('users').where({ id: userId }).first();
        
        if (!user) {
            return fail(400, { error: 'User not found' });
        }
        
        try {
            const effectiveEmail = getEffectiveEmailForUser(user);
            const clubs = await getClubsForEmail(effectiveEmail);
            
            return { 
                viewingClubs: true,
                clubsUser: {
                    id: user.id,
                    email: user.email,
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown'
                },
                clubs: clubs.map(c => ({
                    id: c.id,
                    name: c.name,
                    location: c.location || 'Unknown location'
                }))
            };
        } catch (err) {
            console.error('Error fetching clubs for user:', err);
            return { 
                viewingClubs: true,
                clubsUser: {
                    id: user.id,
                    email: user.email,
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown'
                },
                clubs: [],
                clubsError: 'Could not fetch clubs for this user'
            };
        }
    }
};
