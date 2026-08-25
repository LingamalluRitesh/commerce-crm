.PHONY: help install test lint format run-backend run-frontend docker-up docker-down

help:
	@echo "CommerceCRM Development Commands:"
	@echo "  install        Install all dependencies (backend and frontend)"
	@echo "  test           Run all tests"
	@echo "  lint           Run linters across backend and frontend"
	@echo "  format         Auto-format code"
	@echo "  run-backend    Run FastAPI backend server"
	@echo "  run-frontend   Run Next.js frontend dev server"
	@echo "  docker-up      Start docker compose services"
	@echo "  docker-down    Stop docker compose services"

install:
	cd backend && pip install -r requirements.txt
	cd apps/web && npm install

test:
	cd backend && pytest tests/ -v
	cd apps/web && npm test

lint:
	cd backend && ruff check app tests
	cd apps/web && npm run lint

format:
	cd backend && ruff format app tests

run-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

run-frontend:
	cd apps/web && npm run dev

docker-up:
	docker-compose -f infrastructure/docker-compose.yml up -d

docker-down:
	docker-compose -f infrastructure/docker-compose.yml down
