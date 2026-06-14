# Task: SP-023 — Parallel README and CHANGELOG

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel provider integration subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-023-parallel-docs-changelog/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Document Parallel config, env vars, auto-chain, fetch_content chain, files table; CHANGELOG [Unreleased] entry.

## Dependencies

- **Task:** SP (extract parallel fallback)
- **Task:** SP (curator parallel ui)
- **Task:** SP (parallel routing smoke tests)

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

- `README.md`
- `CHANGELOG.md`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | README.md, CHANGELOG.md |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Update README.md provider config and auto-chain docs

### Step 2: Implementation

- [ ] Update fetch_content fallback chain documentation

### Step 3: Implementation

- [ ] Add CHANGELOG.md [Unreleased] Parallel entry

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

- `feat(SP-023): complete Step N — description`
- `fix(SP-023): description`
- `test(SP-023): description`

## Do NOT

- Expand scope beyond File Scope
- Shell out to parallel-cli
- Reorder Exa before Parallel globally in auto chain

---

## Amendments (Added During Execution)
