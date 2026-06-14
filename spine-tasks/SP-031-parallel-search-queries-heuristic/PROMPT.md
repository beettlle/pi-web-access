# Task: SP-031 — Generate diverse search_queries

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-031-parallel-search-queries-heuristic/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Send 2-3 diverse search_queries from buildSearchRequestBody() per Parallel API best practices (heuristic, no LLM).

## Dependencies

- **Task:** SP-027 (parallel config cache invalidation)

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

- [ ] Add buildSearchQueriesFromObjective() pure helper

### Step 2: Implementation

- [ ] Wire into buildSearchRequestBody()

### Step 3: Implementation

- [ ] Test mock request body contains 2-3 diverse search_queries

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

- `feat(SP-031): complete Step N — description`
- `fix(SP-031): description`
- `test(SP-031): description`

## Do NOT

- Expand scope beyond File Scope
- Add LLM or external dependency for query generation

---

## Amendments (Added During Execution)
