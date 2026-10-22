---
name: clinical-records
description: Implements or reviews patient history, physician-authored encounter notes, prescriptions, and medication history with provenance and non-destructive updates. Use when changing clinical notes, prescriptions, medication lists, or follow-up reminders that are not appointment reminders.
---

# Clinical records

Follow `.cursor/rules/medical-domain.mdc` and `.cursor/rules/backend-security.mdc`. Read [docs/ai/domain-model.md](docs/ai/domain-model.md) first.

Clinical records are not configuration CRUD. Do not use `admin-crud` for notes, prescriptions, or medication history.

## Workflow

1. **Separate the records** — An encounter note, a prescription, a medication the patient is reported to be taking, and a historical medication are different facts. A follow-up reminder may exist with no appointment booked. An appointment reminder belongs to `appointment-lifecycle`.
2. **Authorize** — Every read and write checks the care relationship on the server. A physician must not see every patient. Do not trust a browser-supplied patient or physician id.
3. **Author and time** — Store who wrote or changed the record and when. Amendments and discontinuations append history. Editing the current medication list must not delete prior rows. Discontinuing a medication must not erase the prescription.
4. **No autonomous clinical content** — Do not invent diagnoses, allergies, doses, or advice. Persist only what an authorized clinician or an explicit reported-history field supplies.
5. **Sensitive data** — Do not log note bodies, full prescriptions, or real patient identifiers. Do not seed real or realistic patient records. Fixtures stay obviously synthetic.
6. **Audit** — Until the owner confirms retention, attribute clinical writes with author and time, and avoid copying note bodies into access logs. Do not audit ordinary public page views.
7. **Uploads** — Patient document uploads are not in scope unless the task asks. If it does, follow `secure-uploads` and keep files private.
8. **Review** — Delegate to read-only `medical-domain-reviewer` and `security-auditor` before calling significant clinical work complete.

## Completion criteria

- [ ] History is append-only for clinically significant changes
- [ ] Server-side care-relationship checks on every query and mutation
- [ ] No invented clinical content
- [ ] No real patient data in fixtures, logs, or prompts
- [ ] Follow-up reminders are not modeled as appointment reminders
- [ ] `review-changes` applied
