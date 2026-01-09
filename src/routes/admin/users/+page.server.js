import { getKnex } from '$lib/server/db/knex.js';
import { error, fail } from '@sveltejs/kit';

export async function load() {
    const knex = getKnex();
    const users = await knex('users')
        .orderBy('created_at', 'desc')
        .select(
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'identity_verified',
            'is_admin',
            'created_at'
        );
    return { users };
}

export const actions = {
    search: async ({ request }) => {
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
            .limit(50)
            .select('id', 'username', 'email', 'first_name', 'last_name', 'identity_verified', 'is_admin', 'created_at');
        
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
    }
};
