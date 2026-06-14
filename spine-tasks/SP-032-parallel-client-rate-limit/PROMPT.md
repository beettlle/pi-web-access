# Task: SP-032 — Parallel client rate limit

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-032-parallel-client-rate-limit/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Add Perplexity-style client rate limit (10 requests per 60s window) before Parallel search and extract API calls.

## Dependencies

- **Task:** SP-031 (parallel search queries heuristic)

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

- [ ] Add sliding-window rate limit check mirroring perplexity.ts pattern

### Step 2: Implementation

- [ ] Invoke before parallelFetch on search and extract

### Step 3: Implementation

- [ ] Add tests with mocked timestamps for throttle behavior

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

- `feat(SP-032): complete Step N — description`
- `fix(SP-032): description`
- `test(SP-032): description`

## Do NOT

- Expand scope beyond File Scope
- Add monthly billing counter unless needed for tests

---

## Amendments (Added During Execution)
