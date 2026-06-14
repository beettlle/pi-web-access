# Task: SP-034 — Open upstream PR

**Created:** 2026-06-14
**Size:** S

## Review Level: 0 (None)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 1/8 — Blast radius: 1, Pattern novelty: 0, Security: 0, Reversibility: 1

## Canonical Task Folder

```
spine-tasks/SP-034-upstream-pr-open/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Open PR against https://github.com/nicobailon/pi-web-access main using gh pr create.

## Dependencies

- **Task:** SP-033 (upstream pr branch prep)

## Context to Read First

**Tier 2:**
- `spine-tasks/CONTEXT.md`
- `spine-tasks/_explore/parallel-provider-integration/master-plan.md`

**Tier 3:**
- `parallel.ts` — Parallel REST client
- `perplexity.ts` — rate limit and key patterns (SP-032, SP-024)

## Environment

- **Workspace:** pi-web-access repo root
- **Services required:** gh CLI, git push access to fork or upstream

## File Scope

- _(git/gh operations only — no product file edits)_

## Contract

| Field | Value |
|-------|-------|
| testCommand | `true` |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Push feat/parallel-provider to origin or fork

### Step 2: Implementation

- [ ] gh pr create with title and body per plan; record PR URL in STATUS.md

### Step 3: Testing & Verification

- [ ] Run verification: `true`
- [ ] Fix all failures

### Step 4: Documentation & Delivery

- [ ] Update STATUS.md with discoveries
- [ ] Create `.DONE` when complete

## Completion Criteria

- [ ] All steps complete
- [ ] Verification passing for in-scope changes

## Git Commit Convention

- `feat(SP-034): complete Step N — description`
- `fix(SP-034): description`
- `test(SP-034): description`

## Do NOT

- Publish npm independently
- Include spine orchestration files in PR

---

## Amendments (Added During Execution)
