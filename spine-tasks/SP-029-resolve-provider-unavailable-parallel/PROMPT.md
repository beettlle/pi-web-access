# Task: SP-029 — Fix resolveProvider unavailable parallel

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 0, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-029-resolve-provider-unavailable-parallel/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Fix resolveProvider() so unavailable parallel never returns parallel as dead last resort when no providers exist.

## Dependencies

- **None**

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

- `index.ts`
- `test/parallel.test.mjs`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | index.ts, test/parallel.test.mjs |
| fileScopeMustNotChange | curator-page.ts |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Fix parallel unavailable fallback branch in resolveProvider() (index.ts ~L190)

### Step 2: Implementation

- [ ] Add test for unavailable parallel with no providers — must not return parallel

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

- `feat(SP-029): complete Step N — description`
- `fix(SP-029): description`
- `test(SP-029): description`

## Do NOT

- Expand scope beyond File Scope
- Reorder global auto-chain priority

---

## Amendments (Added During Execution)
