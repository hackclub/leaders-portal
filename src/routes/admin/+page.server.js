import { getKnex } from '$lib/server/db/knex.js';
import { error, fail, redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { dev } from '$app/environment';
import { createSession } from '$lib/server/auth/sessions.js';
import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const SESSION_COOKIE = 'sid';

function normalizeEmail(email) {
    return email?.toString().trim().toLowerCase();
}

function isValidEmail(email) {
    return !!email && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSameOriginRequest(request) {
    const requestOrigin = new URL(request.url).origin;
    const origin = request.headers.get('origin');
    if (origin) {
        return origin === requestOrigin;
    }

    const referer = request.headers.get('referer');
    if (!referer) {
        return false;
    }

    try {
        return new URL(referer).origin === requestOrigin;
    } catch {
        return false;
    }
}

async function findSingleUserByEmail(knex, email) {
    const users = await knex('users')
        .whereRaw('lower(email) = ?', [email])
        .orWhereRaw('lower(provider_user_id) = ?', [email])
        .orWhereRaw('lower(hackclub_primary_email) = ?', [email])
        .limit(2)
        .select('id', 'email', 'provider_user_id', 'hackclub_primary_email', 'is_admin');

    if (users.length !== 1) {
        return null;
    }

    return users[0];
}

export async function load({ locals }) {
    if (!locals.userPublic?.isAdmin) {
        throw redirect(302, '/');
    }
    
    const knex = getKnex();
    
    // User stats
    const [userCount] = await knex('users').count('id as count');
    const [verifiedUserCount] = await knex('users').where('identity_verified', true).count('id as count');
    const [adminCount] = await knex('users').where('is_admin', true).count('id as count');
    
    // Users joined in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentUsersCount] = await knex('users').where('created_at', '>=', sevenDaysAgo).count('id as count');
    
    // Event completion stats
    const [completedEventsCount] = await knex('user_completed_events').count('id as count');
    const [uniqueEventsCompleted] = await knex('user_completed_events').countDistinct('event_id as count');
    const [recentCompletions] = await knex('user_completed_events')
        .where('completed_at', '>=', sevenDaysAgo)
        .count('id as count');
    
    // Active sessions
    const [activeSessionCount] = await knex('sessions')
        .where('expires_at', '>', new Date())
        .count('id as count');
    
    // Recent users (last 10)
    const recentUsers = await knex('users')
        .orderBy('created_at', 'desc')
        .limit(10)
        .select('id', 'username', 'email', 'first_name', 'last_name', 'identity_verified', 'is_admin', 'created_at');
    
    // Users with most event completions
    const topEventCompleters = await knex('user_completed_events')
        .select('user_id')
        .count('id as completions')
        .groupBy('user_id')
        .orderBy('completions', 'desc')
        .limit(5);
    
    const topCompleterIds = topEventCompleters.map(c => c.user_id);
    const topCompleterUsers = topCompleterIds.length > 0 
        ? await knex('users').whereIn('id', topCompleterIds).select('id', 'username', 'first_name', 'last_name', 'email')
        : [];
    
    const topCompletersWithDetails = topEventCompleters.map(c => {
        const user = topCompleterUsers.find(u => u.id === c.user_id);
        return {
            ...c,
            completions: parseInt(c.completions),
            username: user?.username,
            name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown',
            email: user?.email
        };
    });

    // Fetch Members from Airtable
    let membersData = {
        total: 0,
        byClub: {},
        recentMembers: []
    };
    
    try {
        const memberRecords = await base('Members')
            .select({
                fields: ['Name', 'club_name', 'Email']
            })
            .all();
        
        membersData.total = memberRecords.length;
        
        memberRecords.forEach(record => {
            const clubNames = record.get('club_name');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : clubNames;
            
            if (clubName) {
                membersData.byClub[clubName] = (membersData.byClub[clubName] || 0) + 1;
            }
        });
        
        // Get top clubs by members
        membersData.topClubs = Object.entries(membersData.byClub)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
            
    } catch (err) {
        console.error('Error fetching members from Airtable:', err);
    }

    // Fetch Ships from Airtable "Club Ships" table
    let shipsData = {
        total: 0,
        byClub: {},
        byYsws: {},
        recentShips: []
    };
    
    try {
        const shipRecords = await base('Club Ships')
            .select({
                fields: ['YSWS–Name (from Unified YSWS Database)', 'code_url', 'member_name', 'club_name (from Clubs)']
            })
            .all();
        
        shipsData.total = shipRecords.length;
        
        shipRecords.forEach(record => {
            const clubNames = record.get('club_name (from Clubs)');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            const yswsNames = record.get('YSWS–Name (from Unified YSWS Database)');
            const ysws = Array.isArray(yswsNames) ? yswsNames[0] : (yswsNames || 'Unknown');
            
            if (clubName) {
                shipsData.byClub[clubName] = (shipsData.byClub[clubName] || 0) + 1;
            }
            
            shipsData.byYsws[ysws] = (shipsData.byYsws[ysws] || 0) + 1;
            
            shipsData.recentShips.push({
                name: ysws,
                club: clubName,
                memberName: record.get('member_name') || 'Unknown',
                codeUrl: record.get('code_url')
            });
        });
        
        // Limit recent ships to 10
        shipsData.recentShips = shipsData.recentShips.slice(0, 10);
        
        // Top clubs by ships
        shipsData.topClubs = Object.entries(shipsData.byClub)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
            
        // Top YSWS programs
        shipsData.topYsws = Object.entries(shipsData.byYsws)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
            
    } catch (err) {
        console.error('Error fetching ships from Airtable:', err);
    }

    return {
        stats: {
            users: {
                total: parseInt(userCount.count),
                verified: parseInt(verifiedUserCount.count),
                admins: parseInt(adminCount.count),
                recentSignups: parseInt(recentUsersCount.count)
            },
            events: {
                totalCompletions: parseInt(completedEventsCount.count),
                uniqueEvents: parseInt(uniqueEventsCompleted.count),
                recentCompletions: parseInt(recentCompletions.count)
            },
            sessions: {
                active: parseInt(activeSessionCount.count)
            },
            members: {
                total: membersData.total,
                clubCount: Object.keys(membersData.byClub).length
            },
            ships: {
                total: shipsData.total,
                clubCount: Object.keys(shipsData.byClub).length
            }
        },
        recentUsers,
        topCompleters: topCompletersWithDetails,
        membersData: {
            topClubs: membersData.topClubs || []
        },
        shipsData: {
            topClubs: shipsData.topClubs || [],
            topYsws: shipsData.topYsws || [],
            recentShips: shipsData.recentShips || []
        }
    };
}

export const actions = {
    impersonateUser: async ({ request, locals, cookies, getClientAddress }) => {
        if (!locals.userPublic?.isAdmin || !locals.userId) {
            throw error(403, 'Forbidden');
        }

        if (!isSameOriginRequest(request)) {
            throw error(403, 'Forbidden');
        }

        const formData = await request.formData();
        const targetEmail = normalizeEmail(formData.get('email'));

        if (!isValidEmail(targetEmail)) {
            return fail(400, {
                impersonateError: 'Enter a valid user email address.',
                impersonateEmail: targetEmail
            });
        }

        const currentSessionToken = cookies.get(SESSION_COOKIE);
        if (!currentSessionToken) {
            throw error(401, 'Your admin session expired. Please sign in again.');
        }

        const currentSessionHash = crypto.createHash('sha256').update(currentSessionToken).digest('hex');
        const impersonatedSessionToken = crypto.randomBytes(32).toString('base64url');
        const knex = getKnex();

        const result = await knex.transaction(async (trx) => {
            const currentSession = await trx('sessions')
                .where({ session_token_hash: currentSessionHash })
                .andWhere('expires_at', '>', trx.fn.now())
                .first();

            if (!currentSession || String(currentSession.user_id) !== String(locals.userId)) {
                throw error(401, 'Your admin session expired. Please sign in again.');
            }

            const currentAdmin = await trx('users')
                .where({ id: locals.userId, is_admin: true })
                .first('id');

            if (!currentAdmin) {
                throw error(403, 'Forbidden');
            }

            const targetUser = await findSingleUserByEmail(trx, targetEmail);
            if (!targetUser) {
                return {
                    ok: false,
                    response: fail(404, {
                        impersonateError: 'No unique portal user exists for that email address.',
                        impersonateEmail: targetEmail
                    })
                };
            }

            const newSession = await createSession(trx, targetUser.id, impersonatedSessionToken, {
                ip: getClientAddress(),
                userAgent: request.headers.get('user-agent') ?? undefined
            });

            const auditId = crypto.randomUUID();
            await trx('admin_impersonation_audit').insert({
                id: auditId,
                admin_user_id: locals.userId,
                admin_email: locals.userPublic.email || locals.userPublic.hackclubPrimaryEmail || locals.userPublic.username || String(locals.userId),
                target_user_id: targetUser.id,
                target_email: targetEmail,
                admin_session_id: currentSession.id,
                impersonated_session_id: newSession.id,
                ip: getClientAddress(),
                user_agent: request.headers.get('user-agent')
            });

            await trx('sessions').where({ id: currentSession.id }).delete();

            return {
                ok: true,
                targetUser,
                auditId,
                expiresAt: newSession.expiresAt
            };
        });

        if (!result.ok) {
            return result.response;
        }

        cookies.set(SESSION_COOKIE, impersonatedSessionToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: !dev,
            path: '/',
            maxAge: Math.max(0, Math.floor((result.expiresAt.getTime() - Date.now()) / 1000))
        });

        console.warn('[Admin] Impersonation started', {
            auditId: result.auditId,
            adminUserId: locals.userId,
            targetUserId: result.targetUser.id
        });

        throw redirect(303, '/');
    },

    searchUser: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const query = formData.get('query')?.toString().trim();
        
        if (!query || query.length < 2) {
            return fail(400, { searchError: 'Search query must be at least 2 characters' });
        }
        
        const knex = getKnex();
        const users = await knex('users')
            .where('email', 'ilike', `%${query}%`)
            .orWhere('username', 'ilike', `%${query}%`)
            .orWhere('first_name', 'ilike', `%${query}%`)
            .orWhere('last_name', 'ilike', `%${query}%`)
            .limit(20)
            .select('id', 'username', 'email', 'first_name', 'last_name', 'identity_verified', 'is_admin', 'created_at');
        
        return { searchResults: users, searchQuery: query };
    },
    
    searchClub: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const query = formData.get('query')?.toString().trim().toLowerCase();
        
        if (!query || query.length < 2) {
            return fail(400, { clubSearchError: 'Search query must be at least 2 characters' });
        }
        
        // Search in Airtable Members table by club_name
        let clubResults = [];
        try {
            const memberRecords = await base('Members')
                .select({
                    fields: ['club_name']
                })
                .all();
            
            const clubStats = {};
            memberRecords.forEach(record => {
                const clubNames = record.get('club_name');
                const clubName = Array.isArray(clubNames) ? clubNames[0] : clubNames;
                
                if (clubName && clubName.toLowerCase().includes(query)) {
                    if (!clubStats[clubName]) {
                        clubStats[clubName] = { name: clubName, memberCount: 0 };
                    }
                    clubStats[clubName].memberCount++;
                }
            });
            
            // Get ship counts for matching clubs
            const shipRecords = await base('Ships')
                .select({
                    fields: ['club']
                })
                .all();
            
            shipRecords.forEach(record => {
                const clubName = record.get('club');
                if (clubName && clubStats[clubName]) {
                    clubStats[clubName].shipCount = (clubStats[clubName].shipCount || 0) + 1;
                }
            });
            
            clubResults = Object.values(clubStats).slice(0, 20);
        } catch (err) {
            console.error('Error searching clubs in Airtable:', err);
        }
        
        return { clubSearchResults: clubResults, clubSearchQuery: query };
    },
    
    searchMember: async ({ request, locals }) => {
        if (!locals.userPublic?.isAdmin) {
            throw error(403, 'Forbidden');
        }
        
        const formData = await request.formData();
        const query = formData.get('query')?.toString().trim().toLowerCase();
        
        if (!query || query.length < 2) {
            return fail(400, { memberSearchError: 'Search query must be at least 2 characters' });
        }
        
        let memberResults = [];
        try {
            const memberRecords = await base('Members')
                .select({
                    fields: ['Name', 'club_name', 'Email']
                })
                .all();
            
            memberResults = memberRecords
                .filter(record => {
                    const name = record.get('Name')?.toLowerCase() || '';
                    const email = record.get('Email')?.toLowerCase() || '';
                    return name.includes(query) || email.includes(query);
                })
                .slice(0, 20)
                .map(record => {
                    const clubNames = record.get('club_name');
                    return {
                        name: record.get('Name') || 'Unknown',
                        email: record.get('Email') || 'N/A',
                        club: Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'N/A')
                    };
                });
        } catch (err) {
            console.error('Error searching members in Airtable:', err);
        }
        
        return { memberSearchResults: memberResults, memberSearchQuery: query };
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
    
    deleteUser: async ({ request, locals }) => {
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
        
        return { success: true, deleted: userId };
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
    }
};
