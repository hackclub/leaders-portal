export const DEFAULT_OAUTH_SCOPES = ['leader:read', 'clubs:read'];

export const OAUTH_SCOPES = [
	{
		name: 'leader:read',
		description: 'Read leader identity basics, including name and email',
		sensitive: false
	},
	{
		name: 'clubs:read',
		description: 'Read club metadata such as name, level, location, join code, and role',
		sensitive: false
	},
	{
		name: 'clubs:ships:read',
		description: 'Read ship/project data for the leader clubs',
		sensitive: false
	},
	{
		name: 'clubs:members:read',
		description: 'Read member lists for the leader clubs',
		sensitive: true
	},
	{
		name: 'clubs:members:write',
		description: 'Add, edit, or remove members in the leader clubs',
		sensitive: true
	},
	{
		name: 'clubs:announce',
		description: 'Send announcements to members in the leader clubs',
		sensitive: true
	},
	{
		name: 'clubs:settings:write',
		description: 'Update club settings and management metadata',
		sensitive: true
	}
];

const SCOPE_MAP = new Map(OAUTH_SCOPES.map((scope) => [scope.name, scope]));

export function parseScopeString(value) {
	if (!value || typeof value !== 'string') return [];
	return [...new Set(value.trim().split(/\s+/).filter(Boolean))];
}

export function stringifyScopes(scopes) {
	return [...new Set(scopes || [])].join(' ');
}

export function isKnownScope(scope) {
	return SCOPE_MAP.has(scope);
}

export function getUnknownScopes(scopes) {
	return (scopes || []).filter((scope) => !isKnownScope(scope));
}

export function getScopeDefinition(scope) {
	return SCOPE_MAP.get(scope) || null;
}

export function hasSensitiveScopes(scopes) {
	return (scopes || []).some((scope) => getScopeDefinition(scope)?.sensitive);
}

export function getSensitiveScopes(scopes) {
	return (scopes || []).filter((scope) => getScopeDefinition(scope)?.sensitive);
}

export function canUnverifiedAppUseScopes(scopes) {
	return !hasSensitiveScopes(scopes);
}

export function normalizeRequestedScopes(requestedScopeString) {
	const parsed = parseScopeString(requestedScopeString);
	if (parsed.length === 0) {
		return [...DEFAULT_OAUTH_SCOPES];
	}
	return parsed;
}
