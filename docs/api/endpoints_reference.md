# CommerceCRM — REST API & WebSocket Reference Manual

**Base URL**: `https://api.commercecrm.io/api/v1`  
**Authentication**: Bearer Token (`JWT` or `ccrm_live_...` API Key)  
**Tenant Scoping**: `X-Organization-ID: <UUID>`  

---

## Table of API Modules

1. [Authentication & Identity](#1-authentication--identity)
2. [Organizations & Workspaces](#2-organizations--workspaces)
3. [Customer 360 & Accounts](#3-customer-360--accounts)
4. [CRM Sales Pipeline & Deals](#4-crm-sales-pipeline--deals)
5. [Omnichannel Commerce & Orders](#5-omnichannel-commerce--orders)
6. [B2B Pricing Engine](#6-b2b-pricing-engine)
7. [Multi-Warehouse Inventory & Fulfillment](#7-multi-warehouse-inventory--fulfillment)
8. [Marketing Automation](#8-marketing-automation)
9. [Customer Support & Success Plans](#9-customer-support--success-plans)
10. [Finance & Invoicing](#10-finance--invoicing)
11. [Projects & Time Tracking](#11-projects--time-tracking)
12. [Workflow Automation Studio](#12-workflow-automation-studio)
13. [Unified Communication & WebSockets](#13-unified-communication--websockets)
14. [Analytics & Business Intelligence](#14-analytics--business-intelligence)
15. [AI Intelligence & Vectors](#15-ai-intelligence--vectors)
16. [Transactional Outbox](#16-transactional-outbox)
17. [Developer Platform & Webhooks](#17-developer-platform--webhooks)
18. [Observability & Audit Vault](#18-observability--audit-vault)

---

## 1. Authentication & Identity

### `POST /auth/register`
Create a new tenant organization and super administrator account.
- **Request Body**:
  ```json
  {
    "email": "sarah.connor@acme-enterprise.com",
    "password": "SecurePassword123!",
    "first_name": "Sarah",
    "last_name": "Connor",
    "organization_name": "Acme Enterprise Global"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "active_organization_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "user": {
      "id": "c10928f1-4b10-410a-91cb-710492810a91",
      "email": "sarah.connor@acme-enterprise.com",
      "first_name": "Sarah",
      "last_name": "Connor"
    }
  }
  ```

### `POST /auth/login`
Authenticate credentials and obtain access token.
- **Request Body**:
  ```json
  {
    "email": "sarah.connor@acme-enterprise.com",
    "password": "SecurePassword123!"
  }
  ```

### `POST /auth/2fa/enable`
Provision TOTP two-factor secret and QR code URI.

---

## 2. Customer 360 & Accounts

### `GET /customers`
List customers with health scores and LTV metrics.

### `POST /customers`
Create a customer record.
- **Request Body**:
  ```json
  {
    "email": "alex.morgan@enterprise-cloud.io",
    "first_name": "Alex",
    "last_name": "Morgan",
    "phone": "+1-555-019-2831"
  }
  ```

### `GET /customers/{id}/360`
Get aggregated Customer 360 profile with timeline interactions and preference settings.

---

## 3. CRM Sales Pipeline & Deals

### `GET /sales/deals`
List sales deals across pipelines.

### `POST /sales/leads/{id}/convert`
Atomically convert a qualified lead into a Customer account, Contact, and active Deal.

### `POST /sales/quotes`
Generate a commercial quotation with line-item arithmetic and tax calculation.

---

## 4. Omnichannel Commerce & Orders

### `GET /commerce/products`
List catalog products and variants.

### `POST /commerce/orders`
Create an omnichannel order.
- **State Machine**:
  - `POST /commerce/orders/{id}/pay`
  - `POST /commerce/orders/{id}/ship`
  - `POST /commerce/orders/{id}/deliver`

---

## 5. B2B Pricing Engine

### `POST /pricing/price-lists`
Create custom volume discount tiers and price schedules.

### `POST /pricing/calculate`
Calculate effective volume unit prices and net totals.

---

## 6. Multi-Warehouse Inventory & Fulfillment

### `GET /inventory/stock`
List stock items across global warehouses.

### `POST /inventory/transfers`
Dispatch an inter-warehouse transfer with carrier tracking numbers.

---

## 7. Customer Support & Success

### `GET /support/tickets`
List support tickets with SLA deadline countdowns.

### `POST /support/tickets/{id}/comments`
Add customer replies or private internal notes.

---

## 8. Finance & Invoicing

### `GET /finance/invoices`
List commercial invoices.

### `POST /finance/invoices`
Create itemized commercial invoice.

---

## 9. AI Intelligence & Vectors

### `POST /ai/search`
Perform cosine similarity dense vector search across customer knowledge articles and tickets.

### `POST /ai/analyze-text`
Extract sentiment polarity score and actionable follow-up items from text.

---

## 10. Developer Platform & Webhooks

### `POST /developer/api-keys`
Generate high-entropy secret API key with specific permission scopes.

### `POST /developer/webhooks`
Register outbound webhook subscription with HMAC secret.

### `POST /developer/webhooks/{id}/test`
Simulate signed webhook event dispatch (`X-CommerceCRM-Signature`).

---

## 11. Observability & Audit Vault

### `GET /metrics`
Prometheus exposition format (`http_requests_total`, `http_request_duration_seconds`).

### `POST /observability/audit-vault/verify`
Verify cryptographic SHA-256 hash chain across immutable audit trail entries.
