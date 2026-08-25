"""REST API Endpoints for Double-Entry Accounting, General Ledger, and ASC 606 Revenue Recognition."""

from decimal import Decimal
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.domain.ledger.chart_of_accounts import (
    ChartOfAccountsRegistry, AccountNode, AccountType, NormalBalance
)
from app.domain.ledger.double_entry import (
    GeneralLedgerEngine, JournalEntry, JournalLine, UnbalancedJournalEntryError, InvalidAccountError
)
from app.domain.ledger.asc606_revenue_recognition import (
    ASC606RevenueEngine, CustomerContractASC606, PerformanceObligation,
    PerformanceObligationType, RecognitionMethod
)

router = APIRouter(prefix="/ledger", tags=["General Ledger & Financial Accounting"])


class JournalLineDTO(BaseModel):
    account_number: str
    debit_amount: Decimal = Decimal("0.00")
    credit_amount: Decimal = Decimal("0.00")
    currency: str = "USD"
    fx_rate_to_base: Decimal = Decimal("1.000000")
    memo: str = ""


class PostJournalEntryRequest(BaseModel):
    entry_id: str
    posting_date: str  # YYYY-MM-DD
    source_document: str
    description: str
    lines: List[JournalLineDTO]


class PerformanceObligationDTO(BaseModel):
    pbo_id: str
    obligation_type: PerformanceObligationType
    description: str
    standalone_selling_price: Decimal
    recognition_method: RecognitionMethod
    service_start_date: str
    service_end_date: str
    is_satisfied: bool = False
    satisfied_date: Optional[str] = None


class ContractASC606Request(BaseModel):
    contract_id: str
    customer_id: str
    contract_start_date: str
    contract_end_date: str
    total_contract_value: Decimal
    obligations: List[PerformanceObligationDTO]


# Singleton in-memory GL engine
_gl_engine = GeneralLedgerEngine()

# Seed default balanced opening journal entry
_opening_entry = JournalEntry(
    entry_id="JE-2026-0001",
    posting_date="2026-08-01",
    source_document="MEMORANDUM-OPENING",
    description="Initial corporate ledger capitalization and cloud reserve",
    lines=[
        JournalLine("10100", Decimal("250000.00"), Decimal("0.00"), memo="Operating Checking USD"),
        JournalLine("12000", Decimal("85000.00"), Decimal("0.00"), memo="Hardware Inventory Asset"),
        JournalLine("30100", Decimal("0.00"), Decimal("100000.00"), memo="Common Stock Par Value"),
        JournalLine("30200", Decimal("0.00"), Decimal("235000.00"), memo="Additional Paid-In Capital"),
    ]
)
_gl_engine.post_entry(_opening_entry)


@router.get("/accounts")
async def list_chart_of_accounts():
    """Retrieve the full standard Chart of Accounts hierarchy."""
    return _gl_engine.coa.list_accounts()


@router.get("/trial-balance")
async def get_trial_balance():
    """Generate balanced period-end Trial Balance report."""
    rows = _gl_engine.generate_trial_balance()
    tot_debits = sum(r[2] for r in rows)
    tot_credits = sum(r[3] for r in rows)
    return {
        "trial_balance_rows": [
            {"account_number": r[0], "account_name": r[1], "debit_balance": r[2], "credit_balance": r[3]}
            for r in rows
        ],
        "total_debits": tot_debits,
        "total_credits": tot_credits,
        "is_balanced": tot_debits == tot_credits
    }


@router.get("/balance-sheet")
async def get_balance_sheet_summary():
    """Retrieve real-time consolidated Balance Sheet totals."""
    return _gl_engine.generate_balance_sheet_summary()


@router.post("/journal-entries", status_code=status.HTTP_201_CREATED)
async def post_journal_entry(req: PostJournalEntryRequest):
    """Post an immutable, balanced double-entry transaction to the general ledger."""
    try:
        entry = JournalEntry(
            entry_id=req.entry_id,
            posting_date=req.posting_date,
            source_document=req.source_document,
            description=req.description,
            lines=[
                JournalLine(
                    account_number=l.account_number,
                    debit_amount=l.debit_amount,
                    credit_amount=l.credit_amount,
                    currency=l.currency,
                    fx_rate_to_base=l.fx_rate_to_base,
                    memo=l.memo
                )
                for l in req.lines
            ]
        )
        posted = _gl_engine.post_entry(entry)
        return {
            "message": "Journal entry successfully posted and cryptographically sealed",
            "entry_id": posted.entry_id,
            "entry_hash": posted.entry_hash,
            "previous_entry_hash": posted.previous_entry_hash,
            "posted_at": posted.posted_at
        }
    except UnbalancedJournalEntryError as ue:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ue))
    except InvalidAccountError as iae:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(iae))


@router.post("/asc606/amortization-schedule")
async def calculate_asc606_amortization(req: ContractASC606Request, as_of_date: str = Query("2026-08-25")):
    """Calculate 5-step ASC 606 revenue allocation and period recognition."""
    contract = CustomerContractASC606(
        contract_id=req.contract_id,
        customer_id=req.customer_id,
        contract_start_date=req.contract_start_date,
        contract_end_date=req.contract_end_date,
        total_contract_value=req.total_contract_value,
        obligations=[
            PerformanceObligation(
                pbo_id=o.pbo_id,
                obligation_type=o.obligation_type,
                description=o.description,
                standalone_selling_price=o.standalone_selling_price,
                allocated_transaction_price=Decimal("0.00"),
                recognition_method=o.recognition_method,
                service_start_date=o.service_start_date,
                service_end_date=o.service_end_date,
                is_satisfied=o.is_satisfied,
                satisfied_date=o.satisfied_date
            )
            for o in req.obligations
        ]
    )
    rec, deferred = ASC606RevenueEngine.calculate_period_revenue_recognition(contract, as_of_date)
    
    return {
        "contract_id": contract.contract_id,
        "as_of_date": as_of_date,
        "total_contract_value": contract.total_contract_value,
        "recognized_revenue_to_date": rec,
        "deferred_revenue_remaining": deferred,
        "allocated_obligations": [
            {
                "pbo_id": p.pbo_id,
                "type": p.obligation_type,
                "description": p.description,
                "standalone_selling_price": p.standalone_selling_price,
                "allocated_transaction_price": p.allocated_transaction_price,
                "method": p.recognition_method
            }
            for p in contract.obligations
        ]
    }
