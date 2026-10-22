---
name: admin-crud
description: Builds authorized configuration CRUD for medical services and public physician-site settings, with server authorization, Zod validation, Prisma persistence, table UI when appropriate, and full UI states. Use for create, edit, visibility, archive, delete, reorder, or admin list screens for configuration entities. Do not use for clinical history.
---

# Admin CRUD

Follow `.cursor/rules/backend-security.mdc`, `medical-domain.mdc`, `ui-conventions.mdc`, `persian-rtl.mdc`, and `stack.mdc`.

Use this skill for configuration the physician or platform administrator maintains: service name, description, price, image, visibility, order, navigation items, and supported public sections. Clinical notes, prescriptions, and medication history belong to `clinical-records`, not this skill.

## Workflow

1. **Entity** — Confirm the entity is configuration, not a clinical record and not an inventory product. No hardcoded services and no fictional seed data for production paths. Examples such as a dental procedure are illustrative only.
2. **Authorization first** — Design server-side checks before UI. No admin, physician, or patient role exists on `User` until a future schema adds one. Do not pretend a check exists. Open registration does not grant this access.
3. **Public site limits** — Navigation, section visibility, and service cards are validated settings. Reject arbitrary HTML and scripts. One shared application renders every physician site.
4. **Independent review (when substantial)** — Schema or mutation design: read-only `architecture-reviewer`, `medical-domain-reviewer`, and `security-auditor`. Substantial admin UI: read-only `ui-rtl-reviewer`.
5. **Validation** — Zod 4 schemas for all mutation inputs; validate on the server.
6. **Persistence** — Use [src/lib/prisma.ts](src/lib/prisma.ts). Use transactions when multiple rows or files must stay consistent. A later price change must not rewrite amounts already stored on a financial obligation; see `payments-and-installments` if money is in scope.
7. **List UI** — Use TanStack React Table v9 only for real admin data tables; load the Intent table skill before building tables. Simple lists do not need Table.
8. **UI states** — Loading, empty, error, success, destructive confirm; long text in forms must remain usable. Labels and messages in natural Persian per `persian-rtl`.
9. **RTL** — Forms, tables, dialogs, pagination, and ordering controls use logical layout and Radix/shadcn direction. Verify mobile, tablet, and desktop or report gaps.
10. **Verification** — Confirm unauthorized requests fail on the server. Confirm unpublished or hidden services and sections are not public.

## Completion criteria

- [ ] No client-only access control for mutations
- [ ] No public exposure of unpublished configuration or clinical records
- [ ] No fictional services in seeds or default UI data
- [ ] Clinical history was not implemented through this skill
- [ ] Zod + Prisma used at trust boundaries
- [ ] Admin UI meets `persian-rtl` (copy, `dir`/`lang`, RTL verification or explicit skip)
- [ ] `review-changes` applied
