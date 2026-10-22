---
name: secure-uploads
description: Implements or reviews authorized file upload, replacement, and deletion for public service media or, when explicitly requested, private clinical attachments. Covers server authorization, content validation, safe storage keys, and consistent DB references. Use when adding file upload APIs, storage, or image fields.
---

# Secure uploads

Follow upload constraints in `.cursor/rules/backend-security.mdc` and `.cursor/rules/medical-domain.mdc`.

## Workflow

1. **Classify the file** — Public service media and private clinical attachments are different access domains. Clinical attachments are not a current requirement. Do not add them unless the task explicitly asks.
2. **Authorize** — Every upload, replace, and delete endpoint checks authorization on the server. Public files must still be limited to the physician or practice that owns the service.
3. **Limits** — Define max size and allowed types; reject early with clear client-safe errors.
4. **Validate content** — Inspect file bytes/magic where practical; do not trust filename or client `Content-Type` alone.
5. **Storage keys** — Generate non-guessable, safe object keys or paths. Do not serve private clinical files from public URLs.
6. **Database consistency** — Update the owning service or record in the same flow as the storage write; use transactions when both must succeed or fail together.
7. **Replace and delete** — On replace, remove or orphan old objects intentionally; on delete, ensure no other row still references the file.
8. **Security review** — Before treating the upload flow complete, delegate to read-only `security-auditor` and address Critical/High findings.
9. **Dependencies** — Do not add S3/Blob SDKs or image libraries without user approval.

## Completion criteria

- [ ] Unauthorized upload/delete rejected server-side
- [ ] Public and private files are not stored or served the same way
- [ ] Replace/delete does not leave orphan files or dangling DB references
- [ ] No new storage provider installed without approval
- [ ] `review-changes` applied
