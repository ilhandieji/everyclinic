# Architecture

This is the directory map for the current physician site. Product decisions stay in [docs/ai/domain-model.md](ai/domain-model.md). Constraints for new code stay in [.cursor/rules/architecture.mdc](../.cursor/rules/architecture.mdc).

## Tree

- `src/app/` routes, layouts, and route handlers.
- `src/components/ui/` shared primitives.
- `src/components/layout/` shell, header, and navigation.
- `src/components/auth/` session UI.
- `src/components/site/` physician-site feature UI.
- `src/components/providers/` app providers.
- `src/lib/actions/` server actions. Shared result type: `src/lib/actions/state.ts`.
- `src/lib/validators/` Zod schemas.
- `src/lib/access.ts` loads the signed-in user, physician, and patient.
- `src/lib/auth.ts` is NextAuth v4. Server only.
- `src/lib/prisma.ts` is the Prisma 7 client. It refuses to create a physician profile.
- `src/lib/physician-site.ts` reads the public physician with `singleton: 1`.
- `src/lib/money.ts` converts stored prices to numbers for the UI.
- `src/lib/storage.ts` stores image bytes under `storage/`.
- `prisma/schema.prisma` and `prisma/migrations/` are the database. Config is `prisma7.config.ts`.
- `tests/` holds the pure-rule checks. `pnpm test` runs them and does not touch the database.

## Request example

`src/app/services/[id]/page.tsx` loads the service on the server and renders `RequestPanel`. The panel posts to `createServiceRequest` in `src/lib/actions/requests.ts`. That action checks the patient session, then in one transaction requires a published service, an open `BookingWindow`, rejects the owning physician, rejects an existing accepted request, and inserts `pending` linked to that window. A second pending row is rejected by the SQL index `service_requests_one_pending`. Unique `booking_window_id` blocks a second reservation of the same window. After `declined` or `cancelled`, the window is released and a new pending request is allowed.

A patient cancels only their own pending request. The cancel control is on the service page and on `/requests`, including when the service is no longer published. An unpublished service is not linked and is not public.

## Price example

`serviceFormSchema` accepts both bounds or neither, up to `1000000000000`, and requires a currency when a price is set. Columns are `BIGINT`. Pages call `displayPrices` before passing amounts into client components.

## What not to add

Do not add a repository layer, a class hierarchy, or a new top-level `features/` tree. Do not add appointments, payments, SMS, email, or web push until that milestone is requested.
