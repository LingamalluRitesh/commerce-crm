"""
Prometheus E-Commerce & CRM Telemetry Exporter.
Tracks order throughput, GMV revenue counters, and checkout conversion latencies.
"""

from typing import Dict, List, Any
import time


class CrmTelemetryRegistry:
    """Collects real-time commerce events and outputs Prometheus exposition metrics."""

    def __init__(self):
        self.orders_total: Dict[str, int] = {}  # status -> count
        self.gross_merchandise_value_total: float = 0.0
        self.checkout_latencies_ms: List[float] = []

    def record_order(self, status: str, order_value: float, latency_ms: float) -> None:
        self.orders_total[status] = self.orders_total.get(status, 0) + 1
        if status == "COMPLETED":
            self.gross_merchandise_value_total += order_value
        self.checkout_latencies_ms.append(latency_ms)

    def get_summary(self) -> Dict[str, Any]:
        total_orders = sum(self.orders_total.values())
        avg_lat = sum(self.checkout_latencies_ms) / len(self.checkout_latencies_ms) if self.checkout_latencies_ms else 0.0

        return {
            "total_orders": total_orders,
            "status_breakdown": self.orders_total,
            "gmv_total": round(self.gross_merchandise_value_total, 2),
            "avg_checkout_latency_ms": round(avg_lat, 2),
        }

    def export_prometheus(self) -> str:
        lines = [
            "# HELP commerce_orders_total Total customer orders processed",
            "# TYPE commerce_orders_total counter",
        ]
        for status, count in self.orders_total.items():
            lines.append(f'commerce_orders_total{{status="{status}"}} {count}')

        lines.extend([
            "# HELP commerce_gmv_total Gross merchandise value in base currency",
            "# TYPE commerce_gmv_total counter",
            f"commerce_gmv_total {round(self.gross_merchandise_value_total, 2)}",
        ])

        return "\n".join(lines) + "\n"
