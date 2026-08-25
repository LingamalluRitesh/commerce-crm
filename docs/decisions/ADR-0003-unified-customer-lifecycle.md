# ADR-0003: Unified Customer Lifecycle Design Principle

## Status
Accepted

## Context
Traditional enterprise systems silo CRM, E-Commerce, Marketing, Inventory, and Support into disconnected applications, causing synchronization issues, duplicated data, and broken customer experiences.

## Decision
CommerceCRM establishes the **Unified Customer Lifecycle** as its central invariant:
`CUSTOMER -> INTERACTION -> SALES -> COMMERCE -> DELIVERY -> SUPPORT -> SUCCESS -> RETENTION -> EXPANSION`

1. The `Customer` entity in Customer 360 serves as the primary aggregate anchor across Sales, Commerce, Support, and Marketing.
2. Changes in one domain trigger domain events (e.g., `OrderCompleted`, `DealWon`, `TicketCreated`, `InvoicePaid`) to keep Customer Health and Customer Timeline automatically updated without duplicating relational storage.

## Consequences
- **Positive**: Single source of truth for customer context, AI models gain complete contextual awareness, eliminated data synchronization lag.
- **Negative**: Requires well-defined domain event contracts and transactional outbox handling.
