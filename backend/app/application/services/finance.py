import secrets
import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.finance import (
    CreditNoteResponse,
    InvoiceCreateRequest,
    InvoiceItemResponse,
    InvoicePayRequest,
    InvoiceResponse,
    ProjectCreateRequest,
    ProjectResponse,
    ProjectTaskCreateRequest,
    ProjectTaskResponse,
    SubscriptionCreateRequest,
    SubscriptionResponse,
    TimeEntryCreateRequest,
    TimeEntryResponse,
)
from app.application.services.audit import AuditService
from app.core.errors import ConflictError, NotFoundError
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.customer import Customer
from app.infrastructure.models.finance import (
    Invoice,
    InvoiceItem,
    Project,
    ProjectTask,
    Subscription,
    TimeEntry,
)


class InvoiceService:
    @staticmethod
    async def create_invoice(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: InvoiceCreateRequest,
    ) -> InvoiceResponse:
        # Validate Customer
        cust_res = await db.execute(
            select(Customer).where(Customer.id == data.customer_id, Customer.tenant_id == tenant_id)
        )
        if not cust_res.scalar_one_or_none():
            raise NotFoundError("Customer", data.customer_id)

        # Compute Line Items
        subtotal = Decimal("0.00")
        for it in data.items:
            subtotal += it.unit_price * Decimal(str(it.quantity))

        tax_amount = subtotal * (data.tax_rate_percent / Decimal("100.00"))
        total_amount = subtotal + tax_amount

        invoice_num = f"INV-{datetime.now(UTC).strftime('%Y%m%d')}-{secrets.token_hex(2).upper()}"

        invoice = Invoice(
            tenant_id=tenant_id,
            customer_id=data.customer_id,
            order_id=data.order_id,
            invoice_number=invoice_num,
            status="sent",
            issue_date=datetime.now(UTC),
            due_date=data.due_date,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            paid_amount=Decimal("0.00"),
            currency="USD",
        )
        db.add(invoice)
        await db.flush()

        inv_items = []
        for it in data.items:
            item_total = it.unit_price * Decimal(str(it.quantity))
            item = InvoiceItem(
                tenant_id=tenant_id,
                invoice_id=invoice.id,
                description=it.description,
                quantity=it.quantity,
                unit_price=it.unit_price,
                total_price=item_total,
            )
            db.add(item)
            inv_items.append(item)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="invoice:created",
            entity_type="Invoice",
            entity_id=str(invoice.id),
            new_values={
                "invoice_number": invoice.invoice_number,
                "total_amount": str(invoice.total_amount),
            },
        )

        await event_bus.publish(
            DomainEvent(
                event_type="invoice.created.v1",
                tenant_id=tenant_id,
                aggregate_type="Invoice",
                aggregate_id=invoice.id,
                payload={
                    "invoice_number": invoice.invoice_number,
                    "total_amount": str(invoice.total_amount),
                },
            )
        )

        return await InvoiceService.get_invoice(db, tenant_id, invoice.id)

    @staticmethod
    async def get_invoice(
        db: AsyncSession, tenant_id: uuid.UUID, invoice_id: uuid.UUID
    ) -> InvoiceResponse:
        db.expire_all()
        res = await db.execute(
            select(Invoice)
            .where(Invoice.id == invoice_id, Invoice.tenant_id == tenant_id)
            .options(selectinload(Invoice.items), selectinload(Invoice.credit_notes))
        )
        inv = res.scalar_one_or_none()
        if not inv:
            raise NotFoundError("Invoice", invoice_id)

        return InvoiceResponse(
            id=inv.id,
            tenant_id=inv.tenant_id,
            customer_id=inv.customer_id,
            order_id=inv.order_id,
            invoice_number=inv.invoice_number,
            status=inv.status,
            issue_date=inv.issue_date,
            due_date=inv.due_date,
            subtotal=inv.subtotal,
            tax_amount=inv.tax_amount,
            total_amount=inv.total_amount,
            paid_amount=inv.paid_amount,
            currency=inv.currency,
            items=[InvoiceItemResponse.model_validate(i) for i in inv.items],
            credit_notes=[CreditNoteResponse.model_validate(cn) for cn in inv.credit_notes],
            created_at=inv.created_at,
        )

    @staticmethod
    async def pay_invoice(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        invoice_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: InvoicePayRequest,
    ) -> InvoiceResponse:
        res = await db.execute(
            select(Invoice).where(Invoice.id == invoice_id, Invoice.tenant_id == tenant_id)
        )
        inv = res.scalar_one_or_none()
        if not inv:
            raise NotFoundError("Invoice", invoice_id)

        if inv.status == "paid":
            raise ConflictError("Invoice is already fully paid.")

        inv.paid_amount += data.amount
        if inv.paid_amount >= inv.total_amount:
            inv.status = "paid"

        # Update Customer Lifetime Value if not attached to Order (to avoid double count)
        if not inv.order_id:
            cust_res = await db.execute(
                select(Customer).where(
                    Customer.id == inv.customer_id, Customer.tenant_id == tenant_id
                )
            )
            customer = cust_res.scalar_one_or_none()
            if customer:
                customer.lifetime_value += data.amount

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="invoice:payment_received",
            entity_type="Invoice",
            entity_id=str(inv.id),
            new_values={"paid_amount": str(inv.paid_amount), "status": inv.status},
        )

        return await InvoiceService.get_invoice(db, tenant_id, inv.id)

    @staticmethod
    async def list_invoices(db: AsyncSession, tenant_id: uuid.UUID) -> list[InvoiceResponse]:
        query = (
            select(Invoice)
            .where(Invoice.tenant_id == tenant_id)
            .order_by(Invoice.created_at.desc())
        )
        res = await db.execute(query)
        invoices = res.scalars().all()
        return [await InvoiceService.get_invoice(db, tenant_id, i.id) for i in invoices]


class SubscriptionService:
    @staticmethod
    async def create_subscription(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: SubscriptionCreateRequest,
    ) -> SubscriptionResponse:
        cust_res = await db.execute(
            select(Customer).where(Customer.id == data.customer_id, Customer.tenant_id == tenant_id)
        )
        if not cust_res.scalar_one_or_none():
            raise NotFoundError("Customer", data.customer_id)

        now = datetime.now(UTC)
        period_days = 365 if data.billing_interval == "annual" else 30
        period_end = now + timedelta(days=period_days)

        sub = Subscription(
            tenant_id=tenant_id,
            customer_id=data.customer_id,
            plan_name=data.plan_name.strip(),
            status="active",
            billing_interval=data.billing_interval,
            amount=data.amount,
            currency="USD",
            current_period_start=now,
            current_period_end=period_end,
        )
        db.add(sub)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="subscription:created",
            entity_type="Subscription",
            entity_id=str(sub.id),
            new_values={"plan": sub.plan_name, "amount": str(sub.amount)},
        )

        return SubscriptionResponse.model_validate(sub)

    @staticmethod
    async def list_subscriptions(
        db: AsyncSession, tenant_id: uuid.UUID
    ) -> list[SubscriptionResponse]:
        res = await db.execute(
            select(Subscription)
            .where(Subscription.tenant_id == tenant_id)
            .order_by(Subscription.created_at.desc())
        )
        return [SubscriptionResponse.model_validate(s) for s in res.scalars().all()]


class ProjectService:
    @staticmethod
    async def create_project(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: ProjectCreateRequest,
    ) -> ProjectResponse:
        project = Project(
            tenant_id=tenant_id,
            customer_id=data.customer_id,
            name=data.name.strip(),
            status="planning",
            budget_amount=data.budget_amount,
            spent_amount=Decimal("0.00"),
            start_date=datetime.now(UTC),
            target_end_date=data.target_end_date,
        )
        db.add(project)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="project:created",
            entity_type="Project",
            entity_id=str(project.id),
            new_values={"name": project.name, "budget": str(project.budget_amount)},
        )

        return await ProjectService.get_project(db, tenant_id, project.id)

    @staticmethod
    async def get_project(
        db: AsyncSession, tenant_id: uuid.UUID, project_id: uuid.UUID
    ) -> ProjectResponse:
        db.expire_all()
        res = await db.execute(
            select(Project)
            .where(Project.id == project_id, Project.tenant_id == tenant_id)
            .options(selectinload(Project.tasks))
        )
        p = res.scalar_one_or_none()
        if not p:
            raise NotFoundError("Project", project_id)

        return ProjectResponse(
            id=p.id,
            tenant_id=p.tenant_id,
            customer_id=p.customer_id,
            name=p.name,
            status=p.status,
            budget_amount=p.budget_amount,
            spent_amount=p.spent_amount,
            start_date=p.start_date,
            target_end_date=p.target_end_date,
            tasks=[ProjectTaskResponse.model_validate(t) for t in p.tasks],
            created_at=p.created_at,
        )

    @staticmethod
    async def create_task(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        project_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: ProjectTaskCreateRequest,
    ) -> ProjectTaskResponse:
        p_res = await db.execute(
            select(Project).where(Project.id == project_id, Project.tenant_id == tenant_id)
        )
        if not p_res.scalar_one_or_none():
            raise NotFoundError("Project", project_id)

        task = ProjectTask(
            tenant_id=tenant_id,
            project_id=project_id,
            title=data.title.strip(),
            description=data.description,
            status="todo",
            priority=data.priority,
            estimated_hours=data.estimated_hours,
            logged_hours=Decimal("0.00"),
            assigned_to_user_id=data.assigned_to_user_id,
            due_date=data.due_date,
        )
        db.add(task)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="task:created",
            entity_type="ProjectTask",
            entity_id=str(task.id),
            new_values={"title": task.title},
        )

        return ProjectTaskResponse.model_validate(task)

    @staticmethod
    async def log_time(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        user_id: uuid.UUID,
        data: TimeEntryCreateRequest,
    ) -> TimeEntryResponse:
        p_res = await db.execute(
            select(Project).where(Project.id == data.project_id, Project.tenant_id == tenant_id)
        )
        project = p_res.scalar_one_or_none()
        if not project:
            raise NotFoundError("Project", data.project_id)

        entry = TimeEntry(
            tenant_id=tenant_id,
            project_id=data.project_id,
            task_id=data.task_id,
            user_id=user_id,
            hours=data.hours,
            billable=data.billable,
            hourly_rate=data.hourly_rate,
            description=data.description,
            entry_date=datetime.now(UTC),
        )
        db.add(entry)

        # Update task logged hours if linked
        if data.task_id:
            t_res = await db.execute(
                select(ProjectTask).where(
                    ProjectTask.id == data.task_id, ProjectTask.tenant_id == tenant_id
                )
            )
            task = t_res.scalar_one_or_none()
            if task:
                task.logged_hours += data.hours

        # Update project spent amount
        cost = data.hours * data.hourly_rate
        project.spent_amount += cost
        await db.flush()

        return TimeEntryResponse.model_validate(entry)

    @staticmethod
    async def list_projects(db: AsyncSession, tenant_id: uuid.UUID) -> list[ProjectResponse]:
        query = (
            select(Project)
            .where(Project.tenant_id == tenant_id)
            .order_by(Project.created_at.desc())
        )
        res = await db.execute(query)
        projects = res.scalars().all()
        return [await ProjectService.get_project(db, tenant_id, p.id) for p in projects]
