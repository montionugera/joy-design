# Ship Joymify Design System and Composed Storybook to Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship production deployment for the Joymify Design System & Storybook to `design.joymify.com` on Vultr K8s cluster via GHCR containerization and automated GitHub Actions CI/CD.

**Architecture:** Multi-stage Docker container serving Storybook on Nginx Alpine, deployed to Kubernetes with automated Let's Encrypt TLS certificates via Ingress `design.joymify.com`.

**Tech Stack:** Docker, Nginx Alpine, Kubernetes, GitHub Actions, GHCR, cert-manager.

**Spec:** `.claude/refined_backlog/F-002-ship-joymify-design-system-and-composed/spec.md`

## Global Constraints
- Target domain is `design.joymify.com` pointing to `149.28.144.91`.
- Follow immutable `ghcr-pull` image-pull secret pattern used in `joymify-portal`.
- Ingress uses `cert-manager.io/cluster-issuer: letsencrypt-prod`.
- Zero-downtime rolling update strategy.

---

## Tasks

### Phase 1: Containerization & Web Server Config
- [ ] **Task 1.1: Build static Storybook generator script**
  - Implement static asset bundling for Storybook Hub in `apps/storybook-hub`.
  - Add `build` script exporting compiled static output to `dist/`.
- [ ] **Task 1.2: Implement `Dockerfile` and `nginx.conf`**
  - Create optimized `nginx.conf` with gzip compression, security headers, and clean caching rules.
  - Create multi-stage `Dockerfile` (Node 22 pnpm builder -> NGINX Alpine runtime).
  - Verify local Docker build succeeds.
- [ ] **Task 1.3: Quality Gate (Phase 1)**
  - Verify container builds and serves on port 80.

### Phase 2: Kubernetes Manifests Definition
- [ ] **Task 2.1: Implement `k8s/deployment.yml`, `k8s/service.yml`, and `k8s/ingress.yml`**
  - Define `Deployment` with probes (port 80), resource limits, and `ghcr-pull` imagePullSecret.
  - Define `Service` exposing port 80.
  - Define `Ingress` for `design.joymify.com` with TLS Secret `joy-design-tls`.
- [ ] **Task 2.2: Quality Gate (Phase 2)**
  - Validate Kubernetes YAML syntax and schema compatibility.

### Phase 3: GitHub Actions CI/CD Pipeline
- [ ] **Task 3.1: Implement `.github/workflows/ci.yml`**
  - Define jobs: Build & Check, Integration Tests, Docker Build & Push to GHCR (`ghcr.io/montionugera/joy-design`), and Deploy to Vultr K8s.
  - Use `KUBECONFIG_B64` secret and rollout status check.
- [ ] **Task 3.2: Quality Gate (Phase 3)**
  - Update `scripts/integration.sh` to include containerization and manifest lint verification.

### Phase 4: ps-release-workflow Ship & Full Promotion
- [ ] **Task 4.1: Ship F-002 to `release/1.2`**
  - Run `psrw ship`.
- [ ] **Task 4.2: Gate 2 Verification & Promotion to `main`**
  - Run `psrw promote`.
  - Squash-merge PR into `main` and execute `--cleanup-only 1.2`.
