"""Automated Customer Retention Playbooks, Escalation Tiers & Health Recovery Engine.

Provides proactive churn mitigation:
- Health score degradation trigger matrix (Score < 50 triggers Level 1, Score < 30 triggers Level 2, Critical Escalation)
- Dynamic retention action playbooks (Feature enablement workshops, executive sponsor QBRs, custom SLA upgrade credits)
- Playbook ROI and account recovery tracking.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class PlaybookSeverity(str, Enum):
    PROACTIVE_HEALTH_NUDGE = "PROACTIVE_HEALTH_NUDGE"
    MODERATE_CHURN_RISK = "MODERATE_CHURN_RISK"
    CRITICAL_ACCOUNT_ESCALATION = "CRITICAL_ACCOUNT_ESCALATION"


@dataclass
class RetentionActionTask:
    task_id: str
    action_title: str
    assigned_role: str  # 'CSM', 'VP_CUSTOMER_SUCCESS', 'SOLUTIONS_ARCHITECT'
    due_within_days: int
    is_mandatory: bool = True


@dataclass
class TriggeredRetentionPlaybook:
    playbook_id: str
    customer_id: str
    account_name: str
    current_health_score: int
    severity: PlaybookSeverity
    playbook_title: str
    trigger_rationale: str
    action_tasks: List[RetentionActionTask]
    expected_mrr_at_risk_usd: Decimal
    is_active: bool = True


class RetentionPlaybookEngine:
    """Enterprise Customer Retention & Health Recovery Engine."""

    @classmethod
    def trigger_playbook_for_account(
        cls,
        customer_id: str,
        account_name: str,
        health_score: int,
        mrr_usd: Decimal,
        open_critical_tickets: int,
        past_due_invoices: int
    ) -> TriggeredRetentionPlaybook:
        """Evaluate account health telemetry and dispatch matching retention playbook."""
        if health_score < 30 or open_critical_tickets >= 3 or past_due_invoices >= 2:
            severity = PlaybookSeverity.CRITICAL_ACCOUNT_ESCALATION
            title = "CRITICAL EXECUTIVE INTERVENTION PLAYBOOK"
            rationale = f"Severe health degradation (Score: {health_score}, Tickets: {open_critical_tickets}, Unpaid Invoices: {past_due_invoices})"
            tasks = [
                RetentionActionTask("TSK-1", "Schedule Executive Sponsor alignment call within 24h", "VP_CUSTOMER_SUCCESS", 1),
                RetentionActionTask("TSK-2", "Deploy dedicated Solutions Architect on-site for technical diagnostics", "SOLUTIONS_ARCHITECT", 2),
                RetentionActionTask("TSK-3", "Issue 20% goodwill SLA service credit voucher", "CSM", 3),
            ]
        elif health_score < 60 or open_critical_tickets >= 1:
            severity = PlaybookSeverity.MODERATE_CHURN_RISK
            title = "HEALTH RECOVERY & ADOPTION PLAYBOOK"
            rationale = f"Moderate risk detected (Score: {health_score})"
            tasks = [
                RetentionActionTask("TSK-1", "Conduct quarterly Business Review (QBR) check-in", "CSM", 7),
                RetentionActionTask("TSK-2", "Deliver customized product feature training session", "SOLUTIONS_ARCHITECT", 10),
            ]
        else:
            severity = PlaybookSeverity.PROACTIVE_HEALTH_NUDGE
            title = "PROACTIVE CHAMPION NURTURE PLAYBOOK"
            rationale = "Account is healthy; engage for advocacy"
            tasks = [
                RetentionActionTask("TSK-1", "Request customer case study and NPS quote", "CSM", 30),
            ]

        return TriggeredRetentionPlaybook(
            playbook_id=f"PB-{customer_id[:8].upper()}-{severity.value[:4]}",
            customer_id=customer_id,
            account_name=account_name,
            current_health_score=health_score,
            severity=severity,
            playbook_title=title,
            trigger_rationale=rationale,
            action_tasks=tasks,
            expected_mrr_at_risk_usd=mrr_usd,
            is_active=True
        )
