---
name: review-changes
description: Reviews diffs for regressions, version-specific APIs, authorization gaps, hardcoded catalog data, and UI states; runs pnpm lint when code changed. Use after implementing changes or when the user asks for a code review.
---

# Review changes

## Workflow

1. Read the **full diff** of every modified file.
2. **Imports and APIs** — Match Next 16, React 19, Prisma 7, next-auth v4, Zod 4, Table v9 patterns per `stack` rule.
3. **Security** — Server authorization on mutations; no leak of unpublished data or internal errors.
4. **Catalog** — No hardcoded fictional products in user-facing or production seed paths.
5. **UI** (if `.tsx`/`.css` changed) — States, a11y, shadcn tokens; not starter-page zinc/pill patterns. **Persian RTL:** natural Persian copy, `lang="fa-IR"` / `dir="rtl"` on shells, logical CSS, Radix direction and mixed-direction text; claim mobile/tablet/desktop RTL checks only if performed.
6. **Prisma** (if schema/migrations touched) — Schema vs init migration conflict documented; no destructive migrate without user ask.
7. **Checks** — Run `pnpm lint` when application code changed. Report pass/fail.
8. **Verification honesty** — Claim browser or Docker verification only if actually performed.
9. **Subagents (significant diffs)** — Keep this skill’s checklist. Also delegate to the matching read-only specialist when warranted (`security-auditor`, `ui-rtl-reviewer`, `architecture-reviewer`, or `implementation-verifier`), then synthesize findings. Do not replace this skill with a subagent alone.

## Report format

1. **Findings** — Critical first, then suggestions.
2. **Checks** — Lint and any other commands run.
3. **Not verified** — List anything skipped (tests, Docker, browser, build, RTL viewports).

## Completion criteria

- [ ] Findings listed before summary
- [ ] Lint result stated when code changed
- [ ] No false claims about Docker/browser verification
