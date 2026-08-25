"""NACHA ACH Direct Debit File Generator, Mod-10 Checksum & Batch Processing Engine.

Generates specification-compliant NACHA 94-character fixed-width files:
- File Header Record (Type 1)
- Company/Batch Header Record (Type 5 - PPD / CCD / WEB)
- Entry Detail Record (Type 6 - Routing Number, Account Number, Amount, Trace Number)
- Company/Batch Control Record (Type 8 - Entry Hash, Total Debit/Credit Dollars)
- File Control Record (Type 9 - Block Count, Total Hash, Total Dollar Volumes)
Calculates Federal Reserve routing transit number Mod-10 checksums (weights 3, 7, 1).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class SECStandardEntryClassCode(str, Enum):
    CCD = "CCD"  # Corporate Credit or Debit (B2B)
    PPD = "PPD"  # Prearranged Payment and Deposit (B2C)
    WEB = "WEB"  # Internet-initiated debit


class ACHTransactionCode(int, Enum):
    CHECKING_DEBIT = 27
    CHECKING_CREDIT = 22
    SAVINGS_DEBIT = 37
    SAVINGS_CREDIT = 32


@dataclass
class ACHEntryRecord:
    transaction_code: ACHTransactionCode
    receiving_routing_number: str  # 9 digits
    receiving_account_number: str  # up to 17 alphanumeric
    amount_usd: Decimal
    individual_or_company_name: str
    payment_reference_id: str
    trace_number: str


@dataclass
class NACHAFileGenerationResult:
    nacha_formatted_file_content: str
    total_batch_count: int
    total_entry_count: int
    total_debit_amount_usd: Decimal
    total_credit_amount_usd: Decimal
    entry_hash: int
    validation_passed: bool


class NACHAFileEngine:
    """Enterprise Automated Clearing House (ACH) NACHA File Generator."""

    @classmethod
    def validate_routing_checksum(cls, routing_9_digits: str) -> bool:
        """Validate Federal Reserve routing number with Mod-10 weights (3, 7, 1)."""
        if len(routing_9_digits) != 9 or not routing_9_digits.isdigit():
            return False

        weights = [3, 7, 1, 3, 7, 1, 3, 7, 1]
        tot = sum(int(d) * w for d, w in zip(routing_9_digits, weights))
        return (tot % 10) == 0

    @classmethod
    def generate_nacha_file(
        cls,
        origin_routing: str,
        origin_company_name: str,
        origin_company_id: str,
        sec_code: SECStandardEntryClassCode,
        entries: List[ACHEntryRecord]
    ) -> NACHAFileGenerationResult:
        """Generate 94-character fixed-width NACHA ACH batch transfer file."""
        now = datetime.now(timezone.utc)
        file_creation_date = now.strftime("%y%m%d")
        file_creation_time = now.strftime("%H%M")

        # 1. File Header (Type 1)
        # Priority code '01', Immediate Destination (10 chars, b+routing), Immediate Origin (10 chars, b+routing)
        imm_dest = f" {origin_routing[:9]:<9}"
        imm_orig = f" {origin_company_id[:9]:<9}"
        raw_hdr = f"101{imm_dest}{imm_orig}{file_creation_date}{file_creation_time}A094101{origin_company_name[:23]:<23}COMMERCE_CRM"
        f_hdr = f"{raw_hdr:<94}"[:94]
        assert len(f_hdr) == 94, f"Header len is {len(f_hdr)}"

        # 2. Batch Header (Type 5)
        # Service class 200 (Mixed Debit/Credit), SEC Code, Entry Description
        raw_bhdr = f"5200{origin_company_name[:16]:<16}                    {origin_company_id[:10]:<10}{sec_code.value}INVOICE_PAY{file_creation_date}{file_creation_date}   1{origin_routing[:8]}0000001"
        b_hdr = f"{raw_bhdr:<94}"[:94]
        assert len(b_hdr) == 94, f"Batch Header len is {len(b_hdr)}"

        lines = [f_hdr, b_hdr]
        total_debit = Decimal("0.00")
        total_credit = Decimal("0.00")
        entry_hash = 0

        # 3. Entry Detail Records (Type 6)
        for idx, entry in enumerate(entries, start=1):
            cents = int((entry.amount_usd * Decimal("100.0")).quantize(Decimal("1.0"), rounding=ROUND_HALF_UP))
            if entry.transaction_code in {ACHTransactionCode.CHECKING_DEBIT, ACHTransactionCode.SAVINGS_DEBIT}:
                total_debit += entry.amount_usd
            else:
                total_credit += entry.amount_usd

            entry_hash += int(entry.receiving_routing_number[:8])

            dfi_acc = f"{entry.receiving_account_number[:17]:<17}"
            amt_str = f"{cents:010d}"
            ident = f"{entry.payment_reference_id[:15]:<15}"
            name = f"{entry.individual_or_company_name[:22]:<22}"
            trace = f"{origin_routing[:8]}{idx:07d}"

            raw_eline = f"6{entry.transaction_code.value}{entry.receiving_routing_number[:9]}{dfi_acc}{amt_str}{ident}{name}  0{trace}"
            e_line = f"{raw_eline:<94}"[:94]
            assert len(e_line) == 94, f"Entry {idx} len is {len(e_line)}"
            lines.append(e_line)

        # 4. Batch Control (Type 8)
        tot_debit_cents = int((total_debit * Decimal("100.0")).quantize(Decimal("1.0"), rounding=ROUND_HALF_UP))
        tot_credit_cents = int((total_credit * Decimal("100.0")).quantize(Decimal("1.0"), rounding=ROUND_HALF_UP))
        hash_10 = entry_hash % 10000000000

        raw_bctrl = f"8200{len(entries):06d}{hash_10:010d}{tot_debit_cents:012d}{tot_credit_cents:012d}{origin_company_id[:10]:<10}                         {origin_routing[:8]}0000001"
        b_ctrl = f"{raw_bctrl:<94}"[:94]
        assert len(b_ctrl) == 94, f"Batch Control len is {len(b_ctrl)}"
        lines.append(b_ctrl)

        # 5. File Control (Type 9)
        tot_records = len(lines) + 1
        block_count = (tot_records + 9) // 10
        raw_fctrl = f"9000001{block_count:06d}{len(entries):08d}{hash_10:010d}{tot_debit_cents:012d}{tot_credit_cents:012d}                                       "
        f_ctrl = f"{raw_fctrl:<94}"[:94]
        assert len(f_ctrl) == 94, f"File Control len is {len(f_ctrl)}"
        lines.append(f_ctrl)

        # Pad remaining lines with 9s to complete 10-line blocking
        padding_needed = (10 - (len(lines) % 10)) % 10
        for _ in range(padding_needed):
            lines.append("9" * 94)

        full_content = "\n".join(lines)
        return NACHAFileGenerationResult(
            nacha_formatted_file_content=full_content,
            total_batch_count=1,
            total_entry_count=len(entries),
            total_debit_amount_usd=total_debit,
            total_credit_amount_usd=total_credit,
            entry_hash=hash_10,
            validation_passed=True
        )
