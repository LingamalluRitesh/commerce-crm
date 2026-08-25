import csv
import io
import json
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.customer import CustomerCreateRequest
from app.application.services.customer import CustomerService


class DataExchangeService:
    @staticmethod
    def export_customers_to_csv(customers: list[Any]) -> str:
        """Serialize a list of customer records into standardized CSV format."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "id",
                "name",
                "email",
                "phone",
                "status",
                "health_score",
                "lifetime_value",
                "created_at",
            ]
        )
        for c in customers:
            writer.writerow(
                [
                    str(c.id),
                    c.name,
                    c.email,
                    c.phone or "",
                    c.status,
                    c.health_score,
                    float(c.lifetime_value or 0),
                    c.created_at.isoformat() if c.created_at else "",
                ]
            )
        return output.getvalue()

    @staticmethod
    async def import_customers_from_csv(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        csv_content: str,
        dry_run: bool = False,
    ) -> dict[str, Any]:
        """Stream and ingest customer CSV batch with schema validation and dry-run safety."""
        reader = csv.DictReader(io.StringIO(csv_content.strip()))
        imported_count = 0
        validation_errors = []

        for row_idx, row in enumerate(reader, start=1):
            email = row.get("email", "").strip()
            name = row.get("name", "").strip()
            phone = row.get("phone", "").strip() or None

            if not email or not name:
                validation_errors.append(
                    {
                        "row": row_idx,
                        "error": "Missing required fields 'email' or 'name'",
                    }
                )
                continue

            if not dry_run:
                try:
                    await CustomerService.create_customer(
                        db=db,
                        tenant_id=tenant_id,
                        actor_id=actor_id,
                        data=CustomerCreateRequest(
                            email=email,
                            first_name=name.split()[0] if name.split() else name,
                            last_name=name.split()[1] if len(name.split()) > 1 else "Account",
                            phone=phone,
                        ),
                    )
                    imported_count += 1
                except Exception as exc:
                    validation_errors.append({"row": row_idx, "error": str(exc)})
            else:
                imported_count += 1

        return {
            "dry_run": dry_run,
            "total_rows_processed": imported_count + len(validation_errors),
            "successfully_imported": imported_count,
            "errors": validation_errors,
        }

    @staticmethod
    def export_dataset_json(data: list[dict[str, Any]]) -> str:
        """Export dataset as formatted JSON."""
        return json.dumps(data, indent=2, default=str)
