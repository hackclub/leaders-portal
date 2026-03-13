import { describe, expect, it } from 'vitest';
import {
	DEFAULT_OAUTH_SCOPES,
	canUnverifiedAppUseScopes,
	getSensitiveScopes,
	getUnknownScopes,
	hasSensitiveScopes,
	normalizeRequestedScopes,
	parseScopeString
} from '../src/lib/server/oauth/scopes.js';
import {
	hashValue,
	normalizeRedirectUris,
	parseStoredRedirectUris,
	verifyClientSecret
} from '../src/lib/server/oauth/store.js';

describe('oauth scope utilities', () => {
	it('parses and deduplicates a scope string', () => {
		expect(parseScopeString('leader:read clubs:read leader:read')).toEqual([
			'leader:read',
			'clubs:read'
		]);
	});

	it('falls back to default scopes when request scope is empty', () => {
		expect(normalizeRequestedScopes('')).toEqual(DEFAULT_OAUTH_SCOPES);
	});

	it('detects unknown scopes', () => {
		expect(getUnknownScopes(['leader:read', 'unknown:scope'])).toEqual(['unknown:scope']);
	});

	it('flags sensitive scope usage', () => {
		expect(hasSensitiveScopes(['leader:read'])).toBe(false);
		expect(hasSensitiveScopes(['clubs:members:read'])).toBe(true);
		expect(getSensitiveScopes(['leader:read', 'clubs:members:read'])).toEqual([
			'clubs:members:read'
		]);
	});

	it('prevents unverified apps from using sensitive scopes', () => {
		expect(canUnverifiedAppUseScopes(['leader:read', 'clubs:read'])).toBe(true);
		expect(canUnverifiedAppUseScopes(['clubs:members:read'])).toBe(false);
	});
});

describe('oauth app utility helpers', () => {
	it('normalizes redirect uris from multiline strings', () => {
		expect(
			normalizeRedirectUris('https://example.com/callback\nhttps://example.com/second')
		).toEqual(['https://example.com/callback', 'https://example.com/second']);
	});

	it('rejects invalid redirect uri protocols', () => {
		expect(() => normalizeRedirectUris('ftp://example.com/callback')).toThrow(
			'Redirect URI must use http or https'
		);
	});

	it('parses stored redirect uri json', () => {
		expect(parseStoredRedirectUris('["https://example.com/callback"]')).toEqual([
			'https://example.com/callback'
		]);
	});

	it('verifies confidential client secrets by hash', () => {
		const secret = 'super-secret';
		const application = {
			confidential: true,
			client_secret_hash: hashValue(secret)
		};
		expect(verifyClientSecret(application, secret)).toBe(true);
		expect(verifyClientSecret(application, 'wrong-secret')).toBe(false);
	});
});
