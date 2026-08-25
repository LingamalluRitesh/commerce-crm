# CommerceCRM — Architecture Decision Records (ADR) Master Catalog

This document indexes all formal Architecture Decision Records governing the CommerceCRM platform design, data isolation, event transport, AI architecture, and persistence layers.

---

## ADR Index

| ADR ID | Decision Title | Status | Date |
|---|---|---|---|
| [ADR-0001](#adr-0001-modular-monolith-architecture) | Modular Monolith vs Microservices Architecture | Accepted | 2026-08-25 |
| [ADR-0002](#adr-0002-multi-tenant-row-level-security-strategy) | Multi-Tenant Row-Level Security Strategy | Accepted | 2026-08-25 |
| [ADR-0003](#adr-0003-event-driven-transactional-outbox-pattern) | Event-Driven Transactional Outbox Pattern | Accepted | 2026-08-25 |
| [ADR-0004](#adr-0004-dense-vector-search-embeddings-strategy) | In-Process Dense Vector Search & Embeddings Strategy | Accepted | 2026-08-25 |
| [ADR-0005](#adr-0005-decimal-precision-financial-and-tax-arithmetic) | Decimal Precision for Financial and Tax Arithmetic | Accepted | 2026-08-25 |
| [ADR-0006](#adr-0006-immutable-cryptographic-audit-vault) | Immutable Cryptographic Audit Vault Chain | Accepted | 2026-08-25 |
| [ADR-0007](#adr-0007-pluggable-payment-gateway-abstraction) | Pluggable Payment Gateway Abstraction | Accepted | 2026-08-25 |
| [ADR-0008](#adr-0008-nextjs-14-server-components-and-app-router) | Next.js 14 Server Components and App Router | Accepted | 2026-08-25 |
| [ADR-0009](#adr-0009-hmac-sha256-webhook-signing-standard) | HMAC-SHA256 Outbound Webhook Signing Standard | Accepted | 2026-08-25 |
| [ADR-0010](#adr-0010-zero-trust-kubernetes-ingress-and-network-policies) | Zero-Trust Kubernetes Ingress and Network Policies | Accepted | 2026-08-25 |

---

## ADR-0001: Modular Monolith Architecture
- **Context**: An enterprise CRM + Commerce system requires transactional integrity across accounts, orders, inventory, and invoices.
- **Decision**: Implement a single deployable modular monolith in FastAPI with strict domain boundaries (`app/application/services/`, `app/infrastructure/models/`).
- **Consequences**: High development velocity, zero distributed transaction overhead, straightforward atomic transactions, and easy deployment.

## ADR-0002: Multi-Tenant Row-Level Security Strategy
- **Context**: SaaS tenants must never access or modify competitor data.
- **Decision**: Every database entity inherits from `TenantBaseModel` with an indexed `tenant_id` foreign key. All repository and service queries filter by tenant ID extracted from authenticated JWT/API key headers.
- **Consequences**: Guaranteed row-level tenant isolation, zero accidental data leakage.

## ADR-0003: Event-Driven Transactional Outbox Pattern
- **Context**: Domain state changes (orders paid, leads converted) must trigger downstream workflows and webhook dispatch without dual-write race conditions.
- **Decision**: Atomically insert domain events into `outbox_messages` in the same database transaction. A batch drain worker publishes events to the event bus with exponential backoff retries.
- **Consequences**: Guaranteed at-least-once delivery, replayability, and zero lost events during network partitions.

## ADR-0004: Dense Vector Search & Embeddings Strategy
- **Context**: Unstructured knowledge articles and support tickets require fast semantic search without mandatory external vector database dependencies for self-hosted instances.
- **Decision**: Generate normalized 128-dimensional dense vector embeddings in-process, compute cosine similarity via dot products with L2 normalization, with optional pgvector extension in PostgreSQL.
- **Consequences**: High-performance semantic search with zero mandatory cloud AI lock-in.

## ADR-0005: Decimal Precision for Financial and Tax Arithmetic
- **Context**: Floating-point rounding errors in currency arithmetic cause financial and audit discrepancies.
- **Decision**: Use Python's `Decimal` type and PostgreSQL `NUMERIC(12, 4)` for all prices, taxes, line items, discounts, and invoice totals.
- **Consequences**: Zero floating-point rounding errors, 100% compliance with financial accounting standards.

## ADR-0006: Immutable Cryptographic Audit Vault
- **Context**: Enterprise compliance mandates tamper-evident audit trails for security operations.
- **Decision**: Construct a cryptographic SHA-256 hash chain linking every audit log sequentially (`SHA-256(prev_hash + log_record)`).
- **Consequences**: Instant cryptographic detection of log alteration or deletion.

## ADR-0007: Pluggable Payment Gateway Abstraction
- **Context**: Enterprise customers operate across diverse payment rails (Stripe, PayPal, B2B Wire Transfers).
- **Decision**: Define a standardized `BasePaymentGateway` interface with unified `create_charge`, `process_refund`, and `verify_webhook_signature` methods.
- **Consequences**: Pluggable provider selection and mock testing capabilities.

## ADR-0008: Next.js 14 Server Components and App Router
- **Context**: Fast initial page loads, SEO optimization, and reactive dashboards.
- **Decision**: Build the frontend in Next.js 14 App Router with React Server Components, Tailwind CSS, and shadcn-style component primitives.
- **Consequences**: Minimal client bundle size, high performance, and rapid UI development.

## ADR-0009: HMAC-SHA256 Webhook Signing Standard
- **Context**: Webhook recipients need cryptographic proof of authenticity and protection from replay attacks.
- **Decision**: Sign payloads using HMAC-SHA256 with timestamp headers (`X-CommerceCRM-Signature`, `X-CommerceCRM-Timestamp`).
- **Consequences**: Industry-standard webhook security matching Stripe and GitHub standards.

## ADR-0010: Zero-Trust Kubernetes Ingress and Network Policies
- **Context**: Cloud-native deployments require network-level containment.
- **Decision**: Enforce Kubernetes `NetworkPolicy` rules allowing backend API traffic only from the Ingress controller and frontend pods, restricting external pod egress.
- **Consequences**: Defense-in-depth against lateral movement in the cluster.
