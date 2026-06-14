# Task: SP-026 — Parallel extract full_content retry

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-026-parallel-extract-full-content/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

When Parallel Extract excerpts are below MIN_USEFUL_CONTENT (500), retry once with advanced_settings.full_content enabled.

## Dependencies

- **Task:** SP-025 (parallel search snippet mapping)

## Context to Read First

**Tier 2:**
- `spine-tasks/CONTEXT.md`
- `spine-tasks/_explore/parallel-provider-integration/master-plan.md`

**Tier 3:**
- `parallel.ts` — Parallel REST client
- `perplexity.ts` — rate limit and key patterns (SP-032, SP-024)

## Environment

- **Workspace:** pi-web-access repo root
- **Services required:** None

## File Scope

- `parallel.ts`
- `test/parallel.test.mjs`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | parallel.ts, test/parallel.test.mjs |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Add extract request helper supporting advanced_settings.full_content

### Step 2: Implementation

- [ ] Retry extractWithParallel once with full_content when mapped content is too short

### Step 3: Implementation

- [ ] Add tests: thin excerpts trigger full_content path and return useful content

### Step 4: Testing & Verification

- [ ] Run verification: `npm test`
- [ ] Fix all failures

### Step 5: Documentation & Delivery

- [ ] Update STATUS.md with discoveries
- [ ] Create `.DONE` when complete

## Completion Criteria

- [ ] All steps complete
- [ ] Verification passing for in-scope changes

## Git Commit Convention

- `feat(SP-026): complete Step N — description`
- `fix(SP-026): description`
- `test(SP-026): description`

## Do NOT

- Expand scope beyond File Scope
- Change extract fallback order in extract.ts

---

## Amendments (Added During Execution)
