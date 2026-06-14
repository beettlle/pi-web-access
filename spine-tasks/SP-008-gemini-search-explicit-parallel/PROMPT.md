# Task: SP-008 — Explicit provider parallel branch

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel provider integration subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-008-gemini-search-explicit-parallel/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Add strict explicit provider === parallel branch before auto fallback.

## Dependencies

- **Task:** SP (gemini search parallel types)

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

- `gemini-search.ts`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | gemini-search.ts |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Insert parallel explicit branch calling searchWithParallel

### Step 2: Implementation

- [ ] Return attributed result with provider parallel

### Step 3: Implementation

- [ ] Ensure no silent fallback when explicit

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

- `feat(SP-008): complete Step N — description`
- `fix(SP-008): description`
- `test(SP-008): description`

## Do NOT

- Expand scope beyond File Scope
- Shell out to parallel-cli
- Reorder Exa before Parallel globally in auto chain

---

## Amendments (Added During Execution)
