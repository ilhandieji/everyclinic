---
name: secure-uploads
description: Implements or reviews product image upload, replacement, and deletion with server authorization, content validation, safe storage keys, and consistent DB references. Use when adding file upload APIs, storage, or admin image fields.
---

# Secure uploads

Follow upload constraints in `.cursor/rules/backend-security.mdc`.

## Workflow

1. **Authorize** — Every upload, replace, and delete endpoint checks authorization on the server.
2. **Limits** — Define max size and allowed types; reject early with clear client-safe errors.
3. **Validate content** — Inspect file bytes/magic where practical; do not trust filename or client `Content-Type` alone.
4. **Storage keys** — Generate non-guessable, safe object keys or paths; avoid serving private files from public URLs by mistake.
5. **Database consistency** — Update product (or entity) records in the same flow as storage writes; use transactions when both must succeed or fail together.
6. **Replace and delete** — On replace, remove or orphan old objects intentionally; on delete, ensure no other row still references the file.
7. **Security review** — Before treating the upload flow complete, delegate to read-only `security-auditor` and address Critical/High findings.
8. **Dependencies** — Do not add S3/Blob SDKs or image libraries without user approval.

## Completion criteria

- [ ] Unauthorized upload/delete rejected server-side
- [ ] Replace/delete does not leave orphan files or dangling DB references
- [ ] No new storage provider installed without approval
- [ ] `review-changes` applied
