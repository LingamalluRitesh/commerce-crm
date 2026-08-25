# CommerceCRM — Developer Platform & Integration Guide

## 1. Authentication & API Keys

CommerceCRM uses high-entropy scoped API keys for programmatic backend-to-backend integrations.

### API Key Format
All API keys follow the standardized prefix format:
```
ccrm_live_<48_hexadecimal_characters>
```

### Passing API Keys in HTTP Requests
Include your secret API key in the `Authorization` header:
```http
GET /api/v1/customers HTTP/1.1
Host: api.commercecrm.io
Authorization: Bearer ccrm_live_98a72ef019bc847291a83401ef9482910a823491
X-Organization-ID: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
```

---

## 2. Webhook Subscriptions & Cryptographic Verification

CommerceCRM dispatches outbound webhooks for domain events with HMAC-SHA256 signatures to prevent tampering and replay attacks.

### Webhook Headers
Each outbound webhook POST request includes two headers:
- `X-CommerceCRM-Signature`: The cryptographic HMAC-SHA256 signature (e.g. `t=1724578900,v1=a98f12c...`)
- `X-CommerceCRM-Timestamp`: Epoch timestamp in seconds

### Node.js / TypeScript Signature Verification
```typescript
import crypto from "crypto";

export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string,
  secretToken: string
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((item) => item.split("="))
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  const signedPayload = `t=${timestamp}.` + rawBody.toString("utf-8");
  const computedSignature = crypto
    .createHmac("sha256", secretToken)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(computedSignature, "hex")
  );
}
```

### Python Webhook Signature Verification
```python
import hmac
import hashlib

def verify_webhook_signature(payload_bytes: bytes, signature_header: str, secret: str) -> bool:
    elements = dict(item.split("=") for item in signature_header.split(","))
    timestamp = elements.get("t", "")
    expected_sig = elements.get("v1", "")
    
    signed_payload = f"t={timestamp}.".encode("utf-8") + payload_bytes
    computed_sig = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed_sig, expected_sig)
```

---

## 3. Supported Webhook Domain Events

| Event Identifier | Payload Aggregate | Description |
|---|---|---|
| `order.created.v1` | `Order` | Dispatched immediately upon checkout initiation. |
| `order.paid.v1` | `Order` & `Payment` | Dispatched upon successful payment gateway capture. |
| `order.shipped.v1` | `Fulfillment` | Dispatched with carrier tracking code. |
| `customer.created.v1` | `Customer` | Dispatched when a new customer account is registered. |
| `ticket.sla_breach.v1` | `Ticket` | Dispatched if priority resolution window is breached. |
| `lead.converted.v1` | `Deal` & `Customer` | Dispatched upon atomic lead-to-deal conversion. |
