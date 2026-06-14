# pi-web-access — Context

**Last Updated:** 2026-06-14
**Status:** Active
**Next Task ID:** SP-035

---

## Current State

Parallel provider integration complete (SP-001–SP-023). Audit hardening and upstream PR staged (SP-024–SP-034).

**Explore complete:** parallel-provider-integration (2026-06-14)

### Phase 1–6 — Parallel integration (complete)

SP-001 through SP-023 delivered parallel.ts, routing, curator UI, tests, and docs. All have `.DONE`.

### Phase 7 — Audit hardening

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-024 | Placeholder key rejection | Pending | — |
| SP-025 | Snippet mapping | Pending | SP-024 |
| SP-026 | Extract full_content retry | Pending | SP-025 |
| SP-027 | Config cache invalidation | Pending | SP-026 |
| SP-028 | Provider parallel vs auto docs | Pending | — |
| SP-029 | resolveProvider unavailable fix | Pending | — |
| SP-030 | Curator disabled Parallel button | Pending | — |
| SP-031 | Diverse search_queries | Pending | SP-027 |
| SP-032 | Client rate limit | Pending | SP-031 |

### Phase 8 — Upstream PR (last)

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-033 | Prepare upstream branch | Pending | SP-027, SP-028, SP-029, SP-030, SP-032 |
| SP-034 | Open PR to nicobailon/pi-web-access | Pending | SP-033 |

---

## Execution policy

**Auto-chain order:** Exa → Parallel → Perplexity → Gemini

**Upstream target:** https://github.com/nicobailon/pi-web-access (PR via SP-034; no standalone npm publish)

1. **Preflight** before every batch: `spine preflight`.
2. **Land loop:** `spine batch start` → `spine status --diagnose` → `spine gate approve` → `spine integrate` → `spine batch complete`.
3. **Never** hand-edit `.spine/batch-state.json`.
4. **parallel.ts serial chain:** SP-024→032 must not run in parallel lanes.

**Launch:** `spine tasks validate pending` → `spine plan pending` → `spine preflight` → `spine batch start pending`

---
