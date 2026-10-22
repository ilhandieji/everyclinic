---
name: docker-verify
description: Validates the app through the project's local Docker Compose environment when compose files exist; otherwise reports that Docker verification cannot run. Use when the user asks for Docker verification or before claiming the Docker stack works.
---

# Docker verify

Follow `.cursor/rules/local-environments.mdc`.

## Current repository state

**No `Dockerfile`, `docker-compose.yml`, or Compose project exists yet.** Native `pnpm dev` success does not prove Docker works.

## Workflow

1. Search the repo for `Dockerfile*`, `compose*.yml`, `docker-compose*.yml`, and documented Docker instructions.
2. **If none exist** — Stop. Report that Docker verification **cannot be performed** without an approved Compose setup. Do not invent containers, cloud deploys, or ad hoc `docker run` unless the user explicitly asks to create that infrastructure.
3. **If Compose exists** — Use only the checked-in compose file and documented env examples (no real secrets). Start/stop via Compose; use defined health checks when present. Keep Docker volumes separate from host DB data.
4. **Patient data** — Do not load real patient records into a container, volume, or fixture. Local Docker data is not a safe place for clinical records.
5. **Destructive ops** — Do not `docker volume rm`, reset DB in containers, or wipe data without explicit user authorization.
6. Compare behavior to native dev when relevant; report discrepancies.

## Completion criteria

- [ ] Either documented health/readiness success from the existing Compose project, **or** explicit statement that verification was not possible
- [ ] No claim that Docker was verified when only native dev was run
- [ ] No real patient data introduced
- [ ] No unauthorized volume deletion or cloud deployment
