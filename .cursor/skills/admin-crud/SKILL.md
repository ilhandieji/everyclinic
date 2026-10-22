---
name: admin-crud
description: Builds administrator CRUD flows for generic entities with server authorization, Zod validation, Prisma persistence, table UI when appropriate, and full UI states. Use for create, edit, publish, archive, delete, reorder, or admin list screens.
---

# Admin CRUD

Follow `.cursor/rules/backend-security.mdc`, `ui-conventions.mdc`, `persian-rtl.mdc`, and `stack.mdc`.

## Workflow

1. **Entity model** — Confirm the entity is administrator-defined; no hardcoded catalog rows or fictional seed data for production paths.
2. **Authorization first** — Design server-side checks before UI. Remember: no admin role exists on `User` until the schema adds one; implement explicit checks the task requires.
3. **Independent review (when substantial)** — Schema or mutation design: read-only `architecture-reviewer` and `security-auditor`. Substantial admin UI: read-only `ui-rtl-reviewer`.
4. **Validation** — Zod 4 schemas for all mutation inputs; validate on the server.
5. **Persistence** — Use [src/lib/prisma.ts](src/lib/prisma.ts). Use transactions when multiple rows or files must stay consistent.
6. **List UI** — Use TanStack React Table v9 only for real admin data tables; load Intent table skill before building tables. Simple lists do not need Table.
7. **UI states** — Loading, empty, error, success, destructive confirm; long text in forms must remain usable. Labels and messages in natural Persian per `persian-rtl`.
8. **RTL admin surfaces** — Forms, tables, dialogs, pagination, and product ordering: logical layout, Radix/shadcn direction, mixed Persian/Latin content; verify mobile, tablet, desktop or report gaps.
9. **Verification** — Confirm unauthorized requests fail on the server (not only hidden buttons). Confirm unpublished records are not public.

## Completion criteria

- [ ] No client-only access control for mutations
- [ ] No public exposure of unpublished or admin-only records
- [ ] No fictional products in seeds or default UI data
- [ ] Zod + Prisma used at trust boundaries
- [ ] Admin UI meets `persian-rtl` (copy, `dir`/`lang`, RTL verification or explicit skip)
- [ ] `review-changes` applied
