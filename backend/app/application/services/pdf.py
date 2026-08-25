import base64
import uuid
from decimal import Decimal
from typing import Any


class PDFDocumentService:
    @staticmethod
    def render_invoice_html(
        invoice_number: str,
        customer_name: str,
        customer_email: str,
        issue_date: str,
        due_date: str,
        status: str,
        items: list[dict[str, Any]],
        subtotal: Decimal | float,
        tax_rate: Decimal | float,
        tax_amount: Decimal | float,
        total_gross: Decimal | float,
    ) -> str:
        """Render complete commercial invoice HTML document with styling."""
        rows_html = "".join([
            f"""<tr>
                <td>{item.get('description', '')}</td>
                <td style="text-align: center;">{item.get('quantity', 1)}</td>
                <td style="text-align: right;">${float(item.get('unit_price', 0)):.2f}</td>
                <td style="text-align: right; font-weight: 600;">
                  ${float(item.get('total_amount', 0)):.2f}
                </td>
            </tr>"""
            for item in items
        ])

        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1e293b;
    padding: 40px;
  }}
  .header {{
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 20px;
  }}
  .brand {{
    font-size: 24px;
    font-weight: bold;
    color: #4f46e5;
  }}
  .details {{
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
  }}
  .table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 30px;
  }}
  .table th {{
    background: #f8fafc;
    text-align: left;
    padding: 12px;
    font-size: 12px;
    text-transform: uppercase;
    color: #64748b;
  }}
  .table td {{
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }}
  .totals {{
    margin-top: 30px;
    width: 300px;
    margin-left: auto;
  }}
  .totals-row {{
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 14px;
  }}
  .totals-row.final {{
    font-weight: bold;
    font-size: 18px;
    color: #0f172a;
    border-top: 2px solid #e2e8f0;
    padding-top: 10px;
    margin-top: 10px;
  }}
  .footer {{
    margin-top: 50px;
    text-align: center;
    color: #94a3b8;
    font-size: 12px;
  }}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CommerceCRM Enterprise</div>
      <div style="color: #64748b; font-size: 12px; margin-top: 4px;">
        Next-Gen CRM & Commerce Operating System
      </div>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; color: #0f172a;">COMMERCIAL INVOICE</h2>
      <div style="color: #64748b; font-size: 14px; margin-top: 4px;">#{invoice_number}</div>
      <div style="color: #64748b; font-size: 12px;">Issue Date: {issue_date}</div>
    </div>
  </div>

  <div class="details">
    <div>
      <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">
        Billed To:
      </strong>
      <div style="font-weight: bold; font-size: 16px; margin-top: 4px;">{customer_name}</div>
      <div style="color: #475569; font-size: 13px;">{customer_email}</div>
    </div>
    <div style="text-align: right;">
      <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">
        Payment Terms:
      </strong>
      <div style="font-weight: bold; font-size: 14px; margin-top: 4px;">
        Due Date: {due_date}
      </div>
      <div style="color: #10b981; font-weight: bold; font-size: 13px;">
        Status: {status.upper()}
      </div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      {rows_html}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal (Net):</span>
      <span>${float(subtotal):.2f}</span>
    </div>
    <div class="totals-row">
      <span>Tax Amount ({float(tax_rate):.2f}%):</span>
      <span>${float(tax_amount):.2f}</span>
    </div>
    <div class="totals-row final">
      <span>Total Gross Due:</span>
      <span style="color: #4f46e5;">${float(total_gross):.2f}</span>
    </div>
  </div>

  <div class="footer">
    Thank you for choosing CommerceCRM Enterprise • Powered by High-Availability Architecture
  </div>
</body>
</html>"""

    @staticmethod
    def export_invoice_base64_payload(
        invoice_number: str,
        customer_name: str,
        customer_email: str,
        issue_date: str,
        due_date: str,
        status: str,
        items: list[dict[str, Any]],
        subtotal: Decimal | float,
        tax_rate: Decimal | float,
        tax_amount: Decimal | float,
        total_gross: Decimal | float,
    ) -> dict[str, Any]:
        """Generate base64 encoded document artifact for download or email attachment."""
        html_content = PDFDocumentService.render_invoice_html(
            invoice_number=invoice_number,
            customer_name=customer_name,
            customer_email=customer_email,
            issue_date=issue_date,
            due_date=due_date,
            status=status,
            items=items,
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total_gross=total_gross,
        )
        b64_data = base64.b64encode(html_content.encode("utf-8")).decode("utf-8")
        return {
            "document_id": str(uuid.uuid4()),
            "invoice_number": invoice_number,
            "mime_type": "text/html",
            "file_name": f"{invoice_number}.html",
            "base64_content": b64_data,
            "size_bytes": len(html_content.encode("utf-8")),
        }
