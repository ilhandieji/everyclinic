# Refactoring progress

Approved plan: codebase audit (price bounds, request rules, singleton physician, small structure, architecture docs).

## Completed

- Baseline: application ESLint was clean. Full `pnpm lint` had 188 pre-existing warnings in Impeccable skill scripts and 0 errors. The first `pnpm build` failed on an invalid `dir` prop on Radix `Theme`, before prerender. Database read: 1 physician, 0 rows with `singleton <> 1`, max prices 9000000 and 14000000, pending index and price check present.
- Request action rejects an accepted follow-up and a self-request. `/requests` can cancel a pending request and does not link an unpublished service. Callback URLs reject backslashes and encoded protocol-relative paths. Service saves return a Persian error instead of an unhandled Prisma failure. Seed refuses to edit another account’s physician profile. Service card says «درخواست رزرو».
- Migration `20261024021500_price_bigint_singleton_check` applied on the local database. Column type is `bigint`. A second physician insert failed with check violation `23514`. A rolled-back update stored `3000000000`. The pending index and price check remained.
- `ActionState` lives in `src/lib/actions/state.ts`. Public physician reads use `findPublicPhysician`. Service image upload and delete are sibling components.
- Dynamic service pages await `params` inside `Suspense`, which `cacheComponents` requires. That failure was hidden until the typecheck passed.
- Architecture rule and `docs/architecture.md` added. Stale domain, security, stack, UI, and agent-guide statements corrected.
- Removed the invalid `dir` prop. The document already sets `dir="rtl"`.
- Login form submits with `method="post"`. The submit control is `type="button"` so a native GET cannot put the password in the query string.

## Checks

- `pnpm test`: pass, 12 tests.
- `pnpm exec eslint src prisma --max-warnings 0`: pass.
- `pnpm build`: pass after the Suspense and type fixes.
- Full `pnpm lint`: still exits 0 with the pre-existing Impeccable warnings. Those scripts were not edited.
- Browser, on `http://127.0.0.1:3000` with `allowedDevOrigins` including that host:
  - The physician unpublished «ویزیت روانپزشکی». It left the public home list. The patient’s `/requests` showed the title as text, not a link, and «لغو درخواست» set the row to لغو شده.
  - The physician published the service again. The patient submitted a new request. The physician accepted it from `/manage/requests`. The service page then showed پذیرفته‌شده and did not offer another request.
- `pnpm db:seed` was not run. Changes are not committed.

## Cleanup

The synthetic account `audit.check.20261024@example.test`, its two service requests, and its care relationship were deleted. The physician password hash was restored and the temporary restore file was removed. The service remains published. The test password had already been written into the dev-server log by an earlier GET submit; deleting the account makes that password useless.

## Assumptions

- A new request after `declined` or `cancelled` stays allowed. The browser confirmed a new request after لغو شده, and no new request after پذیرفته‌شده.
- Prices widened to `BIGINT` to match the existing check and Zod cap.

## Left unchanged

Unused dependencies `axios`, `class-validator`, `classnames`, `@hookform/resolvers`, and `@prisma/extension-accelerate` were not removed. Decline was not clicked; accept was.
