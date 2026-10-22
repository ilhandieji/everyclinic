# AI agent guide (store)

This document indexes **project** Cursor rules, skills, and read-only subagents. It does not replace them. [AGENTS.md](../../AGENTS.md) at the repo root is Intent-managed (external Prisma/table skills); do not duplicate that block here.

**Skills** = repeatable procedures the main agent runs. **Subagents** = independent read-only reviewers the main agent delegates to; they do not edit the working tree.

## Mandatory vs optional

| Kind | Location | Mandatory for agents |
|------|----------|----------------------|
| Always-on rules | `.cursor/rules/core-workflow.mdc`, `product-and-environments.mdc`, `persian-rtl.mdc` | Yes |
| Scoped rules | `.cursor/rules/stack.mdc`, `backend-security.mdc`, `ui-conventions.mdc` | Yes when matching files are in scope |
| Project skills | `.cursor/skills/*/SKILL.md` | Use when the task matches the skill description |
| Project subagents | `.cursor/agents/*.md` | Delegate for substantial review (read-only; main agent edits) |
| Intent skills | Via `pnpm exec intent list` / `load` per AGENTS.md | Yes for substantial matching work |
| This guide | `docs/ai/agent-guide.md` | Reference only |

## Rules

| File | Purpose | When it applies |
|------|---------|-----------------|
| [core-workflow.mdc](../../.cursor/rules/core-workflow.mdc) | Pre-edit review, subagent delegation, Git/dependency restrictions, Intent | Every task |
| [product-and-environments.mdc](../../.cursor/rules/product-and-environments.mdc) | Admin-defined catalog, no hardcoded products, native vs Docker | Every task |
| [persian-rtl.mdc](../../.cursor/rules/persian-rtl.mdc) | Persian fa-IR, mandatory RTL, typography/currency/i18n constraints | Every task (removable file) |
| [stack.mdc](../../.cursor/rules/stack.mdc) | Verified versions (Next 16, Prisma 7, next-auth v4, Zod 4, etc.) | `**/*.{ts,tsx,css,prisma}` |
| [backend-security.mdc](../../.cursor/rules/backend-security.mdc) | Auth vs authorization, Zod, migrations conflict, uploads | `src/**`, `prisma/**` |
| [ui-conventions.mdc](../../.cursor/rules/ui-conventions.mdc) | shadcn/Radix, a11y, states, restrained design | `src/**/*.tsx`, `src/**/*.css` |

## Skills

| Skill | Use when |
|-------|----------|
| [implement-feature](../../.cursor/skills/implement-feature/SKILL.md) | Adding or changing application features |
| [admin-crud](../../.cursor/skills/admin-crud/SKILL.md) | Admin create/edit/publish/archive/delete/list/reorder for an entity |
| [secure-uploads](../../.cursor/skills/secure-uploads/SKILL.md) | Product (or entity) image upload, replace, delete |
| [review-changes](../../.cursor/skills/review-changes/SKILL.md) | After edits or when asked for review |
| [docker-verify](../../.cursor/skills/docker-verify/SKILL.md) | User asks for Docker verification or before claiming Docker works |

## Subagents (read-only)

All use `model: inherit` and `readonly: true` where supported; prompts forbid edits regardless. Invoke in the **current workspace** only (no cloud agent, no Git worktree). Policy details: [core-workflow.mdc](../../.cursor/rules/core-workflow.mdc).

| Agent | Use when |
|-------|----------|
| [architecture-reviewer](../../.cursor/agents/architecture-reviewer.md) | Significant structure or cross-layer design |
| [security-auditor](../../.cursor/agents/security-auditor.md) | Auth, authorization, validation, exposure, uploads |
| [ui-rtl-reviewer](../../.cursor/agents/ui-rtl-reviewer.md) | Substantial Persian RTL UI (storefront or admin) |
| [implementation-verifier](../../.cursor/agents/implementation-verifier.md) | Before calling significant feature work complete |

## Adding new rules or skills

- **Rules:** Add a focused `.mdc` under `.cursor/rules/`. One concern per file; use `alwaysApply: true` only when the rule must apply before any file is opened. Avoid duplicating text from existing rules.
- **Skills:** Add `.cursor/skills/<kebab-name>/SKILL.md` with `name`, third-person `description` (what + when), steps, and completion criteria. Keep procedures in skills; keep permanent constraints in rules.
- **Subagents:** Add `.cursor/agents/<kebab-name>.md` with `name`, specific `description`, `readonly: true`, and a read-only system prompt. Wire delegation in `core-workflow` or relevant skills only when needed.

## Known repo facts (for agents)

- Branch `main`, no remote configured; do not create branches unless the user asks.
- Auth route exists but may be empty; schema has NextAuth models only; init migration SQL does not match schema.
- Prisma config file: `prisma7.config.ts`.
- [README.md](../../README.md) is create-next-app starter text, not the development contract.

---

## Optional, not mandatory

Remove this section without changing rules if you do not want these recommendations.

- **Tests:** No test script in `package.json`. Do not add a runner without user approval. If a script appears later, run it for relevant changes.
- **`.env.example`:** Useful for onboarding, but `.gitignore` ignores `.env*`. Committing an example requires a separate approved `.gitignore` change.
- **Logging library:** Not required. Production-safe errors are required in `backend-security` rule.
- **README / docs:** Updating README for every feature is not required.
- **Dependency audits:** `pnpm audit` and similar are optional; installing or changing deps always needs approval per `core-workflow`.
- **Open product decisions (do not block Persian UI):** Currency unit (toman vs rial) is undecided — ask or keep configurable per `persian-rtl`. Persian webfont and calendar/i18n libraries need approval before install; Persian-first RTL and copy remain mandatory via `persian-rtl.mdc`.
