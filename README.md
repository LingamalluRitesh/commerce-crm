# CommerceCRM Enterprise Platform

CommerceCRM is a multi-tenant CRM and commerce operating system uniting Customer 360, Sales Pipelines, E-Commerce, Inventory, Marketing Automation, Customer Support, SLA Management, Finance, Workflows, and AI services under one cohesive domain architecture.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend API**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2 (Asyncio), Uvicorn
- **Database & Storage**: PostgreSQL 16 (pgvector), Redis 7, SQLite
- **DevOps & Testing**: Docker, Docker Compose, Pytest, Vitest, Playwright

---

## 📦 Dependencies

### Backend Dependencies
- `fastapi` >= 0.115.0
- `uvicorn` >= 0.31.0
- `pydantic` >= 2.9.0
- `sqlalchemy` >= 2.0.30
- `pytest` >= 8.3.0
- `pytest-cov` >= 5.0.0
- `pyyaml` >= 6.0.0

### Frontend Dependencies
- `next` 14.2.35
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `typescript` ^5.6.0
- `tailwindcss` ^3.4.1

---

## ⚙️ Installation

### 1. Python Environment Setup
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Node.js Environment Setup
```bash
cd apps/web
npm install
```

---

## 🔨 Build

### Build Frontend Application
```bash
cd apps/web
npm run build
```

### Build Docker Containers
```bash
docker build -t commercecrm-backend -f infrastructure/Dockerfile.backend .
docker build -t commercecrm-web -f infrastructure/Dockerfile.web .
```

---

## 🚀 Run

### 1. Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start Frontend Development Server
```bash
cd apps/web
npm run dev
```

### 3. Run with Docker Compose
```bash
docker-compose -f infrastructure/docker-compose.yml up --build
```

---

## 💡 Usage

1. Open `http://localhost:3000` in your web browser.
2. Access the **Customer 360** dashboard to view unified account health scores and interaction feeds.
3. Access the **Sales Pipeline & Quotation Designer** to create deals and generate signed proposal documents.
4. Access **Finance & Invoicing** to calculate taxes and download commercial invoices.
5. Access **Developer & Webhooks** to generate scoped API keys and register HMAC endpoints.

---

## 🧪 Testing

### Run Backend Pytest Suite with Coverage
```bash
cd backend
pytest tests/ -v --cov=app
```

### Run Frontend Typecheck & Tests
```bash
cd apps/web
npm run typecheck
npm run test
```

---

## 🔒 Proprietary Notice

All rights reserved. Proprietary commercial enterprise software.
