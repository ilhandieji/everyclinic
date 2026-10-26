# AI agent guide

This document indexes **project** Cursor rules, skills, and read-only subagents. It does not replace them. [AGENTS.md](../../AGENTS.md) at the repo root is Intent-managed for external skills and contains the Next.js agent block. Do not edit those managed regions. The product domain is [domain-model.md](domain-model.md).

**Skills** = repeatable procedures the main agent runs. **Subagents** = independent read-only reviewers. They do not edit the working tree.

Updating these instructions does not migrate the application. Auth is implemented in source and has not been runtime-verified here. Appointments, clinical records, and payments are not built.

## Mandatory vs optional

| Kind | Location | Mandatory for agents |
|------|----------|----------------------|
| Always-on rules | `.cursor/rules/core-workflow.mdc`, `medical-domain.mdc`, `local-environments.mdc`, `persian-rtl.mdc` | Yes |
| Scoped rules | `.cursor/rules/stack.mdc`, `backend-security.mdc`, `ui-conventions.mdc` | Yes when matching files are in scope |
| Project skills | `.cursor/skills/*/SKILL.md` | Use when the task matches the skill description |
| Project subagents | `.cursor/agents/*.md` | Delegate for substantial review (read-only; main agent edits) |
| Intent skills | Via `pnpm exec intent list` / `load` per AGENTS.md | Yes for substantial matching work. If the `intent` binary is missing, report that and do not download a replacement |
| Domain proposal | `docs/ai/domain-model.md` | Read before medical-domain implementation |
| This guide | `docs/ai/agent-guide.md` | Reference only |

## Rules

| File | Purpose | When it applies |
|------|---------|-----------------|
| [core-workflow.mdc](../../.cursor/rules/core-workflow.mdc) | Pre-edit review, medical-entity check, subagent delegation, Git and dependency restrictions, Intent | Every task |
| [medical-domain.mdc](../../.cursor/rules/medical-domain.mdc) | Doctor–patient boundaries and the ban on ecommerce semantics | Every task |
| [local-environments.mdc](../../.cursor/rules/local-environments.mdc) | Native dev versus Docker, destructive-operation ban, no real patient data locally | Every task |
| [persian-rtl.mdc](../../.cursor/rules/persian-rtl.mdc) | Persian fa-IR and mandatory RTL for public, clinical, and financial UI | Every task |
| [stack.mdc](../../.cursor/rules/stack.mdc) | Verified versions (Next 16, Prisma 7, next-auth v4, Zod 4, and related libraries) | `**/*.{ts,tsx,css,prisma}` |
| [backend-security.mdc](../../.cursor/rules/backend-security.mdc) | Auth versus authorization, Zod, sensitive data, migration hazard, uploads | `src/**`, `prisma/**` |
| [ui-conventions.mdc](../../.cursor/rules/ui-conventions.mdc) | shadcn/Radix, accessibility, states, restrained design | `src/**/*.tsx`, `src/**/*.css` |
| [architecture.mdc](../../.cursor/rules/architecture.mdc) | Directory roles, import direction, and where new code belongs | `src/**`, `prisma/**` |

`product-and-environments.mdc` has been removed. Docker rules now live in `local-environments.mdc`.

## Skills

| Skill | Use when |
|-------|----------|
| [implement-feature](../../.cursor/skills/implement-feature/SKILL.md) | Adding or changing application behavior |
| [admin-crud](../../.cursor/skills/admin-crud/SKILL.md) | Authorized configuration for services and public site settings. Not clinical history |
| [secure-uploads](../../.cursor/skills/secure-uploads/SKILL.md) | Public service media, or private clinical files when a task explicitly asks |
| [appointment-lifecycle](../../.cursor/skills/appointment-lifecycle/SKILL.md) | Physician-scheduled appointments, conflicts, status, appointment reminders |
| [clinical-records](../../.cursor/skills/clinical-records/SKILL.md) | Notes, prescriptions, medication history, follow-up reminders |
| [payments-and-installments](../../.cursor/skills/payments-and-installments/SKILL.md) | Prices, obligations, payment attempts, installments |
| [review-changes](../../.cursor/skills/review-changes/SKILL.md) | After edits or when asked for review |
| [docker-verify](../../.cursor/skills/docker-verify/SKILL.md) | User asks for Docker verification, or before claiming Docker works |

Not present, on purpose: a separate physician-site skill (`admin-crud` plus `medical-domain`), a healthcare-security skill (`security-auditor`), and a Persian RTL skill (`ui-rtl-reviewer`).

## Subagents (read-only)

All use `model: inherit` and `readonly: true`. Prompts forbid edits. Invoke in the **current workspace** only (no cloud agent, no Git worktree). Policy: [core-workflow.mdc](../../.cursor/rules/core-workflow.mdc).

| Agent | Use when |
|-------|----------|
| [architecture-reviewer](../../.cursor/agents/architecture-reviewer.md) | Significant structure or cross-layer design |
| [security-auditor](../../.cursor/agents/security-auditor.md) | Auth, patient-record access, tenant isolation, uploads, logging |
| [medical-domain-reviewer](../../.cursor/agents/medical-domain-reviewer.md) | Domain meaning and ecommerce leakage |
| [scheduling-payments-reviewer](../../.cursor/agents/scheduling-payments-reviewer.md) | Appointment concurrency, reminders, prices, payments, installments |
| [ui-rtl-reviewer](../../.cursor/agents/ui-rtl-reviewer.md) | Substantial Persian RTL UI |
| [implementation-verifier](../../.cursor/agents/implementation-verifier.md) | Before calling significant feature work complete |

Do not call these for a trivial copy or style edit.

## Adding new rules or skills

- **Rules:** Add a focused `.mdc` under `.cursor/rules/`. One concern per file. Use `alwaysApply: true` only when the rule must apply before any file is opened. Avoid duplicating text from existing rules or from `domain-model.md`.
- **Skills:** Add `.cursor/skills/<kebab-name>/SKILL.md` with `name` and a third-person `description` (what and when). Keep procedures in skills.
- **Subagents:** Add `.cursor/agents/<kebab-name>.md` with `name`, a specific `description`, `model: inherit`, `readonly: true`, and a read-only prompt. Wire delegation in `core-workflow` only when the specialist is distinct from an existing one.

## Known repo facts (for agents)

- Branch `main`. Do not create branches unless the user asks. Do not change Git identity.
- Auth route and credentials flow exist in source. `User` has no role column. Physician access is a `PhysicianProfile` row. `pnpm test` does not exercise login.
- Do not rewrite applied migrations. `20261022180000_nextauth_credentials` is a no-op. Keep `service_requests_one_pending`, `medical_services_price_bounds`, and `physician_profiles_singleton_is_one`.
- Prisma config file: `prisma7.config.ts`.
- Local Compose is `compose.yml`. Native `pnpm dev` is not Docker verification.
- [README.md](../../README.md) introduces the platform and still links to Next.js learning docs. It does not list unimplemented features as available.
- [docs/architecture.md](../architecture.md) is the directory map. Do not reintroduce store wording on physician-site pages.

## Optional, not mandatory

Remove this section without changing rules if you do not want these recommendations.

- **Tests:** No test script in `package.json`. Do not add a runner without user approval. If a script appears later, run it for relevant changes.
- **`.env.example`:** Useful for onboarding, but `.gitignore` ignores `.env*`. Committing an example requires a separate approved `.gitignore` change. Code reads `DATABASE_URL` and `NEXTAUTH_SECRET`. Do not print their values.
- **Logging library:** Not required. Production-safe errors and clinical-log redaction are required in `backend-security`.
- **README / docs:** Updating README for every feature is not required.
- **Dependency audits:** `pnpm audit` and similar are optional. Installing or changing dependencies always needs approval per `core-workflow`.
- **Open product decisions:** Currency, calendar, timezone, tenant, and payment policy are listed in [domain-model.md](domain-model.md). Persian-first RTL remains mandatory via `persian-rtl.mdc`. Do not install a webfont, calendar, or i18n library without approval.
