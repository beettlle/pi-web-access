# Task: SP-027 — Invalidate Parallel config cache on save

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 0, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-027-parallel-config-cache-invalidation/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Invalidate parallel.ts module config cache when saveConfig() writes ~/.pi/web-search.json so key changes apply without pi restart.

## Dependencies

- **Task:** SP-026 (parallel extract full content)

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
- `index.ts`
- `test/parallel.test.mjs`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | parallel.ts, index.ts, test/parallel.test.mjs |
| fileScopeMustNotChange | curator-page.ts, gemini-search.ts |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Export clearParallelConfigCache() from parallel.ts

### Step 2: Implementation

- [ ] Call clearParallelConfigCache() from index.ts saveConfig() after write

### Step 3: Implementation

- [ ] Add spawn test: saveConfig updates isParallelAvailable() without restart

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

- `feat(SP-027): complete Step N — description`
- `fix(SP-027): description`
- `test(SP-027): description`

## Do NOT

- Expand scope beyond File Scope
- Invalidate caches in other provider modules

---

## Amendments (Added During Execution)
