# pi-web-access — Context

**Last Updated:** 2026-06-14
**Status:** Active
**Next Task ID:** SP-024

---

## Current State

Parallel provider integration epic. Plans moved from Cursor CreatePlan artifacts to `spine-tasks/_explore/parallel-provider-integration/`.

**Explore complete:** parallel-provider-integration (2026-06-14)

### Phase 1 — parallel.ts foundation

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-001 | Config/auth | Pending | — |
| SP-002 | Request infra | Pending | SP-001 |
| SP-003 | Search mappers | Pending | SP-001 |
| SP-004 | searchWithParallel | Pending | SP-002, SP-003 |
| SP-005 | Extract mappers | Pending | SP-001 |
| SP-006 | extractWithParallel | Pending | SP-002, SP-005 |

### Phase 2 — gemini-search.ts routing

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-007 | Types/imports | Pending | SP-004 |
| SP-008 | Explicit branch | Pending | SP-007 |
| SP-009 | Auto-chain | Pending | SP-007 |
| SP-010 | Error messages | Pending | SP-009 |

### Phase 3 — index.ts provider wiring

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-011 | Availability type | Pending | SP-001 |
| SP-012 | getProviderAvailability | Pending | SP-011 |
| SP-013 | normalizeProviderInput | Pending | — |
| SP-014 | resolveProvider | Pending | SP-012, SP-013 |
| SP-015 | Tool schema | Pending | SP-013 |

### Phase 4 — Integration

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-016 | extract fallback | Pending | SP-006, SP-010 |
| SP-017 | Curator UI | Pending | SP-014, SP-015 |

### Phase 5 — Tests

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-018 | Test harness | Pending | SP-004, SP-006 |
| SP-019 | Availability tests | Pending | SP-018 |
| SP-020 | Search mapper tests | Pending | SP-018, SP-003 |
| SP-021 | Extract mapper tests | Pending | SP-018, SP-005 |
| SP-022 | Routing smoke | Pending | SP-018, SP-009, SP-014 |

### Phase 6 — Docs

| Task | Summary | Status | Deps |
|------|---------|--------|------|
| SP-023 | README + CHANGELOG | Pending | SP-016, SP-017, SP-022 |

---

## Execution policy

**Auto-chain order:** Exa → Parallel → Perplexity → Gemini

1. **Preflight** before every batch: `spine preflight`.
2. **Land loop:** `spine batch start` → `spine status --diagnose` → `spine gate approve` → `spine integrate` → `spine batch complete`.
3. **Never** hand-edit `.spine/batch-state.json`.

**Launch:** `spine tasks validate pending` → `spine plan pending` → `spine preflight` → `spine batch start pending`

---
