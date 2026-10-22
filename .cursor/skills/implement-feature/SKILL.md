---
name: implement-feature
description: Implements or changes application behavior with scoped pre-edit review, domain boundaries, a minimal vertical slice, diff review, and lint reporting. Use when adding or modifying routes, physician-site flows, appointments, clinical records, or payments.
---

# Implement feature

Follow `.cursor/rules/` (especially `core-workflow`, `medical-domain`, and `persian-rtl` for any UI). Read [docs/ai/domain-model.md](docs/ai/domain-model.md) before medical-domain work.

## Workflow

1. **Lock scope** — Restate what is in and out of scope. Add payments, reminders, or clinical records only when the user requested that slice. Do not expand into a gateway, notification provider, or schema rewrite.
2. **Name the domain** — For medical work, list entities, the authorization boundary, and any historical records the change could overwrite. If a required policy in the domain doc is still open, stop and ask.
3. **Pre-edit review** — Re-read `package.json`, lockfile importer, `git status`, and every file you will touch plus callers/imports.
4. **Inspect before replace** — Read the full existing implementation on each layer (UI, server actions/routes, Prisma) before editing.
5. **Architecture (when substantial)** — Before a large cross-layer change, delegate to read-only `architecture-reviewer`. For domain semantics, also delegate to `medical-domain-reviewer`. Incorporate findings.
6. **Specialized work** — Services or public site settings: `admin-crud`. Uploads: `secure-uploads`. Appointments: `appointment-lifecycle`. Notes, prescriptions, or medication history: `clinical-records`. Prices, obligations, or installments: `payments-and-installments`.
7. **Implement** — Smallest vertical slice that meets the request. Match stack versions in `stack`.
8. **UI (when applicable)** — Design RTL first per `persian-rtl`; use natural Persian copy. For substantial UI, delegate to read-only `ui-rtl-reviewer`. Verify layout at mobile, tablet, and desktop, or state what was not verified.
9. **Security (when applicable)** — For auth, mutations, clinical data, or uploads, delegate to read-only `security-auditor` when substantial.
10. **Review** — Apply `review-changes`. For significant work, delegate to read-only `implementation-verifier` before finishing; then run checks the verifier could not.

## Completion criteria

- [ ] Scope unchanged from user request
- [ ] Domain entities and open decisions identified when the change is medical
- [ ] Diff reviewed for imports, auth, and regressions
- [ ] `pnpm lint` run when code changed; result reported
- [ ] Browser or Docker verification performed or explicitly listed as not done
- [ ] RTL three-viewport verification performed or explicitly listed as not done when UI changed
- [ ] No unauthorized dependency or Git operations
