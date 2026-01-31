export async function load({ locals }) {
    return {
        reason: locals.userPublic?.suspensionReason || null,
        suspendedAt: locals.userPublic?.suspendedAt || null
    };
}
