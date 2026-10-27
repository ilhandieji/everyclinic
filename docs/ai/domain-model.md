# Domain model (proposal)

This document is the agent-facing source for the doctor–patient platform. It is a proposal. It does not authorize schema, migration, or application changes.

The product is a Persian-first platform for physician sites, medical services, appointments, patient history, prescriptions, reminders, visit payments, and installment schedules. Ecommerce catalog behavior is obsolete.

Open decisions at the end are unresolved unless a row is marked decided. Do not implement a guessed answer for the remaining rows.

## What exists today

Implemented in source. `pnpm test` covers price bounds, request eligibility, callback URLs, and image keys. It does not boot the app or the database.

- NextAuth v4 credentials in `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`.
- JWT sessions plus a Prisma `Session` row, expiry checks, and deletion on sign-out or invalid session.
- Registration in `src/app/api/register/route.ts` creates a `User` and a `PatientProfile`. It requires `User.name` (Persian full name) for new accounts. Existing `User.name` values may stay null. It does not create a physician.
- `PhysicianProfile` is inserted outside the app client. `src/lib/prisma.ts` blocks `create`, `createMany`, and `upsert` on that model. SQL check `physician_profiles_singleton_is_one` requires `singleton = 1`.
- `MedicalService`, `ServiceSection`, `ServiceRequest`, and `CareRelationship` are in the schema. Published services and the public profile are rendered from the singleton physician.
- A patient may request a published service. SQL index `service_requests_one_pending` allows one `pending` row per patient and service. The server action also rejects a request for the physician’s own service and a second request after `accepted`. A new request after `declined` or `cancelled` stays allowed.
- Accepting a request upserts `CareRelationship`. That is not an appointment.
- Service prices are `BIGINT`, capped at `1000000000000` by Zod and by SQL check `medical_services_price_bounds`.
- Login and register pages redirect an authenticated session home. `safeCallbackUrl` allows only a single-slash relative path.

Still true:

- `User` has no role column. A login proves email and password only. Physician access is the presence of `PhysicianProfile`.
- `Account` and `VerificationToken` are unused. `emailVerified` is never set.
- Session claims are `id` and `email`. There is no route middleware.
- Do not rewrite applied migrations. `prisma/migrations/20261022180000_nextauth_credentials/migration.sql` is `SELECT 1`. Do not drop `service_requests_one_pending` or `medical_services_price_bounds` to silence a Prisma diff.
- Appointments as a separate entity, encounters, and payments are not built. A service request may reserve a physician time window; it is still not a completed visit.
- In-app `Notification` rows, follow-up `FollowUpReminder` rows, immutable `Prescription` rows, and append-only `MedicationStatusEvent` rows are in the schema. Browser Notification API is opt-in while a tab is open. There is no service worker, web push, SMS, or email delivery.
- `deliverDueReminders()` can write one due in-app notification per reminder. Nothing in Compose or the app process runs it on a clock. A reminder row is not proof of delivery.
- Reminder civil times are stored as UTC from `Asia/Tehran` offset `+03:30` (no DST since 2022). That is not a general clinic timezone setting.

The npm package name remains `store`. Renaming it is an open decision.

Local Docker Compose is `compose.yml` (Postgres and the Next dev server, source mounted from the repo). Directory roles are in [docs/architecture.md](../architecture.md).

## Boundaries

### Identity

`User` stays the login account. `PatientProfile` and `PhysicianProfile` already exist. A role column and a platform administrator do not. Staff is optional and is not part of the first role set.

Do not store clinical fields on `User`. Do not replace NextAuth.

### Public site

Physician or practice profile, service definitions, navigation, section visibility and order, and contact details. Settings are structured and validated. Reject arbitrary HTML, scripts, and a separate codebase per physician.

A medical service has a name, description, price, image, visibility, and order. It is not stock and has no manufacturer. Illustrative procedures must not become seed data. Public content never includes patient records.

### Care

A care relationship is the authorization edge between a physician or practice and a patient. An appointment belongs to that relationship.

Decided for this release: the singleton physician publishes clinic-wide availability (`BookingDay` + `BookingWindow`). A patient self-books a **whole window** when creating a `ServiceRequest`. The physician later sets `exactVisitAt` on an accepted request. Minute-level slots inside a window, per-service calendars, and a separate `Appointment` table are not this slice.

A full appointment record (duration, no-show, independent status machine) remains later work. Payment status stays a different fact.

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

Public profile, services, service requests, and the care relationship created by accepting a request are already implemented. Do not rebuild them.

1. Owner decisions below that block the next milestone.
2. New models go in a new migration. Do not rewrite applied SQL, and do not drop the pending-request index or the price check.
3. Authorization profiles on the existing NextAuth implementation. Physician and patient profiles already exist. `User` still has no role column.
4. Physician-created appointments and overlap prevention beyond window uniqueness. Window booking on `ServiceRequest` exists; a dedicated appointment entity does not.
5. Further public-site settings beyond the current profile, service cards, and service sections. Navigation settings are not a separate model yet.
6. Encounters, prescriptions, and medication history, after care relationships exist.
7. Reminder records, after appointment and follow-up concepts exist. Delivery waits on a channel decision.
8. Obligations and installments, after a written payment policy. Provider integration is its own approved milestone.
9. Optional later work: notification provider, payment gateway, staff accounts, per-service calendars, clinical file uploads, Persian font, calendar library, and end-to-end tests.

## Open decisions

| Decision | Needed before |
|----------|----------------|
| Tenant is one physician site for this release (`PhysicianProfile.singleton`). Clinic or group practice is not built | Decided |
| One login may hold both `PatientProfile` and `PhysicianProfile`. Neither row removes the other | Decided |
| A physician row is created only by a direct database insert. The app rejects `PhysicianProfile` create, createMany, and upsert. Public registration creates a patient | Decided |
| A patient profile before a login is not built. `PatientProfile.userId` is required | Decided for this release |
| Patient self-booking is a whole clinic window on a service request; physician sets exact visit time after accept | Decided for this release |
| Confirmation, cancellation, no-show, and whether a service is required on an appointment | Appointment status transitions |
| Timezone, display calendar, and toman versus rial | Appointment or money UI. Reminder due times use `Asia/Tehran` (`+03:30`) only. No calendar or i18n library without approval |
| Who sets follow-up intervals, and whether templates exist | Follow-up configuration. Medication reminders stay out of scope |
| Notification channel and provider | SMS, email, or web push. In-app rows plus optional on-tab browser notices are implemented |
| When money is due, who may create an installment plan, which terms are allowed, and which gateway | Payment code |
| How long clinical records are kept, and which reads are audited | Audit implementation. Until confirmed: attribute clinical writes with author and time; record access to clinical detail without copying note bodies into logs; do not audit ordinary public page views |
| Staff accounts or patient document uploads in the first clinical release | Those features. Until decided, build neither |
| Iranian healthcare, privacy, and payment compliance | Any compliance claim. Do not claim it. Needs professional review |
| Whether to rename the npm package and repository from `store` | A naming task. Not required for domain work |
