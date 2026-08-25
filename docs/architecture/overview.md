# CommerceCRM — Architecture Overview

## 1. System Philosophy

CommerceCRM is built on a clean **Modular Monolith** architecture designed to evolve cleanly into an **Event-Driven System** and selective **Microservices** where justified.

```
+-------------------------------------------------------------------------+
|                              Web Clients                                |
|             Next.js App / Admin Console / Customer Portal               |
+-------------------------------------------------------------------------+
                                    |
                               (HTTPS / WSS)
                                    v
+-------------------------------------------------------------------------+
|                           API Gateway / FastAPI                         |
|     [Middleware: RequestID | Tenant Context | CORS | Auth & RBAC]       |
+-------------------------------------------------------------------------+
                                    |
        +---------------------------+---------------------------+
        |                           |                           |
        v                           v                           v
+---------------+           +---------------+           +---------------+
|  Identity &   |           |  Customer 360 |           |  CRM Sales &  |
| Organizations |           |  & Accounts   |           |  Pipelines    |
+---------------+           +---------------+           +---------------+
        |                           |                           |
        v                           v                           v
+---------------+           +---------------+           +---------------+
|   Commerce &  |           |  Inventory &  |           |   Marketing   |
|     Orders    |           |  Fulfillment  |           |   Engine      |
+---------------+           +---------------+           +---------------+
        |                           |                           |
        v                           v                           v
+---------------+           +---------------+           +---------------+
|   Support &   |           |  Workflows &  |           |   AI / ML     |
|   Success     |           |  Automation   |           |   Services    |
+---------------+           +---------------+           +---------------+
                                    |
+-------------------------------------------------------------------------+
|                  Application & Domain Services Layer                    |
|             (Business Invariants, Event Publishers, DTOs)               |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                    Infrastructure & Persistence Layer                   |
|   PostgreSQL 16 (pgvector) | Redis 7 (Cache/Queue) | MinIO (Storage)   |
+-------------------------------------------------------------------------+
```

## 2. Layered Architecture

Each domain module in the backend follows a strict 4-layer architecture:

1. **API Layer (`app/api/`)**:
   - HTTP route handlers (FastAPI routers).
   - Request validation with Pydantic v2 schemas.
   - HTTP status codes, pagination, filtering, sorting.
   - Authentication and Permission dependency injection.

2. **Application Layer (`app/application/`)**:
   - Use cases and workflow orchestrators.
   - Transaction boundaries and cross-aggregate coordination.
   - Event publication to the domain event bus.
   - DTOs and command/query boundaries.

3. **Domain Layer (`app/domain/`)**:
   - Pure domain models and aggregate roots.
   - Business invariants, state machines (e.g., Order status, Deal stage transitions).
   - Domain events and value objects.
   - Pure Python, zero framework or database dependencies.

4. **Infrastructure Layer (`app/infrastructure/`)**:
   - SQLAlchemy 2 ORM entity mappings.
   - Database repository implementations.
   - External service adapters (Stripe, Twilio, SendGrid, S3/MinIO).
   - Redis caching and message queues.

---

## 3. Communication & Integration Model

- **Synchronous**: REST APIs (JSON over HTTP/2) for queries and immediate transactional operations.
- **Asynchronous**: Internal domain event bus with Transactional Outbox pattern for decoupled side-effects (e.g. customer health recalculation, notification dispatch, workflow trigger evaluation).
- **Real-Time**: WebSockets for live notifications, presence, and interactive AI agent streams.
