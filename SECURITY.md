# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

CommerceCRM takes enterprise security seriously. If you discover a vulnerability or security issue:

1. **Do not create a public GitHub issue.**
2. Send a detailed report to `security@commercecrm.local` or submit via GitHub Private Security Advisories.
3. Include:
   - Type of issue (e.g., IDOR, SQL injection, privilege escalation, authentication bypass).
   - Step-by-step reproduction steps or proof-of-concept.
   - Impact assessment on multi-tenant data isolation.

## Security Controls Enforced

- **Tenant Isolation**: Direct or guaranteed relational ownership filtering on every database query.
- **Data Protection**: Passwords hashed with Argon2id / Bcrypt; secrets stored in environment variables, never source control.
- **Audit Trails**: Security and state mutation events logged with actor context and request IDs.
- **Rate Limiting**: Tiered rate limits on authentication and public API endpoints.
- **Safe Logging**: Automatic scrubbing of sensitive keys, passwords, and tokens before logs are emitted.
