# Task: SP-024 — Reject placeholder Parallel API keys

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 1, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-024-parallel-placeholder-key-rejection/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Reject placeholder Parallel API keys so isParallelAvailable() returns false for REPLACE_WITH_YOUR_PARALLEL_API_KEY, dummy, and other non-real keys.

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

- [ ] Add isPlaceholderApiKey() with denylist and minimum length check

### Step 2: Implementation

- [ ] Wire placeholder rejection into resolveApiKey() and isParallelAvailable()

### Step 3: Implementation

- [ ] Add tests: placeholder false, valid-shaped key true, PARALLEL_API_KEY env override

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

- `feat(SP-024): complete Step N — description`
- `fix(SP-024): description`
- `test(SP-024): description`

## Do NOT

- Expand scope beyond File Scope
- Shell out to parallel-cli
- Change search or extract API behavior beyond key validation

---

## Amendments (Added During Execution)
