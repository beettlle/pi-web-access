# Task: SP-025 — Map excerpt to search result snippet

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 0, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-025-parallel-search-snippet-mapping/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Map first excerpt to results[].snippet (truncated ~200 chars) in mapSearchResults() instead of empty string.

## Dependencies

- **Task:** SP-024 (parallel placeholder key rejection)

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

- [ ] Update mapSearchResults() to set snippet from first excerpt, truncated

### Step 2: Implementation

- [ ] Update parallel.test.mjs assertions for non-empty snippet

### Step 3: Testing & Verification

- [ ] Run verification: `npm test`
- [ ] Fix all failures

### Step 4: Documentation & Delivery

- [ ] Update STATUS.md with discoveries
- [ ] Create `.DONE` when complete

## Completion Criteria

- [ ] All steps complete
- [ ] Verification passing for in-scope changes

## Git Commit Convention

- `feat(SP-025): complete Step N — description`
- `fix(SP-025): description`
- `test(SP-025): description`

## Do NOT

- Expand scope beyond File Scope
- Change answer stitching or inlineContent mapping

---

## Amendments (Added During Execution)
