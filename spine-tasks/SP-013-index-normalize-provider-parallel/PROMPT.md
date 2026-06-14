# Task: SP-013 — index normalizeProviderInput parallel

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel provider integration subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-013-index-normalize-provider-parallel/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Accept "parallel" in normalizeProviderInput().

## Dependencies

- **None**

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

- `index.ts`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | index.ts |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Add parallel to allowed provider values in normalizeProviderInput

### Step 2: Testing & Verification

- [ ] Run FULL test suite: `npm test`
- [ ] Fix all failures

### Step 3: Documentation & Delivery

- [ ] Update STATUS.md with discoveries
- [ ] Create `.DONE` when complete

## Completion Criteria

- [ ] All steps complete
- [ ] Tests passing for in-scope changes

## Git Commit Convention

- `feat(SP-013): complete Step N — description`
- `fix(SP-013): description`
- `test(SP-013): description`

## Do NOT

- Expand scope beyond File Scope
- Shell out to parallel-cli
- Reorder Exa before Parallel globally in auto chain

---

## Amendments (Added During Execution)
