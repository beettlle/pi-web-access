# Task: SP-030 — Curator disabled Parallel button

**Created:** 2026-06-14
**Size:** S

## Review Level: 1 (Plan Only)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 2/8 — Blast radius: 1, Pattern novelty: 1, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-030-curator-disabled-parallel-button/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Show Parallel provider button disabled with tooltip when key invalid instead of hiding unavailable providers.

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

- `curator-page.ts`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `npm test` |
| fileScopeMustChange | curator-page.ts |
| fileScopeMustNotChange | curator-server.ts, index.ts, parallel.ts |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] Render all providers in buildProviderButtons; disabled + title when !available

### Step 2: Implementation

- [ ] Add CSS for .provider-btn.disabled

### Step 3: Implementation

- [ ] Verify /websearch shows grayed Parallel when key missing or placeholder

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

- `feat(SP-030): complete Step N — description`
- `fix(SP-030): description`
- `test(SP-030): description`

## Do NOT

- Expand scope beyond File Scope
- Change curator-server provider validation

---

## Amendments (Added During Execution)
