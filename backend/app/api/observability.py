from collections import defaultdict

from fastapi import APIRouter, Response

router = APIRouter()

# In-memory Prometheus metric accumulators
REQUEST_COUNTS: dict[str, int] = defaultdict(int)
REQUEST_LATENCIES: dict[str, list[float]] = defaultdict(list)
EVENT_COUNTS: dict[str, int] = defaultdict(int)


def record_request_metric(method: str, endpoint: str, status_code: int, duration_sec: float):
    key = f'method="{method}",endpoint="{endpoint}",status="{status_code}"'
    REQUEST_COUNTS[key] += 1
    REQUEST_LATENCIES[f'endpoint="{endpoint}"'].append(duration_sec)


def record_event_metric(event_type: str):
    EVENT_COUNTS[event_type] += 1


@router.get("/metrics")
async def prometheus_metrics_endpoint() -> Response:
    """Expose Prometheus formatted application & system metrics."""
    lines = [
        "# HELP http_requests_total Total number of HTTP requests processed",
        "# TYPE http_requests_total counter",
    ]
    for labels, count in REQUEST_COUNTS.items():
        lines.append(f"http_requests_total{{{labels}}} {count}")

    lines.extend(
        [
            "# HELP http_request_duration_seconds_sum Total request latency sum in seconds",
            "# TYPE http_request_duration_seconds_sum counter",
        ]
    )
    for labels, latencies in REQUEST_LATENCIES.items():
        total_lat = sum(latencies)
        lines.append(f"http_request_duration_seconds_sum{{{labels}}} {total_lat:.6f}")
        lines.append(f"http_request_duration_seconds_count{{{labels}}} {len(latencies)}")

    lines.extend(
        [
            "# HELP domain_events_published_total Total domain events published across event bus",
            "# TYPE domain_events_published_total counter",
        ]
    )
    for event_type, count in EVENT_COUNTS.items():
        lines.append(f'domain_events_published_total{{event_type="{event_type}"}} {count}')

    content = "\n".join(lines) + "\n"
    return Response(content=content, media_type="text/plain; version=0.0.4")
