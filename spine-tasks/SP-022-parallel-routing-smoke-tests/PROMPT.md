# Task: SP-022 — Parallel routing smoke tests

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel provider integration subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-022-parallel-routing-smoke-tests/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Smoke tests for normalizeSearchProvider and auto-chain with/without Parallel key.

## Dependencies

- **Task:** SP (parallel test harness)
- **Task:** SP (gemini search auto chain parallel)
- **Task:** SP (index resolve provider parallel)

## Context to Read First

**Tier 2:**
- `spine-tasks/CONTEXT.md`
- `spine-tasks/_explore/parallel-provider-integration/master-plan.md`
- `spine-tasks/_explore/parallel-provider-integration/decomposition-plan.md`

**Tier 3:**
- `perplexity.ts` — config/auth pattern
- `exa.ts` — search mappers and domain/recency filters

## Environment

- **Workspace:** pi-web-access repo root
- **Services required:** None

## File Scope

- `test/parallel.test.mjs`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | test/parallel.test.mjs |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Test normalizeSearchProvider(parallel)

### Step 2: Implementation

- [ ] Test auto chain calls /v1/search when only Parallel key set

### Step 3: Implementation

- [ ] Test auto chain skips api.parallel.ai without key

### Step 4: Testing & Verification

- [ ] Run FULL test suite: `npm test`
- [ ] Fix all failures

### Step 5: Documentation & Delivery

- [ ] Update STATUS.md with discoveries
- [ ] Create `.DONE` when complete

## Completion Criteria

- [ ] All steps complete
- [ ] Tests passing for in-scope changes

## Git Commit Convention

- `feat(SP-022): complete Step N — description`
- `fix(SP-022): description`
- `test(SP-022): description`

## Do NOT

- Expand scope beyond File Scope
- Shell out to parallel-cli
- Reorder Exa before Parallel globally in auto chain

---

## Amendments (Added During Execution)
