# CommerceCRM — Enterprise User Manual & Operating Guide

**Version**: 2.4.0-Enterprise  
**Scope**: Multi-Tenant CRM, Omnichannel E-Commerce, AI Platform & Operations  

---

## 1. Identity & Multi-Tenancy Navigation

CommerceCRM enforces strict cryptographic multi-tenancy. Every request is isolated at the tenant organization boundary:

- **Workspace Switching**: Use the header workspace selector to switch between parent organizations and regional branch workspaces.
- **Role-Based Access Control (RBAC)**: Custom roles (`Admin`, `Sales Executive`, `Support Agent`, `Finance Officer`) control menu accessibility and mutation privileges.
- **Two-Factor Authentication (2FA)**: Provision TOTP authentication via Google Authenticator or 1Password in `Settings -> Security`.

---

## 2. Customer 360 & Account Management

The Customer 360 workspace provides a unified real-time record of all interactions:

- **Customer Health Scores**: Computed via heuristics evaluating recent purchases, open support tickets, CSAT scores, and invoice payment timeliness.
  - **80 – 100**: Healthy & Optimal (VIP retention profile)
  - **60 – 79**: Neutral / Stable
  - **< 60**: Churn Risk (Triggers automated workflow escalation)
- **Interaction Timeline**: Consolidated omnichannel log including Executive QBRs, Call summaries, Email deliveries, Order shipments, and Payment receipts.

---

## 3. CRM Sales Pipeline & Deal Automation

Manage B2B deal flow across customizable multi-stage funnels:

1. **Lead Qualification**: Inbound leads receive automated propensity conversion scoring (0–100%).
2. **Lead Conversion**: Convert qualified leads into Customer accounts, Contacts, and active Pipeline Deals in a single atomic transaction.
3. **Interactive Kanban**: Drag and drop deals across pipeline stages (`Discovery`, `Qualified`, `Proposal`, `Negotiation`, `Closed-Won`).
4. **Commercial Quotation Builder**: Create itemized formal quotes with automated volume tier discounts, tax rates, and instant PDF rendering.

---

## 4. Omnichannel Commerce & Order Lifecycle

The Commerce module manages product catalogs, stock reservations, checkout, and strict order state progression:

```
[CREATED] ➔ [PAYMENT_PENDING] ➔ [PAID] ➔ [PROCESSING] ➔ [SHIPPED] ➔ [DELIVERED]
```

- **Variant Matrices**: Configure multi-dimensional product variations (Size, Color, Voltage, Storage Capacity).
- **Payment Settlement**: Pluggable support for Stripe, PayPal, Authorize.Net, and B2B Wire Transfers.
- **Refund Management**: Process full or partial refunds with automatic ledger adjustments and customer lifetime value updates.

---

## 5. Multi-Warehouse Inventory & Fulfillment

Manage multi-location inventory with immutable stock ledger accuracy:

- **Stock Reservation**: Inventory is reserved upon cart checkout and deducted upon shipment dispatch.
- **Stock Movement Audits**: Every stock increase, transfer, or write-off is logged in an immutable `StockMovement` ledger.
- **Inter-Warehouse Transfers**: Move inventory between global hubs with transit tracking codes.
- **Purchase Orders**: Manage supplier procurement with goods receipt verification.

---

## 6. Customer Support, SLAs & Success Plans

Deliver tier-1 enterprise customer support backed by strict SLA guarantees:

- **Automated Priority SLAs**:
  - **Urgent**: 4-hour resolution SLA deadline
  - **High**: 12-hour resolution SLA deadline
  - **Medium**: 24-hour resolution SLA deadline
  - **Low**: 48-hour resolution SLA deadline
- **Internal Staff Notes**: Collaborate privately on ticket threads with yellow privacy banners.
- **CSAT Feedback Loops**: Resolved tickets prompt 1–5 customer satisfaction ratings that directly update the Customer Health Score.
- **Customer Success Plans**: Track multi-milestone strategic onboarding roadmaps with percentage completion meters.

---

## 7. Finance, Commercial Invoicing & SaaS Subscriptions

- **Commercial Invoices**: Itemized Decimal arithmetic with line-item discounts and local tax calculations.
- **Recurring SaaS Billing**: Automated billing cycles (`Monthly`, `Quarterly`, `Annual`) with period start and end dates.
- **Project Budget & Time Tracking**: Track billable consulting hours against fixed project capital budgets.

---

## 8. Workflow Automation Studio

Design automated event-driven business workflows:

- **Triggers**: Domain events (`order.placed.v1`, `lead.created`, `ticket.sla_breach`).
- **Condition Nodes**: Rule evaluation with logical comparators (`>`, `<`, `==`, `in`).
- **Action Nodes**: Automated email dispatch, notification alerts, customer health mutations, and webhook triggers.

---

## 9. AI Intelligence & Vector Search

- **Dense Vector Search**: Natural language semantic search across unstructured documentation and ticket threads using cosine similarity.
- **Lead Propensity Predictor**: ML conversion probability analysis with factor explanations.
- **NLP Sentiment Analysis**: Instant customer text sentiment scoring and automated action item extraction.
- **AI Deal Copilot**: Next-best action suggestions to accelerate closed-won deal velocities.
