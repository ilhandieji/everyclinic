---
name: review-changes
description: Reviews diffs for regressions, version-specific APIs, authorization gaps, ecommerce semantics in medical workflows, and UI states; runs pnpm lint when code changed. Use after implementing changes or when the user asks for a code review.
---

# Review changes

## Workflow

1. Read the **full diff** of every modified file.
2. **Imports and APIs** — Match Next 16, React 19, Prisma 7, next-auth v4, Zod 4, Table v9 patterns per `stack`.
3. **Security** — Server authorization on mutations; no leak of unpublished configuration, clinical records, or internal errors. Browser-supplied ids are not authorization.
4. **Domain boundaries** — New medical entities are not named `Product`, `Cart`, or `Order`. A service is not stock. An appointment is not an order. Appointment status and payment status are separate. Prescriptions and medication history are not purchases. Public site settings do not accept arbitrary HTML. No fictional patients, services, or clinical facts in seeds or default UI. Existing auth tables were not renamed in passing.
5. **UI** (if `.tsx`/`.css` changed) — States, a11y, shadcn tokens. Do not copy `auth-card` gradient motion onto clinical screens. **Persian RTL:** natural Persian copy, `lang="fa-IR"` / `dir="rtl"` on shells, logical CSS, Radix direction, and mixed-direction text. Claim mobile/tablet/desktop RTL checks only if performed.
6. **Prisma** (if schema/migrations touched) — Init migration was rewritten in place and the follow-up migration still drops legacy `Post`/`User`. No destructive migrate without user ask. No silent tenant choice.
7. **Checks** — Run `pnpm lint` when application code changed. Report pass/fail. Skip lint when only AI docs or rules changed, and say so.
8. **Verification honesty** — Claim browser, Docker, notification delivery, or payment success only if actually performed.
9. **Subagents (significant diffs)** — Keep this checklist. Also delegate to the matching read-only specialist when warranted (`security-auditor`, `medical-domain-reviewer`, `scheduling-payments-reviewer`, `ui-rtl-reviewer`, `architecture-reviewer`, or `implementation-verifier`), then synthesize findings.

## Report format

1. **Findings** — Critical first, then suggestions.
2. **Checks** — Lint and any other commands run.
3. **Not verified** — List anything skipped (tests, Docker, browser, build, RTL viewports, payment or notification delivery).

## Completion criteria

- [ ] Findings listed before summary
- [ ] Lint result stated when code changed
- [ ] No false claims about Docker, browser, delivery, or payment verification
