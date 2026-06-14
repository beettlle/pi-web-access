# Task: SP-033 — Prepare upstream PR branch

**Created:** 2026-06-14
**Size:** M

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 3/8 — Blast radius: 2, Pattern novelty: 1, Security: 0, Reversibility: 1

## Canonical Task Folder

```
spine-tasks/SP-033-upstream-pr-branch-prep/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Prepare feat/parallel-provider branch from nicobailon/pi-web-access main with product code only (no spine-tasks/.spine).

## Dependencies

- **Task:** SP-027 (parallel config cache invalidation)
- **Task:** SP-028 (parallel provider mode docs)
- **Task:** SP-029 (resolve provider unavailable parallel)
- **Task:** SP-030 (curator disabled parallel button)
- **Task:** SP-032 (parallel client rate limit)

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
- `gemini-search.ts`
- `extract.ts`
- `index.ts`
- `curator-page.ts`
- `curator-server.ts`
- `README.md`
- `CHANGELOG.md`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | parallel.ts, gemini-search.ts, extract.ts, index.ts, curator-page.ts, curator-server.ts, README.md, CHANGELOG.md |
| fileScopeMustNotChange | spine-tasks/**, .spine/** |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Add upstream remote https://github.com/nicobailon/pi-web-access.git and fetch main

### Step 2: Implementation

- [ ] Create feat/parallel-provider from upstream/main with product-only diff

### Step 3: Implementation

- [ ] Squash to 1-3 logical commits (feat, tests, docs); run npm test; record branch name and diff stat in STATUS.md

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

- `feat(SP-033): complete Step N — description`
- `fix(SP-033): description`
- `test(SP-033): description`

## Do NOT

- Include spine-tasks/ or .spine/ in upstream branch
- Publish npm package
- Force-push upstream main

---

## Amendments (Added During Execution)
