---
name: implement-feature
description: Implements or changes a product feature with scoped pre-edit review, minimal vertical slice, diff review, and lint reporting. Use when adding or modifying application behavior, routes, admin flows, or storefront features.
---

# Implement feature

Follow project rules in `.cursor/rules/` (especially `core-workflow`, `product-and-environments`, and `persian-rtl` for any UI).

## Workflow

1. **Lock scope** — Restate what is in and out of scope. Do not expand into cart, checkout, payments, or orders unless requested.
2. **Pre-edit review** — Re-read `package.json`, lockfile importer, `git status`, and every file you will touch plus callers/imports.
3. **Inspect before replace** — Read the full existing implementation on each layer (UI, server actions/routes, Prisma) before editing.
4. **Architecture (when substantial)** — Before a large cross-layer change, delegate to read-only `architecture-reviewer` and incorporate findings.
5. **Implement** — Smallest vertical slice that meets the request. Match stack versions in `stack` rule.
6. **UI (when applicable)** — Design RTL first per `persian-rtl`; use natural Persian copy. For substantial UI, delegate to read-only `ui-rtl-reviewer`. Verify layout at mobile, tablet, and desktop, or state what was not verified.
7. **Security (when applicable)** — For auth, mutations, or data exposure, delegate to read-only `security-auditor` when substantial.
8. **Specialized work** — If the feature is admin CRUD for an entity, follow `admin-crud`. If it involves uploads, follow `secure-uploads`.
9. **Review** — Apply `review-changes`. For significant work, delegate to read-only `implementation-verifier` before finishing; then run checks the verifier could not.

## Completion criteria

- [ ] Scope unchanged from user request
- [ ] Diff reviewed for imports, auth, and regressions
- [ ] `pnpm lint` run when code changed; result reported
- [ ] Browser or Docker verification performed or explicitly listed as not done
- [ ] RTL three-viewport verification performed or explicitly listed as not done when UI changed
- [ ] No unauthorized dependency or Git operations
