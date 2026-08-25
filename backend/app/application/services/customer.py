import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.customer import (
    AddressCreateRequest,
    AddressResponse,
    CompanyCreateRequest,
    CompanyResponse,
    ContactResponse,
    Customer360Response,
    CustomerCreateRequest,
    CustomerPreferenceResponse,
    CustomerResponse,
    CustomerUpdateRequest,
    InteractionCreateRequest,
    InteractionResponse,
)
from app.application.services.audit import AuditService
from app.core.errors import ConflictError, NotFoundError
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.customer import (
    Address,
    Company,
    Customer,
    CustomerPreference,
    Interaction,
)


class CustomerService:
    @staticmethod
    async def create_customer(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: CustomerCreateRequest,
    ) -> CustomerResponse:
        # 1. Check duplicate email in this tenant
        existing = await db.execute(
            select(Customer).where(
                Customer.tenant_id == tenant_id, Customer.email == data.email.lower()
            )
        )
        if existing.scalar_one_or_none():
            raise ConflictError(
                f"Customer with email '{data.email}' already exists in organization."
            )

        # 2. Verify Company if provided
        if data.company_id:
            comp_res = await db.execute(
                select(Company).where(Company.id == data.company_id, Company.tenant_id == tenant_id)
            )
            if not comp_res.scalar_one_or_none():
                raise NotFoundError("Company", data.company_id)

        # 3. Create Customer
        customer = Customer(
            tenant_id=tenant_id,
            company_id=data.company_id,
            type=data.type,
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            email=data.email.lower(),
            phone=data.phone,
            status=data.status,
            health_score=100,
            custom_attributes=data.custom_attributes or {},
        )
        db.add(customer)
        await db.flush()

        # 4. Create default preferences
        pref = CustomerPreference(
            tenant_id=tenant_id,
            customer_id=customer.id,
            email_opt_in=True,
            sms_opt_in=False,
            preferred_channel="email",
            language="en",
            timezone="UTC",
        )
        db.add(pref)
        await db.flush()

        # 5. Audit Log
        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="customer:created",
            entity_type="Customer",
            entity_id=str(customer.id),
            new_values={
                "email": customer.email,
                "name": f"{customer.first_name} {customer.last_name}",
            },
        )

        # 6. Publish Domain Event
        await event_bus.publish(
            DomainEvent(
                event_type="customer.created.v1",
                tenant_id=tenant_id,
                aggregate_type="Customer",
                aggregate_id=customer.id,
                payload={
                    "customer_id": str(customer.id),
                    "email": customer.email,
                    "name": f"{customer.first_name} {customer.last_name}",
                },
            )
        )

        return CustomerResponse.model_validate(customer)

    @staticmethod
    async def get_customer(
        db: AsyncSession, tenant_id: uuid.UUID, customer_id: uuid.UUID
    ) -> Customer:
        res = await db.execute(
            select(Customer).where(Customer.id == customer_id, Customer.tenant_id == tenant_id)
        )
        customer = res.scalar_one_or_none()
        if not customer:
            raise NotFoundError("Customer", customer_id)
        return customer

    @staticmethod
    async def get_customer_360(
        db: AsyncSession, tenant_id: uuid.UUID, customer_id: uuid.UUID
    ) -> Customer360Response:
        query = (
            select(Customer)
            .where(Customer.id == customer_id, Customer.tenant_id == tenant_id)
            .options(
                selectinload(Customer.company),
                selectinload(Customer.contacts),
                selectinload(Customer.addresses),
                selectinload(Customer.interactions),
                selectinload(Customer.preference),
            )
        )
        res = await db.execute(query)
        customer = res.scalar_one_or_none()
        if not customer:
            raise NotFoundError("Customer", customer_id)

        # Compute summary metrics dynamically
        summary_metrics = {
            "lifetime_value": float(customer.lifetime_value),
            "health_score": customer.health_score,
            "total_interactions": len(customer.interactions),
            "status": customer.status,
        }

        return Customer360Response(
            customer=CustomerResponse.model_validate(customer),
            company=CompanyResponse.model_validate(customer.company) if customer.company else None,
            contacts=[ContactResponse.model_validate(c) for c in customer.contacts],
            addresses=[AddressResponse.model_validate(a) for a in customer.addresses],
            recent_interactions=[
                InteractionResponse.model_validate(i)
                for i in sorted(customer.interactions, key=lambda x: x.created_at, reverse=True)[
                    :10
                ]
            ],
            preference=CustomerPreferenceResponse.model_validate(customer.preference)
            if customer.preference
            else None,
            summary_metrics=summary_metrics,
        )

    @staticmethod
    async def list_customers(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        query_str: str | None = None,
        status_filter: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[CustomerResponse], int]:
        stmt = select(Customer).where(Customer.tenant_id == tenant_id)

        if status_filter:
            stmt = stmt.where(Customer.status == status_filter)

        if query_str:
            pattern = f"%{query_str}%"
            stmt = stmt.where(
                or_(
                    Customer.first_name.ilike(pattern),
                    Customer.last_name.ilike(pattern),
                    Customer.email.ilike(pattern),
                    Customer.phone.ilike(pattern),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await db.execute(count_stmt)
        total = total_res.scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.order_by(Customer.created_at.desc()).offset(offset).limit(page_size)
        res = await db.execute(stmt)
        customers = res.scalars().all()

        return [CustomerResponse.model_validate(c) for c in customers], total

    @staticmethod
    async def update_customer(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        customer_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: CustomerUpdateRequest,
    ) -> CustomerResponse:
        customer = await CustomerService.get_customer(db, tenant_id, customer_id)

        old_vals = {}
        new_vals = {}

        if data.first_name is not None:
            old_vals["first_name"] = customer.first_name
            customer.first_name = data.first_name
            new_vals["first_name"] = data.first_name

        if data.last_name is not None:
            old_vals["last_name"] = customer.last_name
            customer.last_name = data.last_name
            new_vals["last_name"] = data.last_name

        if data.email is not None:
            old_vals["email"] = customer.email
            customer.email = data.email.lower()
            new_vals["email"] = data.email.lower()

        if data.phone is not None:
            old_vals["phone"] = customer.phone
            customer.phone = data.phone
            new_vals["phone"] = data.phone

        if data.status is not None:
            old_vals["status"] = customer.status
            customer.status = data.status
            new_vals["status"] = data.status

        if data.health_score is not None:
            old_vals["health_score"] = customer.health_score
            customer.health_score = data.health_score
            new_vals["health_score"] = data.health_score

        if data.custom_attributes is not None:
            old_vals["custom_attributes"] = customer.custom_attributes
            customer.custom_attributes = data.custom_attributes
            new_vals["custom_attributes"] = data.custom_attributes

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="customer:updated",
            entity_type="Customer",
            entity_id=str(customer.id),
            old_values=old_vals,
            new_values=new_vals,
        )

        return CustomerResponse.model_validate(customer)

    @staticmethod
    async def add_interaction(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        customer_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: InteractionCreateRequest,
    ) -> InteractionResponse:
        # Verify customer
        await CustomerService.get_customer(db, tenant_id, customer_id)

        interaction = Interaction(
            tenant_id=tenant_id,
            customer_id=customer_id,
            contact_id=data.contact_id,
            channel=data.channel,
            direction=data.direction,
            subject=data.subject,
            body=data.body,
            sentiment=data.sentiment,
            interaction_metadata=data.interaction_metadata or {},
        )
        db.add(interaction)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="interaction:logged",
            entity_type="Interaction",
            entity_id=str(interaction.id),
            new_values={
                "customer_id": str(customer_id),
                "channel": data.channel,
                "subject": data.subject,
            },
        )

        return InteractionResponse.model_validate(interaction)

    @staticmethod
    async def add_address(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        customer_id: uuid.UUID,
        data: AddressCreateRequest,
    ) -> AddressResponse:
        await CustomerService.get_customer(db, tenant_id, customer_id)

        address = Address(
            tenant_id=tenant_id,
            customer_id=customer_id,
            type=data.type,
            line1=data.line1,
            line2=data.line2,
            city=data.city,
            state=data.state,
            postal_code=data.postal_code,
            country=data.country,
            is_default=data.is_default,
        )
        db.add(address)
        await db.flush()
        return AddressResponse.model_validate(address)

    @staticmethod
    async def create_company(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: CompanyCreateRequest,
    ) -> CompanyResponse:
        company = Company(
            tenant_id=tenant_id,
            name=data.name.strip(),
            domain=data.domain,
            industry=data.industry,
            size=data.size,
            annual_revenue=data.annual_revenue,
            phone=data.phone,
            website=data.website,
        )
        db.add(company)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="company:created",
            entity_type="Company",
            entity_id=str(company.id),
            new_values={"name": company.name},
        )

        return CompanyResponse.model_validate(company)

    @staticmethod
    async def list_companies(db: AsyncSession, tenant_id: uuid.UUID) -> list[CompanyResponse]:
        query = select(Company).where(Company.tenant_id == tenant_id).order_by(Company.name)
        res = await db.execute(query)
        return [CompanyResponse.model_validate(c) for c in res.scalars().all()]
