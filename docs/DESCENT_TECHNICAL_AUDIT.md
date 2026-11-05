# KRILLO DESCENT — Technical Audit

Audit date: 2026-11-05

Scope: analysis only. No existing source files, game logic, data, migrations, configuration, or UI components were changed for this audit. The only created file is this report.

## 1. Executive summary

DESCENT is already implemented as a complete seven-round client/server game. The `BEGIN DESCENT` button is wired to the frontend start function, the Worker exposes the required game API, a sample question bank exists, server-side scoring and timing exist, and the tests cover the main game flow.

The current local failure is not caused by a missing word bank or a missing button handler. It is caused by the local D1 database being uninitialized. A real browser click reaches the application, but `/api/start` returns HTTP 503 because the local database has no `rate_limits` table. The preceding homepage request to `/api/today` also returns HTTP 503 because the local database has no `puzzles` table.

The observed server errors are:

```text
D1_ERROR: no such table: puzzles: SQLITE_ERROR
D1_ERROR: no such table: rate_limits: SQLITE_ERROR
```

The Worker catches those database exceptions and replaces them with the generic response:

```json
{"error":"The signal is temporarily lost. Please retry."}
```

The frontend displays that message in `#boot-error`, so the user experiences the button as doing nothing.

The smallest operational prerequisite is to apply the existing D1 migrations to the intended local or remote D1 database before starting or deploying the game. That is a deployment/environment operation, not a missing game implementation. No new word bank is required to make local DESCENT playable: the existing `DEMO` bank is used when reference synchronization is disabled or unavailable.

## 2. Existing architecture

### Relevant file map

| Area | File | Responsibility |
|---|---|---|
| Server entry | [`src/worker.mjs`](../src/worker.mjs) | Cloudflare Worker routes, D1 access, puzzle loading, runs, answers, scoring, pause, review, feedback |
| Server-rendered page | [`src/html.mjs`](../src/html.mjs) | Homepage markup, `BEGIN DESCENT`, practice button, answer form, dialogs and runtime configuration |
| Client controller | [`public/app.mjs`](../public/app.mjs) | Click handlers, API calls, client state, phase transitions, timer display, answer submission, results and local history |
| Scene renderer | [`public/ocean.mjs`](../public/ocean.mjs) | Canvas scene, camera/depth animation, boat, effects and mascot positioning |
| Rules | [`public/rules.mjs`](../public/rules.mjs) | Tier scores, round constants, normalization, fuzzy/alias answer matching and result bands |
| Sample content | [`src/demo.mjs`](../src/demo.mjs) | Seven-prompt independently assembled fallback bank with accepted answers, tiers and aliases |
| Product settings | [`src/config.mjs`](../src/config.mjs) | Public game facts: seven rounds, 3-second preview, 25-second answer window, modes and limits |
| Schema | [`migrations/0001_initial.sql`](../migrations/0001_initial.sql) | `puzzles`, `runs`, `answers`, `rate_limits`, `feedback` tables and indexes |
| Pause schema | [`migrations/0002_pause.sql`](../migrations/0002_pause.sql) | Adds `runs.paused_at` |
| Local/runtime bindings | [`wrangler.jsonc`](../wrangler.jsonc) | Local D1, R2 and static asset bindings; local mode variables |
| Integration tests | [`tests/game.test.mjs`](../tests/game.test.mjs) | In-memory D1-style tests for game flow, scoring, ownership, pause, expiry and validation |
| Browser audits | [`scripts/browser-audit.mjs`](../scripts/browser-audit.mjs) and [`scripts/mobile-flow-audit.mjs`](../scripts/mobile-flow-audit.mjs) | Desktop/mobile gameplay and UI acceptance flows |

### Runtime relationship

```text
GET /
  └─ src/html.mjs
       └─ public/app.mjs
            ├─ GET /api/today
            ├─ POST /api/start       ← BEGIN DESCENT
            ├─ POST /api/next
            ├─ POST /api/answer
            ├─ POST /api/pause
            └─ GET /api/review
                                      └─ src/worker.mjs
                                           ├─ D1: puzzles, runs, answers, rate_limits
                                           ├─ optional R2 snapshots
                                           └─ optional krillion.io reference sync
```

There is one homepage route, not a separate DESCENT page. The game is a stateful client rendered on top of the homepage and a server-owned run.

## 3. Current game flow

### Step-by-step trace

| Step | Implementation | Status | Evidence |
|---|---|---|---|
| 1. User clicks BEGIN DESCENT | `#start-btn` is rendered in `src/html.mjs`; a listener is attached in `public/app.mjs` | Implemented | `src/html.mjs`, `public/app.mjs` |
| 2. Browser receives interaction | Listener calls `begin(false)` | Implemented | `$('start-btn').addEventListener('click',()=>begin(false))` |
| 3. Game initialization executes | `begin()` disables the button, initializes sound, calls `api('start',{practice:false})` | Implemented | `public/app.mjs` |
| 4. Session is created | Worker `/api/start` chooses daily mode, creates UUID, inserts a run and sets `ok_player` cookie | Implemented, currently blocked locally by missing tables | `src/worker.mjs`, `migrations/0001_initial.sql` |
| 5. Question is selected | `puzzleFor()` reads D1, optionally syncs reference data, or returns `DEMO` | Implemented | `src/worker.mjs`, `src/demo.mjs` |
| 6. Question is displayed | `showRound()` enters `preview`, fills prompt text and starts a 3-second preview | Implemented | `public/app.mjs`, `src/config.mjs` |
| 7. Player submits answer | Answer form calls `submit()`, which sends `POST /api/answer` | Implemented | `src/html.mjs`, `public/app.mjs` |
| 8. Answer is evaluated | Worker normalizes/matches aliases and conservative typos server-side | Implemented | `public/rules.mjs`, `src/worker.mjs` |
| 9. Score/state update | Worker transaction inserts answer and advances `runs.next_round`; score is tier-derived | Implemented | `src/worker.mjs`, `migrations/0001_initial.sql` |
| 10. Next question | Landing screen calls `next()`, then `POST /api/next` and `showRound()` | Implemented | `public/app.mjs` |
| 11. Completion/results | Round 7 marks the run complete; `showResults()` loads review and renders results | Implemented | `src/worker.mjs`, `public/app.mjs` |

### What happens in the current broken local environment

1. Initial page load starts the async `/api/today` request in `public/app.mjs`. This request reaches `puzzleFor()`.
2. `puzzleFor()` executes `SELECT content FROM puzzles WHERE date=?`.
3. The local D1 database has not had the migrations applied, so the request fails with `no such table: puzzles` and returns 503.
4. The homepage still renders because the client catches the initial request error and only exposes it through `#boot-error`; the button remains visible.
5. Clicking `BEGIN DESCENT` calls `begin(false)` correctly.
6. `POST /api/start` calls `limit()` before creating a run. `limit()` executes against `rate_limits`.
7. Because `rate_limits` is also absent, `/api/start` returns 503 before a run can be created.
8. `begin()` catches the response error, returns to `intro`, and writes the generic error into `#boot-error`.

Therefore the failure is a local infrastructure/schema initialization failure at the first server call, not a disconnected button or absent frontend game logic.

## 4. Root cause analysis

### Confirmed root cause

The local D1 database configured by [`wrangler.jsonc`](../wrangler.jsonc) has no schema. The existing migration files are present, but they have not been applied to the local database used by the running Worker.

The first missing table is `puzzles`, observed through `GET /api/today`. The start request then exposes the second missing table, `rate_limits`, observed through `POST /api/start`.

The required schema already exists in:

- [`migrations/0001_initial.sql`](../migrations/0001_initial.sql)
- [`migrations/0002_pause.sql`](../migrations/0002_pause.sql)

The project already declares the intended command in [`package.json`](../package.json):

```text
npm run db:local
npm run db:remote
```

No migration was executed as part of this audit because the request explicitly restricts the task to analysis and report creation.

### Contributing factors

1. The Worker catches all request exceptions and returns the same generic 503 response, so a schema problem is presented as a lost signal.
2. The homepage does not prevent the user from clicking `BEGIN DESCENT` after `/api/today` fails.
3. `wrangler.jsonc` uses a deliberate zero UUID placeholder for local development, which is valid for local D1 emulation but does not itself apply migrations.
4. The standard browser audit expects a system `chrome` channel. The installed Playwright Chromium binary can be used with an explicit executable path, but the packaged audit script is not configured for that path in this environment. This is separate from the game failure.

### Not the root cause

- The `BEGIN DESCENT` element has an event listener.
- The `begin()` function exists and calls the correct start endpoint.
- The server start endpoint exists.
- A question bank exists.
- The game state machine, timer and scoring code exist.
- The current unit/integration tests pass against an in-memory database where migrations are applied.

## 5. Existing functionality

### Session and modes

- Daily and practice modes are both implemented.
- Daily mode uses one run per player/date through the partial unique index `one_daily_per_player`.
- Practice mode creates a separate run and does not affect daily score or population comparison.
- Browser ownership uses a random `ok_player` HttpOnly cookie; there are no user accounts or authentication flows.
- A saved local `ok:run` record allows the client to resume a run on the same browser.

### Content loading

- D1 stores puzzle snapshots as JSON in `puzzles.content`.
- `REFERENCE_SYNC=false` uses the local `DEMO` bank.
- If `REFERENCE_SYNC=true` on the current date, the Worker fetches `/api/today` and `/api/reveal?date=...` from `krillion.io`, validates both responses, and caches the result in D1.
- R2 optionally stores a copy at `puzzles/YYYY-MM-DD.json`.
- If synchronization fails, `puzzleFor()` falls back to the clearly labeled sample bank.

### Gameplay

- Seven prompts per session.
- Three-second preview before the answer window.
- Twenty-five-second server answer window.
- Six rarity tiers with scores 10, 15, 30, 60, 85 and 100.
- Maximum score 700; each point corresponds to 10 metres.
- Server-side answer timing and scoring.
- Exact normalized matching, configured aliases and conservative edit-distance correction.
- Rejected answers and correction confirmation.
- Late timeout submissions score zero while preserving the round progression.
- Duplicate submissions are protected by the `(run_id, round)` primary key and state checks.
- Pause/resume is persisted server-side through `paused_at`.
- Animated descent, landing states, sound effects, tier effects and results are implemented client-side.
- Results include score, depth, tier chart, review and sharing.
- Local browser history and streak display exist.

### Operational safeguards

- Request rate limiting uses D1 `rate_limits`.
- Cross-origin POST requests are rejected when the `Origin` header is not the current origin.
- Run access is restricted to the owning browser identifier.
- Review is blocked until a run is complete.
- Raw typed answers are not sent to analytics events.
- Tests cover duplicate scoring, ownership, pause, expiry, answer matching, reference validation and documentation contracts.

## 6. Missing functionality

### Required before the current application can run locally

1. Apply the two existing D1 migrations to the local D1 database.
2. Restart or reload the local Worker if necessary.
3. Verify `GET /api/health`, `GET /api/today` and `POST /api/start` return successful responses.

This is environment setup, not a request to implement new game logic.

### Required before a production deployment

1. Apply migrations to the production D1 database using the production configuration.
2. Ensure the production D1 binding name and ID are correct.
3. Ensure R2 is available if reference snapshot persistence is desired.
4. Decide whether `REFERENCE_SYNC` should remain enabled.
5. If enabled, verify the external reference endpoints and permitted use of their data.
6. Run the production-oriented browser audit in a browser channel available to the environment.

### Not currently implemented, by design

These are not blockers for the existing DESCENT mode:

- User accounts or cross-device synchronization.
- Multiplayer.
- Themed packs or archive browsing.
- Paid features or checkout.
- A large independently authored historical question archive.
- Admin UI for content management.
- A database table that stores every answer as a separate content row; content answers are currently nested JSON in puzzle snapshots.

## 7. Word bank requirements

### Is a word bank missing?

No. There are two content paths already defined:

1. The local/sample path is [`src/demo.mjs`](../src/demo.mjs). It contains seven prompts and prepared answer entries.
2. The reference path is fetched and validated by `syncPuzzle()` in [`src/worker.mjs`](../src/worker.mjs), then cached in D1.

The current local failure occurs before either path can be used because the `puzzles` and `rate_limits` tables do not exist.

### Existing schema

The code-defined content structure is:

```js
{
  date: "YYYY-MM-DD",
  dayNumber: Number,
  source: String,
  sample: Boolean, // present for the local fallback path
  prompts: [
    {
      id: String,
      text: String,
      answers: [
        {
          answer: String,
          tier: "plankton" | "tooclever" | "schooler" | "rare" | "deepcut" | "krillion",
          aliases: String[], // optional
          quip: String // optional
        }
      ]
    }
  ]
}
```

`validateReference()` requires matching date, exactly seven prompts, matching prompt IDs and text between the today/reveal responses, at least one valid answer per prompt, string answers, and a tier present in `TIERS`.

### Storage model

The `puzzles` table stores the complete puzzle object as serialized JSON:

```text
puzzles(date PRIMARY KEY, day_number, source, content, updated_at)
```

The `answers` table is not the question bank. It stores a player's submitted answer and score for a particular run/round:

```text
answers(run_id, round, raw_answer, answer, tier, score, created_at)
```

### Requirements for future content work

Content contributors would need to provide seven prompt records, accepted answer strings, optional aliases, and one valid rarity tier per answer. The existing code also requires stable prompt IDs and same-day consistency between prompt and answer snapshots.

The following are recommendations, not existing requirements: a separate content authoring format, a content linter for duplicate normalized answers, coverage checks for each rarity tier, and a review workflow for ambiguity. No new entries are proposed or created in this audit.

## 8. Game mechanics

| Mechanic | Assessment | Evidence / notes |
|---|---|---|
| Seven questions | Fully implemented | `ROUNDS=7`; server completes on round 6 / seventh answer |
| Three-second preview | Fully implemented | `PREVIEW_MS=3000`; client preview phase |
| Twenty-five-second timer | Fully implemented | `ROUND_MS=25000`; server deadline is authoritative |
| Scoring | Fully implemented | Tier score comes from `TIERS`; client-supplied score is ignored |
| Answer normalization | Fully implemented | Accent/punctuation normalization in `rules.mjs` |
| Accepted aliases | Fully implemented | Per-entry aliases plus a small common-alias map |
| Typo correction | Fully implemented | Conservative distance allowance and confirmation UI |
| Difficulty progression | Implemented through prepared rarity tiers | The code does not dynamically generate difficulty; rarity/tier data controls depth |
| Rarity / answer frequency | Implemented as prepared tiers | No separate population-frequency algorithm is present |
| Streaks / bonuses | Partially implemented | Daily streak statistics are calculated locally; no score bonus is applied |
| Game completion | Fully implemented | Seventh accepted or timed-out answer marks `runs.completed` |
| Results screen | Fully implemented | Score, depth, chart, answer review and sharing |
| Player progression | Partially implemented | Local streak/history and unlockable buddy thresholds exist; no account progression |
| Logbook | Fully implemented locally | Browser localStorage history and logbook dialog |
| Daily Dive | Fully implemented if D1 schema/bindings exist | One daily run per browser/date; optional reference sync |
| Practice mode | Fully implemented if D1 schema/bindings exist | Separate run; excluded from daily statistics |
| Pause/resume | Fully implemented | Server-side `paused_at`, migration 0002 and client menu/guide hooks |
| Persistence | Fully implemented at the intended architecture | D1 server state plus local browser copy |
| Multiplayer/accounts | Not implemented | Explicitly outside current scope |

## 9. Technical dependencies

### Essential

- Node.js 24 or newer for local tooling and tests.
- Wrangler 4.151.1.
- Cloudflare Worker runtime.
- D1 binding named `DB` with migrations applied.
- Static asset binding named `ASSETS` pointing to `public/`.
- A browser with JavaScript and Web Audio support for the normal UI.
- The existing source files and `public/assets` bundle.

### Required for production content behavior

- A production D1 database configured in the production Wrangler file.
- `REFERENCE_SYNC=true` only if current reference synchronization is desired.
- Network access from the Worker to the two `krillion.io` endpoints used by `syncPuzzle()`.
- Optional R2 binding `BUCKET` for cached puzzle snapshots and assets.

### Optional configuration

- `ADMIN_TOKEN` for the authenticated manual `/api/admin/sync` endpoint.
- `GA4_ID`, `CLARITY_ID`, `GSC_VERIFY`, and `BING_VERIFY` for optional integrations.
- `REFERENCE_SYNC=false` is sufficient for the local sample game once D1 migrations are applied.

### Authentication and persistence

There is no account authentication. The `ok_player` cookie is the browser identity used to own runs. D1 stores runs, answers, feedback and puzzle snapshots. LocalStorage stores settings, draft answers, resumable run metadata and a local history copy.

## 10. Implementation roadmap

### Phase 1 — Initialize and verify the database

- Objective: make the already implemented DESCENT flow callable in the target environment.
- Required files: existing [`migrations/0001_initial.sql`](../migrations/0001_initial.sql), [`migrations/0002_pause.sql`](../migrations/0002_pause.sql), and the appropriate Wrangler configuration.
- Dependencies: access to the intended local or remote D1 binding.
- Expected result: `puzzles`, `runs`, `answers`, `rate_limits`, `feedback` and `paused_at` exist.
- Acceptance criteria: `/api/health`, `/api/today`, `/api/start`, `/api/next` and `/api/answer` return valid responses; `BEGIN DESCENT` enters preview.
- Complexity: low.

### Phase 2 — Run the existing automated and browser acceptance suite

- Objective: verify the full seven-round flow after database initialization.
- Required files: existing [`tests/game.test.mjs`](../tests/game.test.mjs), [`scripts/browser-audit.mjs`](../scripts/browser-audit.mjs), and [`scripts/mobile-flow-audit.mjs`](../scripts/mobile-flow-audit.mjs).
- Dependencies: initialized D1 and an available Playwright browser executable.
- Expected result: desktop and mobile flows reach answering, landing, results, review and reload states without console errors.
- Acceptance criteria: unit/integration tests pass; browser audit reports no page errors; seven rounds complete in daily/practice as intended.
- Complexity: medium.

### Phase 3 — Decide content source policy

- Objective: decide whether production should use the sample bank or validated reference snapshots.
- Required files: [`src/demo.mjs`](../src/demo.mjs), [`src/worker.mjs`](../src/worker.mjs), [`src/config.mjs`](../src/config.mjs), production Wrangler configuration.
- Dependencies: content/legal/product decision and, for reference sync, external endpoint availability.
- Expected result: a deliberate, documented content source with monitoring/fallback expectations.
- Acceptance criteria: a fresh date can load seven validated prompts and answer sets, or the labeled sample fallback is intentionally accepted.
- Complexity: medium.

### Phase 4 — Optional content quality improvements

- Objective: improve authoring and validation beyond the current runtime schema.
- Required files: new tooling would be needed; no such tooling is required by the current game.
- Dependencies: content owner, moderation rules and licensing decisions.
- Expected result: duplicate/ambiguity checks, tier coverage and content review before publication.
- Acceptance criteria: content passes an authoring linter and can be loaded without schema/date mismatch.
- Complexity: medium.

### Phase 5 — Optional product expansion

- Objective: add accounts, cross-device progression, themed packs or other out-of-scope features only if product requirements change.
- Required files: likely new schema, API, UI and security work.
- Dependencies: explicit product scope and privacy/security decisions.
- Expected result: an intentionally expanded product rather than a fix to the current DESCENT blocker.
- Acceptance criteria: separate requirements and acceptance tests agreed before implementation.
- Complexity: high.

## 11. Open questions

1. Should the target environment use the independently assembled `DEMO` bank, or should it enable live reference synchronization?
2. If reference synchronization is enabled, what is the approved policy for storing and serving those snapshots?
3. Which exact production Wrangler configuration and D1 database should receive migrations?
4. Is the current browser-cookie identity model acceptable, or are accounts/cross-device sync now required?
5. Is a larger independently authored question archive required, or is the existing fallback only for outages?
6. Should the generic 503 message expose a more actionable configuration error in local development? This is an optional diagnostics improvement, not required to start the game.
7. Should browser acceptance use the existing `channel: 'chrome'` contract, or should the audit scripts accept the installed Playwright Chromium executable path?
8. Are streaks intended to remain informational, or should they eventually affect score/progression?

## 12. Recommended next steps

1. Apply the existing migrations to the intended local D1 database; do not create a new word bank first.
2. Restart the local Worker and verify `/api/health`, `/api/today` and `/api/start`.
3. Run the existing desktop and mobile browser audits with an available Chromium/Chrome executable.
4. Decide the production content policy: sample fallback only, or validated reference synchronization.
5. Apply migrations to production D1 before deployment and run the acceptance suite against the target environment.
6. Only after the flow is operational, decide whether any content-authoring or diagnostics improvements are needed.

## Audit conclusion

The game does not currently start because the local D1 schema has not been initialized, not because DESCENT logic or a word bank is absent. The existing implementation can be reused almost completely: frontend flow, server state machine, answer validation, scoring, timing, persistence schema, sample content, pause/resume, results and tests are already present. Before any implementation work, the only required input is confirmation of the target database/environment and the desired production content source.
