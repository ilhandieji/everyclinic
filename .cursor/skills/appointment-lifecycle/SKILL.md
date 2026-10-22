---
name: appointment-lifecycle
description: Implements or reviews physician-scheduled appointments, including authorization, status transitions, overlap prevention, cancellation, and appointment reminders. Use when changing scheduling, availability, appointment status, or reminders tied to an appointment.
---

# Appointment lifecycle

Follow `.cursor/rules/medical-domain.mdc` and `.cursor/rules/backend-security.mdc`. Read [docs/ai/domain-model.md](docs/ai/domain-model.md) first.

An appointment is a scheduled healthcare interaction. It is not an order. Appointment status and payment status are separate concepts.

## Workflow

1. **Read open decisions** — List any unresolved policy this change depends on (confirmation, cancellation, no-show, whether a service is required, timezone, calendar). Do not invent a policy. Stop and ask when the slice needs one.
2. **Who may schedule** — The confirmed requirement is that physicians schedule patients. Do not add patient self-booking unless the user explicitly requests it and the domain doc records that decision.
3. **Authorize** — On the server, confirm the caller may act for this physician and this patient. Ignore a browser-supplied id until the resource check passes. The tenant model is unresolved; stop before the first tenant-scoped table if ownership is still open.
4. **Shape the record** — Date, time, duration, optional service, and status. Keep payment fields off this record. Completing or cancelling an appointment must not delete clinical history and must not imply payment or refund.
5. **Conflicts** — Two requests must not create overlapping appointments for the same physician. Use a transaction and a database constraint when implementing persistence. Document the constraint in the change.
6. **Transitions** — Only use status transitions the owner has approved. If the set is still open, implement the smallest explicit set the user just specified and record the rest as unresolved.
7. **Reminders** — An appointment reminder depends on an appointment. A follow-up reminder may exist with no appointment; that workflow is `clinical-records` or a later reminder task, not this one. Creating a reminder row is not delivery. Do not add SMS, email, or push dependencies without approval.
8. **Review** — Delegate to read-only `scheduling-payments-reviewer` and, when authorization or patient data is involved, `security-auditor`.

## Completion criteria

- [ ] Domain doc read; unresolved policies listed, not invented
- [ ] Server-side authorization on create, update, cancel, and read
- [ ] Overlap prevention specified with a transaction and a database constraint, or explicitly deferred
- [ ] Appointment status kept separate from payment status
- [ ] No patient self-booking added unless requested
- [ ] `review-changes` applied
