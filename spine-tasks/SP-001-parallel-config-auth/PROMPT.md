# Task: SP-001 — Parallel config and availability

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel provider integration subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-001-parallel-config-auth/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Create parallel.ts foundation: constants, loadConfig cache, getApiKey from PARALLEL_API_KEY / parallelApiKey, isParallelAvailable(), hasParallelApiKey().

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

- `parallel.ts`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | parallel.ts |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Config and availability exports

- [ ] Add PARALLEL_SEARCH_URL, PARALLEL_EXTRACT_URL, CONFIG_PATH constants
- [ ] Implement loadConfig() with module cache mirroring perplexity.ts
- [ ] Implement normalizeApiKey(), getApiKey() with clear setup error pointing to platform.parallel.ai
- [ ] Export isParallelAvailable() and hasParallelApiKey()

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

- `feat(SP-001): complete Step N — description`
- `fix(SP-001): description`
- `test(SP-001): description`

## Do NOT

- Expand scope beyond File Scope
- Shell out to parallel-cli
- Reorder Exa before Parallel globally in auto chain

---

## Amendments (Added During Execution)
