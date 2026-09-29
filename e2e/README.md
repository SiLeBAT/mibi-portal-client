# MiBi-Portal — End-to-end tests in GitHub Actions (Docker)

Run the portal's Cypress E2E suite **entirely inside GitHub Actions**, started **manually
(button click)**, against a **Dockerized copy of the full stack** that is seeded with
reference data and test accounts. Because the whole stack runs inside the GitHub runner,
the tests never need to reach the BfR intranet — the firewall is simply out of the picture.

> **Status:** verified end to end on a developer machine — from an empty volume the stack
> boots, the seed loads, logins work, the Welcome-page and login/logout specs pass, and
> mibi-portal-server's integration suite is green (10/10). The seed is committed
> ([where the seed lives](#where-the-seed-lives)), so a run needs no further setup. What is
> **not** done: a run of the workflow itself in GitHub Actions, and the older `api/v2` /
> `e2e` specs, which still expect the pre-CSRF API (separate ticket).

---

## How it works

```
GitHub Actions runner (public cloud — no BfR network needed)
│
│  workflow_dispatch  ← you start it with a button click
▼
docker compose up
   ┌── mongo ──── db "mibiportal", loaded from e2e/seed/seed-data.js.gz on first boot
   ├── server ── Node API (:3000)  ─┬─ ALSO hosts Parse Server (:1337) in-process
   │                                └─ loads mibi-parse-cloud as cloud code
   │                                   (keycloak.enabled=false → auth stubbed)
   └── client ── Angular app (:4200), proxies /v2 -> server
          │
          ├── node e2e/seed/seed-states.js   (AVV regexes, no-op when the seed has them)
          ├── node e2e/seed/seed-users.js    (the test accounts)
          ▼
   cypress run  →  Welcome-page smoke + login/logout (CYPRESS_BASE_URL=http://localhost:4200)
          │
          ▼
   upload screenshots + mochawesome report as build artifacts
```

This mirrors the existing **Jenkins** E2E flow (build → seed → test → tear-down) but the
"environment" is ephemeral containers instead of the internal QA host `fg43-test1.bfr.berlin`.

---

## The seed

The E2E database is built from two pieces, on purpose:

| Piece | What | Where it comes from |
|-------|------|---------------------|
| **Reference data** | AVV catalogue, NRL, allowed postcodes, analysis procedures, validation errors, ZoMo plans, template file rows, Parse `_SCHEMA`, and `institutions` with contact fields overwritten | `e2e/seed/seed-data.js.gz`, produced by `make-seed.js` from a development database. Committed. |
| **Federal states** | the AVV id formats per state | the checked-in `e2e/seed/states.json`, appended to the seed by `make-seed.js` — **not** taken from the development database |
| **Parse files** | the Excel templates that `Template_File` rows name | `e2e/seed/files/`, copied by `make-seed.js` from the server's `data/` directory. Committed. |
| **Test accounts** | the 5 users in `cypress/fixtures/users.json`, with consent already given | `e2e/seed/seed-users.js`, at run time |

**Why `states` comes from the file, and why it is inside the seed.** The AVV id format
rule (validation error 72) and the MPC-291 year check (error 127) read their regexes from
this collection, and a development copy can be stale — Hessen still carries the
year-agnostic `^[0-9]{9}$` there instead of `^yy[0-9]{7}$`, which makes the year check
silently pass everything. It also has to be part of the seed rather than inserted
afterwards: the cloud reads the regexes once while starting up, so rows added after the
server is up leave **both** rules inert, and `state-regex.spec.ts` fails. `seed-states.js`
remains as a fallback for a seed-less stack and simply skips when the rows are there.

**Why Parse files are copied separately.** Parse keeps file *contents* on the server's
filesystem (`@parse/fs-files-adapter`), not in Mongo. A database-only seed therefore has
`Template_File` rows pointing at Excel templates that do not exist, and submission/Excel
creation fails with "No Excel data available.". `docker-compose.yml` mounts
`e2e/seed/files` as the server's data directory — writable, because Parse also writes new
files there at runtime.

**Why the accounts are not in the dump.** Login is served by the Parse class `users`
(mibi-portal-server, `schema/user.ts`), whose `password` field holds an **argon2** hash.
Accounts copied from a real database would come with unknown passwords, while the specs log
in with the plaintext passwords from the fixture. Creating them at run time also means no
password hash from a real database is ever shipped. `seed-users.js` sets the four states the
fixture encodes (`enabled` = e-mail verified, `adminEnabled` = admin activated) and deletes
`newUser@test.com`, which the registration specs create themselves.

It also creates a `_User` plus `User_Info` row per account with `dataSaveViewed` and
`dataSaveAgreed` set. Without them the client opens the data-protection dialog on every
login (`data-consent.service.ts` reacts to `dataSaveViewed === false`) and its backdrop
swallows the first click of any spec that logs in.

The users belong to a synthetic institute with the fixed id **`E2EINST001`**, which
`make-seed.js` adds to the seed. Parse generates object ids, so a fixed one can only come
from the seed — that is what lets `cypress/fixtures/users.json` name an `instituteId` at all.

**Why a mongosh script and not `mongodump`.** The `mongo:6` image ships mongosh but *not*
`mongorestore` (`mongodb-database-tools` is a separate package), and Mongo's init hook runs
`.js` files with mongosh. So the seed *is* a mongosh script: nothing extra has to be
installed, on the runner or on a development machine, and the seed can be read in a diff
before it is handed to CI — which matters, given where the data comes from.

### Creating or refreshing the seed

```bash
# from the client repo root, with a local MiBi-Portal database running
node e2e/seed/make-seed.js                # → e2e/seed/seed-data.js.gz   (~1.5 MB)
node e2e/seed/make-seed.js --keep-plain   # also the readable ~18 MB seed-data.js
```

Refresh it when the master data changes (AVV catalogue, NRL, postcodes, validation errors).
`--uri` points at another database; `--out` writes elsewhere.

### What the seed does and does not contain

`export-seed.mongosh.js` reads only the collections listed in `REFERENCE_COLLECTIONS`, plus
`institutions`. It never reads `users`, `_User`, `User_Info`, `Order`, `Sample`, `Result`,
`resettokens` or `_Session` — and the generated seed **empties** those, so restoring over a
non-empty database cannot leave real accounts or submissions behind.

For `institutions` the contact fields are overwritten (`email` → `…@example.invalid`, phone
and fax → dummy numbers). Names, city, zip and `state_short` are kept: they are public
information about laboratories, and the postcode/state values are what the UI and the AVV
format rules work with. The source data was checked for person names in those fields
(`Herr`, `Frau`, `Dr.`, `Prof.`, `z. Hd.`, `Ansprechpartner`) with no matches — **re-run that
check after refreshing the seed**, since it is an assumption about the data, not a guarantee:

```bash
mongosh --quiet "mongodb://localhost:27017/mibiportal" --eval '
const rx = /(Herr|Frau|Dr\.|Prof\.|Dipl|z\.\s?Hd|Ansprechpartner)/i;
["name1","name2","city","address1.street"].forEach(f => {
    const q = {}; q[f] = rx;
    print(f + ": " + db.institutions.countDocuments(q));
});'
```

---

## Running it

**In GitHub Actions:** open the repo → **Actions** tab → **E2E (Docker)** workflow →
**Run workflow** → pick branches → **Run**.

**Locally:**

```bash
# 1. build the seed (needs a local MiBi-Portal database)
node e2e/seed/make-seed.js

# 2. bring the stack up. The integration overlay publishes the server's 3000/1337 on the
#    host, which the two seeders need; drop it if you only want the Welcome-page smoke test.
docker compose -f e2e/docker-compose.yml -f e2e/docker-compose.integration.yml up -d --build --wait

# 3. seed the reference regexes and the accounts
PARSE_URL=http://localhost:1337/admin/parse PARSE_APP_ID=appId PARSE_MASTER_KEY=masterKey \
    node e2e/seed/seed-states.js
PARSE_URL=http://localhost:1337/admin/parse PARSE_APP_ID=appId PARSE_MASTER_KEY=masterKey \
    node e2e/seed/seed-users.js

# 4. run the specs
CYPRESS_BASE_URL=http://localhost:4200 npx cypress run --spec \
    'cypress/integration/ui/welcome.smoke.spec.ts,cypress/integration/e2e/user/login_out.spec.ts'
```

The specs can also run in a container, which is useful when the locally installed Cypress
binary is broken (on Windows it can fail with "Invalid or incompatible cached data
(cachedDataRejected)", after which `Cypress.exe` rejects even its own flags):

```bash
docker run --rm --network e2e_default -v "<path-to>/mibi-portal-client:/e2e" -w /e2e \
    -e CYPRESS_baseUrl=http://client:4200 cypress/included:13.17.0 \
    --spec "cypress/integration/ui/welcome.smoke.spec.ts,cypress/integration/e2e/user/login_out.spec.ts"
```

The server integration suite runs against the same stack:

```bash
cd ../mibi-portal-server
NODE_ENV=test MIBI_API_URL=http://localhost:3000 npm run test:integration -- --runInBand
```

`--runInBand` matters on failure only: with worker processes, a failing test carrying an
axios error crashes the worker while serializing it ("Converting circular structure to
JSON") and the real assertion is never reported.

**Mongo loads the seed only on a fresh data directory.** After changing the seed, tear the
volume down — `docker compose … down -v` — or the old database is reused and nothing changes.

`e2e/mongo/restore.sh` honours `SEED_DIR`, so the restore hook can be tried without the
container: `SEED_DIR=e2e/seed bash e2e/mongo/restore.sh` (it targets the database named in
the seed — do not point it at a database you care about).

---

## Where the seed lives

`e2e/seed/seed-data.js.gz` (~1.5 MB) and `e2e/seed/files/*.xlsx` (~270 KB) are **committed**.
They arrive with the checkout, so a CI run needs no secret and no download, and a local run
needs no database.

**Data protection:** approved for GitHub-hosted runners (2026-09-29). The seed holds
reference data plus `institutions` with the contact fields overwritten — no accounts, no
orders, no samples, no results; see [what the seed contains](#what-the-seed-does-and-does-not-contain).
It is still a file derived from a database with real submitter data, so **re-run the
person-name check below whenever the seed is refreshed** — the approval covers this content,
not whatever a future dump happens to include.

**Refreshing it:** `node e2e/seed/make-seed.js`, then commit the result. That adds ~1.5 MB to
the repository each time, so refresh when master data actually changes (AVV catalogue, NRL,
postcodes, validation errors), not routinely.

Setting the repository secret **`E2E_SEED_URL`** makes the workflow download a seed instead
of using the committed one — useful for trying a refreshed seed without committing it.

---

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/e2e.yml` | The **manual** (`workflow_dispatch`) pipeline: checkout → build images → fetch seed → start stack → seed states + users → integration tests → Cypress → upload reports. |
| `e2e/docker-compose.yml` | The 3-service stack: mongo, server (also hosts Parse + cloud code), client. |
| `e2e/docker-compose.integration.yml` | Overlay that publishes the server's 3000/1337 on the host — needed by the seeders and the jest integration suite. The workflow always uses it. |
| `e2e/docker/Dockerfile.server` | Multi-stage: builds `mibi-parse-cloud` (extra build context) **and** `mibi-portal-server` into one image, and writes a container `config/local.json` (Mongo URI, cloud path, Keycloak off, Parse `appId`/`masterKey` and a widened `masterKeyIps`). |
| `e2e/docker/Dockerfile.client` | Serves the Angular app via `ng serve` with `proxy.config.e2e.json`. |
| `e2e/mongo/restore.sh` | First-boot hook: unpacks the seed and loads it with mongosh. Never aborts the entrypoint. |
| `e2e/seed/make-seed.js` | Builds `seed-data.js.gz` from a local database, appends the canonical `states`, and copies the Parse files to `e2e/seed/files/`. |
| `e2e/seed/export-seed.mongosh.js` | The export itself: which collections are copied, what is scrubbed, what is wiped. |
| `e2e/seed/seed-users.js` | Creates the test accounts (plus their `_User`/`User_Info` consent rows) through Parse with the master key. |
| `e2e/seed/seed-states.js` | Fallback for a seed-less stack: fills the `states` class from `states.json`. Skips when rows exist. |
| `e2e/seed/states.json` | Canonical states master data (AVV id formats). Goes into the seed; do not replace it with a development copy. |
| `e2e/seed/files/` | Parse file contents (Excel templates), mounted as the server's data directory. Generated by `make-seed.js`, committed. |
| `e2e/.env.example` | Non-secret config knobs. Copy to `.env` for local runs. |

## Scope of this stack

| Topic | Decision |
|---|---|
| Database | **`mibiportal` only.** |
| Auth (Keycloak) | **Stubbed / not active** (`keycloak.enabled=false`). Login uses the portal's own `users` class. |
| CMS (Strapi) | **Dropped** — not in the stack. |
| Specs | Welcome-page smoke + login/logout. The `api/v2` and remaining `e2e` specs date from 2019–2022, predate the server's CSRF protection and the MPS-312 sample payload, and need their own ticket. |
| Mail | Accepted and discarded by a **fake SMTP sink** inside the server container (see `Dockerfile.server`). It has to be in that container: `DefaultMailService` hardcodes `localhost:25` and never reads host/port from configuration, so a separate mail-catcher service cannot be targeted. Without the sink every mail path fails with `ECONNREFUSED 127.0.0.1:25` — which the login reminder, verification and activation flows all walk through. Mail contents cannot be read; a spec that needs a verification link out of an e-mail will need a real catcher (mailpit) and, first, a configurable SMTP host in mibi-portal-server. |
| Login errors | Logging in as one of the three *non-enabled* accounts answers **500 / code 1**, because `users.controller.ts` `handleError` maps only `MalformedRequestError` and `AuthorizationError` — `UserNotVerifiedError` and `UserNotActivatedError` fall through to `fail()`. This is not a stack limitation and not caused by mail: `cypress/fixtures/error-responses.json` shows the existing specs expect exactly that response. Worth questioning as API design, but nothing here works around it. |
