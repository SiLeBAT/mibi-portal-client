# MiBi-Portal — End-to-end tests in GitHub Actions (Docker)

Run the portal's Cypress E2E suite **entirely inside GitHub Actions**, started **manually
(button click)**, against a **Dockerized copy of the full stack** that is seeded from a
**database dump**. Because the whole stack runs inside the GitHub runner, the tests never
need to reach the BfR intranet — the firewall is simply out of the picture.

> **Status: SCAFFOLD / work in progress.** This is the initial skeleton. It is **not yet a
> green pipeline** — several values must be confirmed with the team first (see
> [Open requirements](#open-requirements-answer-these-first)). Files are heavily commented
> with `TODO:` where a real value is needed.

---

## How it works (target design)

```
GitHub Actions runner (public cloud — no BfR network needed)
│
│  workflow_dispatch  ← you start it with a button click
▼
docker compose up
   ┌── mongo ──── db "mibiportal", seeded from the dump (optional for smoke)
   ├── server ── Node API (:3000)  ─┬─ ALSO hosts Parse Server (:1337) in-process
   │                                └─ loads mibi-parse-cloud as cloud code
   │                                   (keycloak.enabled=false → auth stubbed)
   └── client ── Angular app (:4200), proxies /v2 -> server; serves Welcome page
          │      (no separate parse-cloud service, no Keycloak, no CMS)
          ▼
   cypress run  →  Welcome-page smoke (CYPRESS_BASE_URL=http://localhost:4200)
          │
          ▼
   upload screenshots + mochawesome report as build artifacts
```

This mirrors the existing **Jenkins** E2E flow (build → seed → test → tear-down) but the
"environment" is ephemeral containers instead of the internal QA host `fg43-test1.bfr.berlin`.

---

## Decisions (confirmed) and remaining unknowns

**First goal:** the stack boots and the **public Welcome page renders** (`cypress/integration/ui/welcome.smoke.spec.ts`). No login.

| # | Topic | Decision |
|---|-------|----------|
| 1 | DB dump / data protection | Proceed for now (dump stays git-ignored; see note below). |
| 2 | Which database | **`mibiportal` only.** |
| 3 | Auth (Keycloak) | **Stubbed / not active.** No login for the first instance. |
| 4 | CMS (Strapi) | **Dropped** — not in the stack. |
| — | First test | Welcome-page **smoke** only; full suite comes later. |

**Still to confirm before the *full* suite (not the smoke run):**

| Topic | Why it matters | Current placeholder |
|-------|----------------|---------------------|
| Dump delivery + format | For data-driven specs; smoke run needs none (Mongo starts empty). | `e2e/seed/dump.archive.gz`, restored via `mongorestore`. |
| Parse keys | Real values (if any) go in **GitHub Actions secrets**, never committed. | dev values `appId` / `masterKey`. |
| Node version | Base image per service. | `node:20` — confirm. |
| Branches / specs | Which refs to build; which specs to run. | inputs default `develop`; spec defaults to the Welcome smoke. |

---

## Files in this scaffold

| File | Purpose |
|------|---------|
| `.github/workflows/e2e.yml` | The **manual** (`workflow_dispatch`) pipeline: checkout → build images → seed DB → run Cypress → upload reports. |
| `e2e/docker-compose.yml` | Defines the 3-service stack: mongo, server (also hosts Parse + cloud code), client. |
| `e2e/docker/Dockerfile.server` | Multi-stage: builds `mibi-parse-cloud` (passed as an extra build context) **and** `mibi-portal-server` into one image, and writes a container `config/local.json` (Mongo URI, cloud path, Keycloak off). **Best-effort — verify with a real run.** |
| `e2e/docker/Dockerfile.client` | Serves the Angular app via `ng serve` with `proxy.config.e2e.json`. |
| `e2e/mongo/restore.sh` | Restores the provided dump into MongoDB on first boot. |
| `e2e/seed/` | Where the (anonymized) DB dump goes. Git-ignored. |
| `e2e/.env.example` | Non-secret config knobs (ports, image tags, appId). Copy to `.env` locally. |

---

## Running it

**In GitHub Actions:** open the repo → **Actions** tab → **E2E (Docker)** workflow →
**Run workflow** → pick branches → **Run**. (This is the "button click" the manager asked for.)

**Locally (to develop/verify the stack):**
```bash
# 1. put an anonymized dump at e2e/seed/dump.archive.gz  (see requirement #2)
# 2. from the client repo root:
docker compose -f e2e/docker-compose.yml up --build
# 3. once healthy, in another shell:
CYPRESS_BASE_URL=http://localhost:4200 npm run test:e2e
```

---

## Data protection (read before providing a dump)

MiBi-Portal stores personal data of submitters. A copy of a **real** database placed on a
GitHub-hosted runner leaves the BfR-controlled environment and may be cached by the CI
platform. **Use an anonymized or synthetic dump.** If only real data is available, this whole
approach should instead use a **self-hosted runner inside the BfR network** (Option A in the
manager brief) rather than GitHub-hosted runners. Confirm the chosen path with the team's data
protection officer before requirement #1 is fulfilled.
