# Domain model (proposal)

This document is the agent-facing source for the doctor–patient platform. It is a proposal. It does not authorize schema, migration, or application changes.

The product is a Persian-first platform for physician sites, medical services, appointments, patient history, prescriptions, reminders, visit payments, and installment schedules. Ecommerce catalog behavior is obsolete.

Open decisions at the end are unresolved. Do not implement a guessed answer. Stop and ask before adding the first tenant-scoped table.

## What exists today

Static review only. Login, registration, migrations, and the browser were not executed for this document. There is no test script.

Implemented in source, unverified at runtime:

- NextAuth v4 credentials in `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`.
- JWT sessions plus a Prisma `Session` row, expiry checks, and deletion on sign-out or invalid session.
- Registration in `src/app/api/register/route.ts` with Zod and a scrypt password hash.
- Login and register pages redirect an authenticated session home. `safeCallbackUrl` allows only relative paths.
- Prisma 7 client in `src/lib/prisma.ts`. Schema models: `User`, `Account`, `Session`, `VerificationToken`.

Gaps:

- `User` has no role, physician, patient, or practice relation. A login proves email and password only.
- Open registration creates that role-less user. It is not physician onboarding and grants no clinical access.
- `Account` and `VerificationToken` are unused. `emailVerified` is never set.
- Session claims are `id` and `email`. There is no route middleware.
- `prisma/migrations/20261022132459_init/migration.sql` was rewritten in place from legacy `User`/`Post` to the current NextAuth tables. `20261022180000_nextauth_credentials` still drops `Post` and `User` and creates the same tables again. Fresh migrate is inconsistent. Repair is a future task. Do not rewrite those files unless the user asks.

UI copy in `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/layout/site-navbar.tsx`, and the register subtitle in `src/components/ui/auth-card.tsx` still says «فروشگاه». Leave it until a dedicated UI task.

The npm package name remains `store`. Renaming it is an open decision.

No Docker Compose files exist. No payment, appointment, or clinical code exists.

## Boundaries

### Identity

`User` stays the login account. Physician, patient, and platform administrator are future authorization facts. Staff is optional and is not part of the first role set.

Do not store clinical fields on `User`. Do not replace NextAuth.

### Public site

Physician or practice profile, service definitions, navigation, section visibility and order, and contact details. Settings are structured and validated. Reject arbitrary HTML, scripts, and a separate codebase per physician.

A medical service has a name, description, price, image, visibility, and order. It is not stock and has no manufacturer. Illustrative procedures must not become seed data. Public content never includes patient records.

### Care

A care relationship is the authorization edge between a physician or practice and a patient. An appointment belongs to that relationship.

Confirmed requirement: physicians schedule patients. Patient self-booking is not a current requirement.

An appointment has date, time, duration, an optional link to a service, and its own status. Payment status is a different fact.

### Clinical record

Encounter notes, prescriptions, and medication history are clinician-authored or explicitly reported. Amendments and discontinuations stay in history. Changing the current medication list must not delete prior rows.

Agents must not invent diagnoses, allergies, doses, or advice.

A follow-up reminder may exist when no appointment is booked. Medication reminders are out of scope until the user adds them.

### Reminders and delivery

Appointment reminders depend on an appointment. Follow-up reminders do not. A reminder row is not proof of delivery. Delivery is a separate attempt with status, retry, and idempotency.

Do not add SMS, email, push, or scheduling dependencies without approval.

### Finance

Keep these separate:

- the public service price
- the amount owed for a visit or service
- a payment attempt
- a confirmed payment
- an installment schedule

A client success message is not proof of payment. Do not choose a gateway, interest, penalty, or contract text without an owner decision and explicit approval.

## Consistency

- Cancelling an appointment must not delete clinical history and must not imply a refund.
- Completing an appointment must not imply that payment was received.
- A successful payment must not create a clinical note.
- Discontinuing a medication must not erase the prescription that authorized it.
- A public service price change must not rewrite amounts already recorded on an obligation.
- When appointments are built, overlapping times for the same physician must be rejected with a transaction and a database constraint.

## Future milestones

Do these in order. Each one is a separate approved task.

1. Owner decisions below that block the next milestone.
2. Repair migration history before new models.
3. Authorization profiles on the existing NextAuth implementation.
4. Care relationship, physician-created appointments, and overlap prevention.
5. Public profile, services, and limited section or navigation settings. This does not require clinical records.
6. Encounters, prescriptions, and medication history, after care relationships exist.
7. Reminder records, after appointment and follow-up concepts exist. Delivery waits on a channel decision.
8. Obligations and installments, after a written payment policy. Provider integration is its own approved milestone.
9. Optional later work: notification provider, payment gateway, staff accounts, patient self-booking, clinical file uploads, Persian font, calendar library, Docker Compose, automated tests.

## Open decisions

| Decision | Needed before |
|----------|----------------|
| Tenant is one physician, one clinic, or a group practice | The first private or public owned table |
| Whether one login may be both a physician and a patient | Profile schema |
| Physician accounts are open registration, invitation, or platform-admin created | Any physician onboarding |
| Whether a patient record can exist before a login | Patient profile |
| Confirmation, cancellation, no-show, and whether a service is required on an appointment | Appointment status transitions |
| Timezone, display calendar, and toman versus rial | Appointment or money UI. No calendar or i18n library without approval. `Asia/Tehran` is not an implemented default |
| Who sets follow-up intervals, and whether templates exist | Follow-up configuration. Medication reminders stay out of scope |
| Notification channel and provider | Any delivery implementation |
| When money is due, who may create an installment plan, which terms are allowed, and which gateway | Payment code |
| How long clinical records are kept, and which reads are audited | Audit implementation. Until confirmed: attribute clinical writes with author and time; record access to clinical detail without copying note bodies into logs; do not audit ordinary public page views |
| Staff accounts or patient document uploads in the first clinical release | Those features. Until decided, build neither |
| Iranian healthcare, privacy, and payment compliance | Any compliance claim. Do not claim it. Needs professional review |
| Whether to rename the npm package and repository from `store` | A naming task. Not required for domain work |
