import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
    const clubName = url.searchParams.get('club') || null;
    const reason = url.searchParams.get('reason') || null;
    const suspendedAt = url.searchParams.get('date') || null;
    
    return {
        clubName,
        reason,
        suspendedAt
    };
}
