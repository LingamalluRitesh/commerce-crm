# CommerceCRM — Kubernetes Production Deployment & Operations Guide

This guide details the steps to deploy CommerceCRM to production Kubernetes clusters (EKS, GKE, AKS, or bare metal).

---

## 1. Prerequisites

- Kubernetes cluster v1.28+
- `kubectl` configured with cluster administrator credentials
- NGINX Ingress Controller installed with TLS termination
- Cert-Manager installed for automated Let's Encrypt certificates
- PostgreSQL 16+ (Managed RDS / Cloud SQL recommended)

---

## 2. Namespace & Secret Provisioning

```bash
# 1. Create dedicated namespace
kubectl create namespace commercecrm-production

# 2. Provision database and JWT secrets
kubectl create secret generic commercecrm-secrets \
  --namespace=commercecrm-production \
  --from-literal=DATABASE_URL="postgresql+asyncpg://commercecrm_admin:SecretPass123!@commercecrm-db.prod:5432/commercecrm_db" \
  --from-literal=SECRET_KEY="super_secret_64_character_production_jwt_signing_key_here" \
  --from-literal=STRIPE_API_KEY="sk_live_stripe_production_key"
```

---

## 3. Applying Kubernetes Manifests

```bash
# 1. Apply Network Isolation Policies
kubectl apply -f infrastructure/k8s/network-policy.yaml

# 2. Apply Deployments
kubectl apply -f infrastructure/k8s/deployment.yaml

# 3. Apply Services & Ingress
kubectl apply -f infrastructure/k8s/service.yaml

# 4. Apply Horizontal Pod Autoscalers (HPA)
kubectl apply -f infrastructure/k8s/hpa.yaml
```

---

## 4. Verifying Cluster Health & Rollout Status

```bash
# Check rollout status
kubectl rollout status deployment/commercecrm-backend-api -n commercecrm-production
kubectl rollout status deployment/commercecrm-web-frontend -n commercecrm-production

# Verify pod status
kubectl get pods -n commercecrm-production -l app.kubernetes.io/name=commercecrm-backend

# Test Ingress connectivity
curl -i https://api.commercecrm.io/api/v1/health
```

---

## 5. Prometheus Monitoring & Scraping

The backend pod template exposes Prometheus metrics on port 8000:
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/path: "/metrics"
  prometheus.io/port: "8000"
```

### Key Grafana Metrics to Monitor
- `http_requests_total`: Request throughput segmented by status code (`200`, `400`, `401`, `500`)
- `http_request_duration_seconds`: Request latency percentiles (P50, P95, P99)
- `domain_events_published_total`: Event bus activity velocity
