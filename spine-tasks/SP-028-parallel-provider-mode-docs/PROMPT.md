# Task: SP-028 — Document provider parallel vs auto

**Created:** 2026-06-14
**Size:** S

## Review Level: 0 (None)

**Assessment:** Parallel audit hardening subtask with bounded file scope.
**Score:** 1/8 — Blast radius: 0, Pattern novelty: 0, Security: 0, Reversibility: 0

## Canonical Task Folder

```
spine-tasks/SP-028-parallel-provider-mode-docs/
├── PROMPT.md
├── STATUS.md
├── .reviews/
└── .DONE
```

## Mission

Document strict provider parallel (no fallback) vs provider auto (Exa → Parallel → Perplexity → Gemini) in README and CHANGELOG.

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

- `README.md`
- `CHANGELOG.md`

## Contract

| Field | Value |
|-------|-------|
| testCommand | `true` |
| fileScopeMustChange | README.md, CHANGELOG.md |
| fileScopeMustNotChange | parallel.ts, index.ts, curator-page.ts |

## Steps

### Step 0: Preflight

- [ ] Dependencies satisfied
- [ ] File scope paths exist or will be created

### Step 1: Implementation

- [ ] README: config section and web_search params explain parallel vs auto

### Step 2: Implementation

- [ ] CHANGELOG [Unreleased]: add provider strict vs auto note

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

- `feat(SP-028): complete Step N — description`
- `fix(SP-028): description`
- `test(SP-028): description`

## Do NOT

- Expand scope beyond File Scope
- Change runtime provider behavior

---

## Amendments (Added During Execution)
