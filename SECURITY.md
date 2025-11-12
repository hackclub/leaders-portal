# Security Architecture

This document details the security measures implemented in the authentication system.

## Overview

This application implements a defense-in-depth security model with multiple layers of protection for user data and sessions.

## Security Layers

### 1. OAuth 2.0 Authorization Code Flow

✅ **Implementation**
- Uses Hack Club Dashboard OAuth with authorization code grant type
- State parameter for CSRF protection during OAuth flow
- Redirect URI validation

✅ **Protection Against**
- CSRF attacks during authorization
- Authorization code interception
- OAuth redirect hijacking

### 2. Session Management

✅ **Cookie Security**
```javascript
{
  httpOnly: true,        // Not accessible via JavaScript
  sameSite: 'lax',      // CSRF protection
  secure: true,         // HTTPS only in production
  maxAge: 14 days       // Automatic expiry
}
```

✅ **Database Storage**
- Session tokens hashed with SHA-256 before storage
- Hash stored in database, raw token only in cookie
- Stolen database cannot be used to hijack sessions

✅ **Session Lifecycle**
- 14-day absolute expiration
- 7-day idle timeout (rolling)
- Activity tracking updates every 15 minutes
- Expired sessions automatically deleted

### 3. Token Encryption

✅ **AES-256-GCM Encryption**
```javascript
{
  algorithm: 'aes-256-gcm',
  keySize: 256 bits,
  ivSize: 96 bits (12 bytes),
  authTag: 128 bits (16 bytes)
}
```

✅ **Storage Model**
- Access token: encrypted
- Refresh token: encrypted
- Each with unique IV and auth tag
- Key version tracking for rotation

✅ **Key Management**
- Encryption key stored in environment variable
- 32-byte key (256 bits)
- Key version field allows future rotation
- Keys never exposed to frontend

### 4. Data Exposure Control

✅ **Frontend-Safe Data Only**
```javascript
// Exposed to frontend
{
  id: uuid,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  identityVerified: boolean
}

// NEVER exposed
- provider_user_id
- access_token
- refresh_token
- session_token
- token encryption IVs/tags
```

✅ **Server-Only Access**
- OAuth tokens only accessible via `locals.getAccessToken()`
- Token refresh handled server-side
- No token data in page props or API responses

### 5. Token Refresh Strategy

✅ **On-Demand Refresh**
- Tokens refreshed only when needed (< 60s until expiry)
- Automatic retry with new tokens
- Failed refresh invalidates session

✅ **Error Handling**
```javascript
if (refresh fails with invalid_grant) {
  1. Delete oauth_tokens from database
  2. Delete session
  3. Clear session cookie
  4. Force user to re-authenticate
}
```

### 6. CSRF Protection

✅ **OAuth State**
- Random 128-bit state parameter
- Stored in httpOnly cookie (10-minute expiry)
- Validated on callback
- State cookie deleted after use

✅ **Logout Protection**
- POST-only endpoint
- Origin header validation
- SameSite cookie policy

### 7. SQL Injection Prevention

✅ **Parameterized Queries**
- All database queries use Knex.js query builder
- No raw SQL with user input
- Automatic parameter escaping

### 8. Timing Attack Prevention

✅ **Constant-Time Comparisons**
- Session lookup by hash (not linear scan)
- Database indexing on critical fields
- No early returns based on sensitive data

## Security Best Practices

### Environment Variables

Never commit these to version control:
```env
HACKCLUB_OAUTH_CLIENT_SECRET
SESSION_SECRET
TOKEN_ENC_KEY
DATABASE_URL (if contains credentials)
```

### Key Generation

Always use cryptographically secure random values:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

❌ Never use:
- Predictable values
- Shared secrets between environments
- Weak random number generators

### Production Checklist

- [ ] `NODE_ENV=production` set
- [ ] HTTPS enabled (required)
- [ ] Strong unique `SESSION_SECRET`
- [ ] Strong unique `TOKEN_ENC_KEY`
- [ ] Database over TLS/SSL
- [ ] Firewall rules for database
- [ ] Regular database backups
- [ ] Log monitoring configured
- [ ] Error tracking (without logging secrets)

## Threat Model

### Protected Against

✅ Session hijacking (hashed tokens)
✅ Token theft from database (encrypted)
✅ CSRF attacks (state parameter, SameSite cookies)
✅ XSS cookie theft (httpOnly flag)
✅ SQL injection (parameterized queries)
✅ OAuth redirect attacks (redirect URI validation)
✅ Token replay (short expiry, refresh rotation)
✅ Unauthorized API access (server-side token management)

### Residual Risks

⚠️ **XSS vulnerabilities in application code**
- Mitigation: Svelte auto-escapes by default
- Action: Review any `@html` usage

⚠️ **Compromised OAuth provider**
- Mitigation: Limited scope requests
- Action: Monitor OAuth provider security bulletins

⚠️ **Physical access to server**
- Mitigation: Encrypted tokens at rest
- Action: Server physical security, disk encryption

⚠️ **Environment variable exposure**
- Mitigation: Restricted access, no commits
- Action: Use secrets management service

⚠️ **Side-channel attacks**
- Mitigation: Constant-time operations where possible
- Action: Monitor timing anomalies

## Incident Response

### Suspected Session Hijacking

```sql
-- Find sessions by user
SELECT * FROM sessions WHERE user_id = '<user_uuid>';

-- Terminate all user sessions
DELETE FROM sessions WHERE user_id = '<user_uuid>';
```

### Suspected Token Compromise

```sql
-- Revoke user's tokens (forces re-auth)
DELETE FROM oauth_tokens WHERE user_id = '<user_uuid>';
DELETE FROM sessions WHERE user_id = '<user_uuid>';
```

### Key Rotation (TOKEN_ENC_KEY)

1. Add new key to environment (don't remove old)
2. Update `key_version` default in migration
3. Re-encrypt tokens on access:
   - Decrypt with old key (check key_version)
   - Encrypt with new key
   - Update key_version field
4. After all tokens re-encrypted, remove old key

### Database Breach

If database is compromised:

1. **Immediate**
   - Rotate `TOKEN_ENC_KEY` (prevents decryption)
   - Invalidate all sessions
   - Force all users to re-authenticate

2. **Investigation**
   - Review access logs
   - Identify compromised accounts
   - Check for unauthorized API calls

3. **Recovery**
   - Notify affected users
   - Monitor for unusual activity
   - Consider additional MFA requirement

## Compliance Considerations

### Data Storage

- User email: stored (from OAuth provider)
- OAuth tokens: stored encrypted
- Session data: IP address, user agent
- Passwords: NOT stored (OAuth only)

### Data Retention

- Sessions: 14 days (automatic cleanup recommended)
- OAuth tokens: until user revokes or deletes account
- Audit logs: per your retention policy

### GDPR Rights

Implement endpoints for:
- Right to access: Export user data
- Right to erasure: Delete user and related data
- Right to portability: Export in standard format

```sql
-- Delete all user data (GDPR erasure)
DELETE FROM oauth_tokens WHERE user_id = '<user_uuid>';
DELETE FROM sessions WHERE user_id = '<user_uuid>';
DELETE FROM users WHERE id = '<user_uuid>';
```

## Monitoring & Logging

### Security Events to Log

✅ Log these (without sensitive data):
- Login attempts (success/failure)
- Session creation
- Token refresh (success/failure)
- Logout events
- OAuth errors
- Database connection errors

❌ NEVER log:
- Session tokens (raw or hashed)
- OAuth access/refresh tokens
- Encryption keys
- User passwords

### Example Log Entry

```json
{
  "event": "login_success",
  "userId": "uuid",
  "timestamp": "2024-11-12T10:30:00Z",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "provider": "hackclub"
}
```

## Security Contacts

For security vulnerabilities:
1. Do not open public issues
2. Contact maintainers privately
3. Allow time for patch before disclosure
