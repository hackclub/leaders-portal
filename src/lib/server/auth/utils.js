export function sanitizeReturnTo(path) {
	if (!path) return '/';
	if (typeof path !== 'string') return '/';
	if (!path.startsWith('/')) return '/';
	if (path.startsWith('//')) return '/';
	if (path.includes('://')) return '/';
	return path;
}
