import { env } from '$env/dynamic/private';

/**
 * Development-only logging utility.
 * Logs are only output when NODE_ENV is 'development'.
 * This prevents sensitive data from appearing in production logs.
 */
const isDev = env.NODE_ENV === 'development';

export function debugLog(prefix, ...args) {
	if (isDev) {
		console.log(prefix, ...args);
	}
}

export function debugError(prefix, ...args) {
	if (isDev) {
		console.error(prefix, ...args);
	} else {
		const safeArgs = args.map(arg => {
			if (arg instanceof Error) {
				return { name: arg.name, message: arg.message };
			}
			return '[redacted]';
		});
		console.error(prefix, ...safeArgs);
	}
}

/**
 * Redact email addresses for logging
 * Shows first 2 chars and domain only
 */
export function redactEmail(email) {
	if (!email || typeof email !== 'string' || !email.includes('@')) {
		return '[invalid]';
	}
	const [local, domain] = email.split('@');
	return `${local.slice(0, 2)}***@${domain}`;
}
