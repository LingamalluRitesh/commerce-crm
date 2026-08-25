# CommerceCRM — Domain Model Data Dictionary & Schema Reference

**Version**: 2.4.0-Enterprise  
**Database**: PostgreSQL 16 (Compatible with SQLite in-memory for testing)  
**ORM**: SQLAlchemy 2.0 Async (`DeclarativeBase`, `TenantBaseModel`)  

---

## 1. Multi-Tenancy & Base Models

All tenant entities inherit from `TenantBaseModel` providing:
- `id` (GUID / UUIDv4, Primary Key, indexed)
- `tenant_id` (GUID / UUIDv4, Foreign Key $\rightarrow$ `organizations.id`, Cascade Delete, indexed)
- `created_at` (TIMESTAMPTZ, default: `utcnow`)
- `updated_at` (TIMESTAMPTZ, onupdate: `utcnow`)

---

## 2. Entity Dictionary by Domain

### Domain 1: Identity & Multi-Tenancy
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `User` | `users` | `email`, `hashed_password`, `first_name`, `last_name`, `is_active`, `is_superuser`, `two_factor_secret`, `two_factor_enabled` | `memberships`, `audit_logs` |
| `Organization` | `organizations` | `name`, `slug`, `is_active`, `billing_tier`, `max_workspaces`, `max_users` | `workspaces`, `memberships`, `roles`, `teams` |
| `Workspace` | `workspaces` | `organization_id`, `name`, `slug`, `is_default` | Parent `organization` |
| `Role` | `roles` | `organization_id`, `name`, `description`, `is_system` | `permissions`, `memberships` |
| `Permission` | `permissions` | `name`, `resource`, `action`, `description` | `roles` |
| `Membership` | `memberships` | `organization_id`, `user_id`, `role_id`, `workspace_id`, `is_active` | `user`, `organization`, `role`, `workspace` |
| `AuditLog` | `audit_logs` | `tenant_id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent` | `user`, `tenant` |

### Domain 2: Customer 360 & Accounts
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Customer` | `customers` | `tenant_id`, `company_id`, `first_name`, `last_name`, `email`, `phone`, `health_score`, `lifetime_value`, `status` | `company`, `contacts`, `interactions`, `preferences`, `orders`, `tickets` |
| `Company` | `companies` | `tenant_id`, `name`, `domain`, `industry`, `tier`, `annual_revenue`, `employee_count` | `customers`, `deals` |
| `Contact` | `contacts` | `tenant_id`, `customer_id`, `first_name`, `last_name`, `email`, `phone`, `job_title`, `is_primary` | `customer` |
| `Interaction` | `interactions` | `tenant_id`, `customer_id`, `type` (call/email/meeting), `subject`, `notes`, `sentiment_score` | `customer` |
| `CustomerPreference` | `customer_preferences` | `tenant_id`, `customer_id`, `preferred_channel`, `marketing_opt_in`, `locale`, `currency` | `customer` |

### Domain 3: CRM Sales Pipeline
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Lead` | `leads` | `tenant_id`, `first_name`, `last_name`, `email`, `company_name`, `propensity_score`, `status`, `estimated_budget` | Converted $\rightarrow$ `Customer`, `Deal` |
| `Pipeline` | `pipelines` | `tenant_id`, `name`, `is_default`, `is_active` | `stages`, `deals` |
| `PipelineStage` | `pipeline_stages` | `pipeline_id`, `name`, `stage_order`, `win_probability`, `is_closed_won`, `is_closed_lost` | `pipeline`, `deals` |
| `Deal` | `deals` | `tenant_id`, `pipeline_id`, `stage_id`, `customer_id`, `name`, `amount`, `currency`, `probability_percentage`, `expected_close_date` | `pipeline`, `stage`, `customer`, `quotes` |
| `Quote` | `quotes` | `tenant_id`, `deal_id`, `quote_number`, `status`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `valid_until` | `deal`, `items` |
| `QuoteItem` | `quote_items` | `quote_id`, `description`, `quantity`, `unit_price`, `discount_percentage`, `total_amount` | `quote` |

### Domain 4: Commerce & Order Lifecycle
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Category` | `categories` | `tenant_id`, `name`, `slug`, `description`, `parent_id` | `products` |
| `Product` | `products` | `tenant_id`, `category_id`, `name`, `slug`, `sku`, `price`, `currency`, `is_active` | `category`, `variants`, `price_tiers` |
| `ProductVariant` | `product_variants` | `product_id`, `sku`, `name`, `attributes` (JSON), `price_adjustment`, `is_active` | `product` |
| `Cart` | `carts` | `tenant_id`, `customer_id`, `status` (active/abandoned/converted) | `items` |
| `CartItem` | `cart_items` | `cart_id`, `product_id`, `variant_id`, `quantity`, `unit_price` | `cart`, `product`, `variant` |
| `Order` | `orders` | `tenant_id`, `customer_id`, `order_number`, `status` (created/paid/shipped/delivered), `total_amount`, `currency` | `customer`, `items`, `payments`, `fulfillments` |
| `OrderItem` | `order_items` | `order_id`, `product_id`, `variant_id`, `sku`, `quantity`, `unit_price`, `total_amount` | `order`, `product` |
| `Payment` | `payments` | `tenant_id`, `order_id`, `gateway`, `transaction_id`, `amount`, `currency`, `status` | `order`, `refunds` |
| `Refund` | `refunds` | `tenant_id`, `payment_id`, `amount`, `reason`, `status` | `payment` |

### Domain 5: B2B Pricing Engine
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `PriceList` | `price_lists` | `tenant_id`, `name`, `code`, `currency`, `is_default` | `tiers` |
| `PriceTier` | `price_tiers` | `price_list_id`, `product_id`, `min_quantity`, `max_quantity`, `unit_price`, `discount_percentage` | `price_list`, `product` |

### Domain 6: Multi-Warehouse Inventory & Fulfillment
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Warehouse` | `warehouses` | `tenant_id`, `name`, `code`, `address_line1`, `city`, `country`, `is_active` | `stock_items`, `stock_transfers` |
| `StockItem` | `stock_items` | `warehouse_id`, `product_id`, `sku`, `quantity_on_hand`, `quantity_reserved`, `reorder_threshold` | `warehouse`, `product` |
| `StockMovement` | `stock_movements` | `stock_item_id`, `movement_type` (inbound/outbound/adjustment/transfer), `quantity`, `reference_id` | `stock_item` |
| `StockTransfer` | `stock_transfers` | `source_warehouse_id`, `dest_warehouse_id`, `status`, `tracking_number` | `source`, `destination`, `items` |
| `Supplier` | `suppliers` | `name`, `code`, `contact_name`, `email`, `phone`, `lead_time_days` | `purchase_orders` |
| `PurchaseOrder` | `purchase_orders` | `supplier_id`, `warehouse_id`, `po_number`, `status`, `total_amount` | `supplier`, `warehouse`, `items` |
| `Fulfillment` | `fulfillments` | `order_id`, `warehouse_id`, `carrier`, `tracking_code`, `status` | `order`, `warehouse` |

### Domain 7: Marketing Automation
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Segment` | `segments` | `name`, `rules` (JSON criteria), `is_dynamic` | `campaigns` |
| `Campaign` | `campaigns` | `name`, `channel` (email/sms/push), `segment_id`, `status`, `scheduled_at` | `segment`, `recipients` |
| `MessageTemplate` | `message_templates` | `name`, `channel`, `subject_template`, `body_template` | `campaigns` |
| `DiscountCode` | `discount_codes` | `code`, `discount_type` (percentage/fixed), `value`, `min_order_amount`, `valid_until` | Redemptions |

### Domain 8: Customer Support & Success
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Ticket` | `tickets` | `customer_id`, `ticket_number`, `subject`, `priority` (urgent/high/med/low), `sla_deadline`, `status`, `csat_score` | `customer`, `comments` |
| `TicketComment` | `ticket_comments` | `ticket_id`, `author_id`, `is_internal`, `content` | `ticket` |
| `KnowledgeArticle` | `knowledge_articles` | `title`, `slug`, `content_markdown`, `category`, `is_published` | Knowledge Base |
| `CustomerSuccessPlan`| `customer_success_plans`| `customer_id`, `title`, `target_date`, `status` | `milestones` |
| `SuccessMilestone` | `success_milestones` | `plan_id`, `title`, `due_date`, `is_completed` | `plan` |

### Domain 9: Finance & Project Delivery
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Invoice` | `invoices` | `customer_id`, `invoice_number`, `subtotal`, `tax_amount`, `total_amount`, `status`, `due_date` | `customer`, `items` |
| `InvoiceItem` | `invoice_items` | `invoice_id`, `description`, `quantity`, `unit_price`, `total_amount` | `invoice` |
| `Subscription` | `subscriptions` | `customer_id`, `plan_name`, `interval` (monthly/annual), `amount`, `status`, `period_end` | `customer` |
| `Project` | `projects` | `customer_id`, `name`, `budget_amount`, `spent_amount`, `status` | `tasks` |
| `ProjectTask` | `project_tasks` | `project_id`, `title`, `estimated_hours`, `logged_hours`, `status` | `project`, `time_entries` |
| `TimeEntry` | `time_entries` | `task_id`, `user_id`, `hours_spent`, `hourly_rate`, `is_billable` | `task`, `user` |

### Domain 10: Workflow Automation Studio
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Workflow` | `workflows` | `name`, `description`, `trigger_type`, `is_active` | `nodes`, `executions` |
| `WorkflowNode` | `workflow_nodes` | `workflow_id`, `node_type` (trigger/condition/action), `config` (JSON) | `workflow` |
| `WorkflowExecution` | `workflow_executions`| `workflow_id`, `status`, `step_logs` (JSON), `executed_at` | `workflow` |

### Domain 11: Unified Communication & Collaboration
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `Channel` | `channels` | `name`, `is_private`, `topic` | `members`, `messages` |
| `ChannelMember` | `channel_members` | `channel_id`, `user_id`, `role` | `channel`, `user` |
| `ChatMessage` | `chat_messages` | `channel_id`, `user_id`, `content`, `attachment_url` | `channel`, `user` |
| `Notification` | `notifications` | `user_id`, `type`, `title`, `body`, `is_read` | `user` |

### Domain 12: AI Intelligence & Vector Search
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `DocumentEmbedding`| `document_embeddings`| `entity_type`, `entity_id`, `content_text`, `dense_vector` (128-dim JSON float array) | Vector Index |
| `LeadScoringModel` | `lead_scoring_models` | `model_version`, `weights` (JSON), `accuracy_metric` | ML Models |
| `AIInteractionSummary`| `ai_interaction_summaries`| `interaction_id`, `summary_text`, `sentiment_polarity`, `action_items` (JSON) | Interactions |

### Domain 13: Transactional Outbox & Developer Platform
| Entity | Table Name | Key Attributes | Relationships |
|---|---|---|---|
| `OutboxMessage` | `outbox_messages` | `event_type`, `aggregate_type`, `aggregate_id`, `payload`, `status`, `retry_count` | Domain Event Bus |
| `ApiKey` | `api_keys` | `name`, `key_prefix`, `hashed_key` (SHA-256), `scopes` (JSON), `is_active`, `expires_at` | Tenant Auth |
| `WebhookSubscription`| `webhook_subscriptions`| `url`, `secret_token`, `events` (JSON), `is_active`, `retry_limit` | `deliveries` |
| `WebhookDelivery` | `webhook_deliveries` | `subscription_id`, `event_type`, `payload`, `status`, `status_code`, `response_body`, `duration_ms` | `subscription` |
