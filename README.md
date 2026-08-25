# CommerceCRM

[![CI Pipeline](https://github.com/LingamalluRitesh/commerce-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/LingamalluRitesh/commerce-crm/actions)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/next.js-14-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **CommerceCRM** is a next-generation, multi-tenant CRM and commerce operating system uniting Customer 360, Sales Pipelines, E-Commerce, Inventory, Marketing Automation, Customer Support, Customer Success, Finance, Workflows, and AI services under one cohesive domain architecture.

---

## 🌟 Core Value Proposition

Unlike disconnected SaaS tools that fragment customer context, CommerceCRM unifies the entire customer lifecycle into a single continuous stream:

```text
CUSTOMER -> INTERACTION -> SALES -> COMMERCE -> DELIVERY -> SUPPORT -> SUCCESS -> RETENTION -> EXPANSION
```

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide React, TanStack Query, Zustand, Zod |
| **Backend API** | Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2 (Asyncio), Uvicorn, HTTPX |
| **Database & Storage** | PostgreSQL 16 (with pgvector), Redis 7, MinIO (S3-compatible) |
| **Messaging & Workers**| Async Event Bus, Celery / Redis |
| **AI / Machine Learning** | Contextual RAG with pgvector, Semantic Search, ML Lead Scoring, Summarization |
| **DevOps & Testing** | Docker, Docker Compose, GitHub Actions, Pytest, Vitest, Playwright |

---

## 📁 Repository Structure

```text
commerce-crm/
├── apps/
│   ├── web/                     # Next.js customer & employee portal
│   └── admin/                   # Administrative console
├── backend/
│   ├── app/
│   │   ├── api/                 # Versioned REST APIs (v1) & middlewares
│   │   ├── core/                # Config, DB, Security, Error handling, Logging
│   │   ├── domain/              # Pure domain models & business invariants
│   │   ├── application/         # Use cases, DTOs, and orchestrators
│   │   ├── infrastructure/      # Repositories, adapters, DB models
│   │   └── workers/             # Async background tasks
│   ├── migrations/              # Alembic database migrations
│   └── tests/                   # Pytest test suite (unit, integration, api)
├── docs/                        # Architecture guides, ADRs, schemas
├── infrastructure/              # Dockerfiles, Docker Compose, monitoring
└── .github/workflows/           # CI/CD pipelines
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm
- Docker & Docker Compose (Optional for containerized run)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API documentation available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
# Navigate to frontend app
cd apps/web

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend portal accessible at `http://localhost:3000`.

### 3. Running with Docker Compose
```bash
docker-compose -f infrastructure/docker-compose.yml up --build
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd apps/web
npm run test
```

---

## 📜 Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Multi-Tenancy & Security Model](docs/architecture/multi-tenancy.md)
- [Architecture Decision Records (ADRs)](docs/decisions/)
- [Database Schema Guide](docs/database/schema-guide.md)

---

## 🛡️ Security & Contributing

Please see [SECURITY.md](SECURITY.md) for vulnerability disclosure guidelines and [CONTRIBUTING.md](CONTRIBUTING.md) for development workflows.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
