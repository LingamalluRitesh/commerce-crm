# CommerceCRM — Enterprise STRIDE Security Threat Model & Cryptographic Design

**Version**: 2.4.0-Enterprise  
**Classification**: Internal Architecture Reference / Compliance Audit  

---

## 1. Executive Summary & Security Boundary

CommerceCRM is engineered under a **Zero-Trust Security Model** where every request across the API, WebSocket, and Database boundaries is authenticated, authorized, and tenant-isolated.

```
[Untrusted Client]
       │
       ▼ (TLS 1.3 + HSTS)
[NGINX Ingress Controller]
       │ (Security Headers + Request-ID Injection + Rate Limiting)
       ▼
[FastAPI Application Gateway]
       │ (JWT / API-Key Scoping + 2FA TOTP Validation)
       ├───► [In-Memory Domain Event Bus]
       │
       ▼ (Row-Level Security / SQLAlchemy Tenant Scoping)
[PostgreSQL Multi-AZ Cluster] ◄───► [Immutable Cryptographic Audit Vault]
```

---

## 2. STRIDE Threat Analysis Matrix

| Threat Category | Potential Vector | CommerceCRM Architectural Countermeasure | Verification Mechanism |
|---|---|---|---|
| **Spoofing** | Forged identity tokens or session hijacking | Asymmetric JWT signing (RS256/HS256) with short expiration (15m), secure HTTP-only refresh tokens, and RFC 6238 TOTP two-factor authentication. | `AuthService.authenticate_user()` unit and integration test suites. |
| **Tampering** | Parameter tampering or cross-tenant data modification | Mandatory `tenant_id` foreign key validation on every database query, Pydantic v2 strict schema parsing, and HMAC-SHA256 signature verification on webhooks. | Automated cross-tenant isolation test suites (`test_identity.py`, `test_customer.py`). |
| **Repudiation** | Denying high-value transactions or permission changes | Immutable cryptographic SHA-256 hash-chained **Audit Vault** (`SHA256(prev_hash + log_entry)`). Zero support for hard deletion on audit tables. | `AuditService.verify_audit_vault_integrity()` endpoint. |
| **Information Disclosure** | Leakage of PII, credit card data, or secret keys in logs | Automated regex secret scrubbing in `structlog` filters, Bcrypt work factor 12 for passwords, SHA-256 for API keys, and masking of card numbers. | Structured log test assertions in `test_config.py`. |
| **Denial of Service** | Volumetric API flooding or resource starvation | Token bucket rate limiting middleware per IP/tenant, max payload size limits (50MB in Ingress, 2MB in JSON endpoints), and horizontal pod autoscaling. | Prometheus `/metrics` monitoring and HPA configurations. |
| **Elevation of Privilege** | Horizontal or vertical role escalation | Declarative RBAC middleware (`require_permission("order:write")`), tenant-scoped memberships, and refusal of cross-organization permission grants. | `tests/test_errors.py` and `tests/test_identity.py`. |

---

## 3. Cryptographic Key Management & Storage

### 3.1 Password Cryptography
- **Algorithm**: `bcrypt` (Adaptive Work Factor: 12 rounds)
- **Salting**: Cryptographically random 128-bit salt generated per password hash.

### 3.2 Developer API Key Cryptography
- **Generation**: `secrets.token_hex(24)` producing 192 bits of cryptographic entropy.
- **Prefix**: `ccrm_live_` for instant identification.
- **Storage**: Plaintext key is displayed **once** to the client and never saved. The database stores only `SHA-256(raw_key)`.

### 3.3 Outbound Webhook HMAC Signatures
- **Algorithm**: `HMAC-SHA256`
- **Replay Protection**: Header includes `t=<timestamp>`. The signature is calculated over `t=<timestamp>.<raw_json_body>`. Endpoints reject requests older than 300 seconds.

### 3.4 Audit Vault Cryptographic Chain
Every audit log record forms a block in a tenant-specific hash chain:
\[
H_0 = \text{GENESIS\_BLOCK}
\]
\[
H_i = \text{SHA-256}(H_{i-1} \parallel \text{ID}_i \parallel \text{Action}_i \parallel \text{Timestamp}_i)
\]
Any modification, insertion, or deletion of a historical audit row invalidates the entire subsequent chain, producing immediate tamper detection during vault audits.
