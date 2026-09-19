---
title: "Ship Joymify Design System and Composed Storybook to Production at design.joymify.com"
id: F-002
from_idea: I-002
status: refined
---

# Ship Joymify Design System and Composed Storybook to Production at design.joymify.com — Spec

## Goal
Deploy the **Joymify Design System & Composed Storybook** to production under the dedicated domain **`design.joymify.com`** (pointing to cluster ingress IP `149.28.144.91`), complete with Docker containerization, Kubernetes manifests, automated GitHub Actions CI/CD with Let's Encrypt TLS, and Gate 1/Gate 2 integration verification.

## Architecture
- **Runtime / Web Server**: Multi-stage Docker container with lightweight NGINX Alpine serving static Storybook Hub and compiled design documentation assets on port 80.
- **Ingress & TLS**: NGINX Ingress Controller in Kubernetes with `cert-manager.io/cluster-issuer: letsencrypt-prod`, auto-issuing TLS certificate into Secret `joy-design-tls` for `design.joymify.com`.
- **CI/CD Pipeline**: `.github/workflows/ci.yml` triggering on push to `main`:
  1. Build & verify tokens, svelte, react, and storybook packages.
  2. Build and push multi-arch Docker image to GitHub Container Registry (`ghcr.io/montionugera/joy-design`).
  3. Deploy to Vultr K8s using `KUBECONFIG_B64` and `ghcr-pull` image-pull secret.
  4. Rolling zero-downtime update with health probes.

## Components & Manifests
1. `Dockerfile`: Multi-stage build (Node 22 builder -> Nginx unprivileged Alpine runner).
2. `nginx.conf`: Gzip enabled, security headers, SPA fallback routing for Storybook.
3. `k8s/deployment.yml`: Deployment specification with resource requests/limits, liveness & readiness probes.
4. `k8s/service.yml`: ClusterIP service exposing port 80 (targetPort 80).
5. `k8s/ingress.yml`: Ingress rule for `design.joymify.com` routing to `joy-design-storybook:80` with TLS.
6. `.github/workflows/ci.yml`: Full build, test, containerize, and deploy workflow.

## Acceptance Criteria
1. `Dockerfile` builds cleanly and serves Storybook Hub static assets.
2. Kubernetes manifests pass `kubectl apply --dry-run=server` validation.
3. Automated CI/CD workflow passes lint and schema checks.
4. Integration verification script `scripts/integration.sh` validates all packages and manifests.
