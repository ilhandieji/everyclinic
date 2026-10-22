---
name: payments-and-installments
description: Reviews or implements service pricing snapshots, financial obligations, payment attempts, installment schedules, retries, and reconciliation. Use when changing prices, balances, payment state, refunds, or installments. Does not choose a payment gateway.
---

# Payments and installments

Follow `.cursor/rules/medical-domain.mdc` and `.cursor/rules/backend-security.mdc`. Read [docs/ai/domain-model.md](docs/ai/domain-model.md) first.

This is a receivables workflow. It is not cart checkout. Do not introduce `Order` or `Cart` types for it.

## Workflow

1. **Read open decisions** — When money is due, who may create an installment plan, legal terms, currency unit, and which gateway are unresolved until the domain doc says otherwise. Do not invent interest, penalties, contract text, or a provider. Stop and ask before payment code that depends on those choices.
2. **Keep the objects separate** — Service price, the amount owed for a visit or service, a payment attempt, a confirmed payment, and an installment schedule are different records. Appointment status stays off the payment record.
3. **Snapshot the price** — Changing a public service price must not rewrite amounts already stored on an obligation.
4. **Verify on the server** — A client success message or an unverified callback is not proof of payment. Confirm payment on a trusted server boundary. Make provider callbacks idempotent so retries and duplicates do not double-credit.
5. **Partial and failed payments** — Represent outstanding balance, partial payment, failed installments, cancellation, and refund as explicit states. Do not collapse them into one status shared with the appointment. Cancelling an appointment does not automatically refund.
6. **Consistency** — Update obligation and payment rows in a transaction. A successful payment must not create a clinical note.
7. **Dependencies** — Do not add a payment SDK, credentials, or webhook route unless the user has approved the provider.
8. **Review** — Delegate to read-only `scheduling-payments-reviewer` and `security-auditor` before calling payment work complete.

## Completion criteria

- [ ] Unresolved payment policy listed, not invented
- [ ] Obligation, attempt, and installment are separate from appointment status
- [ ] Server-side verification and idempotent handling specified for any provider callback
- [ ] Historical obligation amounts preserved when the public price changes
- [ ] No gateway or legal terms added without approval
- [ ] `review-changes` applied
