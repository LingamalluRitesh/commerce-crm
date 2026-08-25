import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.workflow import (
    WorkflowCreateRequest,
    WorkflowExecutionResponse,
    WorkflowNodeResponse,
    WorkflowResponse,
)
from app.application.services.audit import AuditService
from app.core.errors import NotFoundError
from app.infrastructure.models.customer import Customer
from app.infrastructure.models.workflow import (
    Workflow,
    WorkflowExecution,
    WorkflowNode,
)


class WorkflowService:
    @staticmethod
    async def create_workflow(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: WorkflowCreateRequest,
    ) -> WorkflowResponse:
        workflow = Workflow(
            tenant_id=tenant_id,
            name=data.name.strip(),
            description=data.description,
            trigger_type=data.trigger_type,
            trigger_config=data.trigger_config or {},
            status="active",
        )
        db.add(workflow)
        await db.flush()

        nodes = []
        for idx, n in enumerate(data.nodes):
            node = WorkflowNode(
                tenant_id=tenant_id,
                workflow_id=workflow.id,
                node_type=n.node_type,
                name=n.name.strip(),
                config=n.config,
                order_index=idx,
            )
            db.add(node)
            nodes.append(node)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="workflow:created",
            entity_type="Workflow",
            entity_id=str(workflow.id),
            new_values={"name": workflow.name, "nodes_count": len(nodes)},
        )

        return await WorkflowService.get_workflow(db, tenant_id, workflow.id)

    @staticmethod
    async def get_workflow(
        db: AsyncSession, tenant_id: uuid.UUID, workflow_id: uuid.UUID
    ) -> WorkflowResponse:
        db.expire_all()
        res = await db.execute(
            select(Workflow)
            .where(Workflow.id == workflow_id, Workflow.tenant_id == tenant_id)
            .options(selectinload(Workflow.nodes))
        )
        wf = res.scalar_one_or_none()
        if not wf:
            raise NotFoundError("Workflow", workflow_id)

        return WorkflowResponse(
            id=wf.id,
            tenant_id=wf.tenant_id,
            name=wf.name,
            description=wf.description,
            trigger_type=wf.trigger_type,
            trigger_config=wf.trigger_config,
            status=wf.status,
            execution_count=wf.execution_count,
            last_executed_at=wf.last_executed_at,
            nodes=[WorkflowNodeResponse.model_validate(n) for n in wf.nodes],
            created_at=wf.created_at,
        )

    @staticmethod
    async def list_workflows(db: AsyncSession, tenant_id: uuid.UUID) -> list[WorkflowResponse]:
        query = (
            select(Workflow)
            .where(Workflow.tenant_id == tenant_id)
            .options(selectinload(Workflow.nodes))
            .order_by(Workflow.created_at.desc())
        )
        res = await db.execute(query)
        workflows = res.scalars().all()
        return [
            WorkflowResponse(
                id=w.id,
                tenant_id=w.tenant_id,
                name=w.name,
                description=w.description,
                trigger_type=w.trigger_type,
                trigger_config=w.trigger_config,
                status=w.status,
                execution_count=w.execution_count,
                last_executed_at=w.last_executed_at,
                nodes=[WorkflowNodeResponse.model_validate(n) for n in w.nodes],
                created_at=w.created_at,
            )
            for w in workflows
        ]

    @staticmethod
    async def execute_workflow(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        workflow_id: uuid.UUID,
        payload: dict,
    ) -> WorkflowExecutionResponse:
        res = await db.execute(
            select(Workflow)
            .where(Workflow.id == workflow_id, Workflow.tenant_id == tenant_id)
            .options(selectinload(Workflow.nodes))
        )
        wf = res.scalar_one_or_none()
        if not wf:
            raise NotFoundError("Workflow", workflow_id)

        now = datetime.now(UTC)
        execution = WorkflowExecution(
            tenant_id=tenant_id,
            workflow_id=wf.id,
            trigger_payload=payload,
            status="running",
            step_logs=[],
            started_at=now,
        )
        db.add(execution)
        await db.flush()

        step_logs = []
        try:
            for node in wf.nodes:
                step_log = {
                    "node_id": str(node.id),
                    "node_name": node.name,
                    "node_type": node.node_type,
                    "status": "success",
                    "timestamp": datetime.now(UTC).isoformat(),
                }

                # Evaluate Node Type
                if node.node_type == "condition":
                    field = node.config.get("field")
                    operator = node.config.get("operator", "==")
                    target = node.config.get("value")
                    val = payload.get(field)

                    passed = False
                    if operator == "==" and val == target:
                        passed = True
                    elif operator == ">=" and val is not None and val >= target:
                        passed = True
                    elif operator == "<=" and val is not None and val <= target:
                        passed = True

                    step_log["condition_passed"] = passed
                    if not passed:
                        step_log["message"] = "Condition failed; halting workflow branch."
                        step_logs.append(step_log)
                        break

                elif node.node_type == "action":
                    action_name = node.config.get("action")
                    if action_name == "update_health_score" and "customer_id" in payload:
                        cust_id = uuid.UUID(payload["customer_id"])
                        cust_res = await db.execute(
                            select(Customer).where(
                                Customer.id == cust_id, Customer.tenant_id == tenant_id
                            )
                        )
                        cust = cust_res.scalar_one_or_none()
                        if cust:
                            delta = node.config.get("score_delta", 5)
                            cust.health_score = max(0, min(100, cust.health_score + delta))
                            step_log["action_result"] = (
                                f"Customer health score updated to {cust.health_score}"
                            )

                    elif action_name == "send_notification":
                        tmpl = node.config.get("template", "Default")
                        step_log["action_result"] = f"Notification dispatched: {tmpl}"

                step_logs.append(step_log)

            execution.status = "completed"
            execution.step_logs = step_logs
            execution.completed_at = datetime.now(UTC)

            wf.execution_count += 1
            wf.last_executed_at = datetime.now(UTC)
            await db.flush()

        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)
            execution.completed_at = datetime.now(UTC)
            await db.flush()

        return WorkflowExecutionResponse.model_validate(execution)

    @staticmethod
    async def list_executions(
        db: AsyncSession, tenant_id: uuid.UUID, workflow_id: uuid.UUID
    ) -> list[WorkflowExecutionResponse]:
        res = await db.execute(
            select(WorkflowExecution)
            .where(
                WorkflowExecution.tenant_id == tenant_id,
                WorkflowExecution.workflow_id == workflow_id,
            )
            .order_by(WorkflowExecution.started_at.desc())
        )
        return [WorkflowExecutionResponse.model_validate(e) for e in res.scalars().all()]
