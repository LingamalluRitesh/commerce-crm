# REST API Standards & Guidelines

## 1. Versioning & Base URI

All REST API endpoints are versioned under `/api/v1/`:
- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `GET /api/v1/customers/{id}`
- `PATCH /api/v1/customers/{id}`
- `DELETE /api/v1/customers/{id}`

---

## 2. Standard Request & Response Structure

### 2.1 Success Responses
Single item response:
```json
{
  "data": {
    "id": "7b0d96d2-28e4-4d89-8d76-e17f54c25fba",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "created_at": "2026-08-25T10:00:00Z"
  }
}
```

Paginated list response:
```json
{
  "items": [
    { "id": "...", "name": "..." }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 142,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2.2 Standard Error Response
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Customer with ID 7b0d96d2-... was not found.",
    "request_id": "req_01j7b9k2qf8v0z9w4",
    "details": {
      "resource": "Customer",
      "id": "7b0d96d2-28e4-4d89-8d76-e17f54c25fba"
    }
  }
}
```

---

## 3. Standard HTTP Status Codes

- `200 OK`: Successful GET, PATCH, or synchronous operation.
- `201 Created`: Successful POST resulting in entity creation.
- `204 No Content`: Successful DELETE.
- `400 Bad Request`: Invalid payload or business rule violation.
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated user lacks required permission or tenant context.
- `404 Not Found`: Entity does not exist within the tenant context.
- `409 Conflict`: Unique constraint violation (e.g. duplicate email).
- `422 Unprocessable Entity`: Validation failure (schema / data types).
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unhandled server failure (sanitized; request_id logged).
