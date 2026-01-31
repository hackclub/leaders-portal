import crypto from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { findSessionByTokenHash, touchSession, deleteSessionById } from '$lib/server/auth/sessions.js';
import { getUserPublicById } from '$lib/server/auth/users.js';
import { refreshIfNeeded } from '$lib/server/auth/tokens.js';
import { startCacheScheduler } from '$lib/server/cache-scheduler.js';

const SESSION_COOKIE = 'sid';

const SUSPENSION_ALLOWED_ROUTES = ['/suspended', '/logout', '/auth', '/api'];

startCacheScheduler();

const securityHeaders = {
	'X-Frame-Options': 'SAMEORIGIN',
	'X-Content-Type-Options': 'nosniff',
	'X-XSS-Protection': '1; mode=block',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'Content-Security-Policy': [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
		"style-src 'self' 'unsafe-inline' https://assets.hackclub.com",
		"img-src 'self' data: https: blob:",
		"font-src 'self' https://assets.hackclub.com",
		"connect-src 'self' https://auth.hackclub.com https://hackclub.com",
		"frame-src 'self' https://hackclub.com",
		"frame-ancestors 'self'",
		"base-uri 'self'",
		"form-action 'self'"
	].join('; ')
};

export async function handle({ event, resolve }) {
	const knex = getKnex();

	const raw = event.cookies.get(SESSION_COOKIE);
	if (raw) {
		const token = raw;
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
		const session = await findSessionByTokenHash(knex, tokenHash);

		if (session && session.expires_at > new Date()) {
			const now = new Date();

			if (session.last_activity_at < new Date(now.getTime() - 15 * 60 * 1000)) {
				await touchSession(knex, session.id, { last_activity_at: now });
			}

			const userPublic = await getUserPublicById(knex, session.user_id);
			event.locals.userId = session.user_id;
			event.locals.userPublic = userPublic;

			event.locals.getAccessToken = async () => {
				const { token } = await refreshIfNeeded(knex, session.user_id, event.fetch);
				return token;
			};
			
			if (userPublic?.isSuspended) {
				const pathname = event.url.pathname;
				const isAllowedRoute = SUSPENSION_ALLOWED_ROUTES.some(route => pathname.startsWith(route));
				
				if (!isAllowedRoute) {
					throw redirect(302, '/suspended');
				}
			}
		} else if (session) {
			await deleteSessionById(knex, session.id);
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		}
	}

	const response = await resolve(event);

	Object.entries(securityHeaders).forEach(([header, value]) => {
		response.headers.set(header, value);
	});

	return response;
}
