---
name: docker-verify
description: Validates the app through the project's local Docker Compose environment. Use when the user asks for Docker verification or before claiming the Docker stack works.
---

# Docker verify

Follow `.cursor/rules/local-environments.mdc`.

## Current repository state

Compose exists:

- [compose.yml](compose.yml)
- [Dockerfile](Dockerfile)
- [docker/entrypoint.dev.sh](docker/entrypoint.dev.sh)

Native `pnpm dev` success does not prove Docker works.

## Workflow

1. Use only the checked-in compose file and documented env examples (no real secrets). Start/stop via Compose; use the `db` health check. Keep Docker volumes separate from host DB data.
2. The `app` service must stay `user: "${UID:-1000}:${GID:-1000}"` with named volumes for `/app/.next`, `/app/node_modules`, and `/app/storage`. `volume-init` chowns those volumes only (never the bind-mounted repo). Do not run `app` as root, and do not bind-mount host `.next` or `node_modules`.
3. Do not run Compose `app` while native `pnpm dev` is bound to port `3000`.
4. **Patient data** — Do not load real patient records into a container, volume, or fixture. Local Docker data is not a safe place for clinical records.
5. **Destructive ops** — Do not `docker volume rm`, reset DB in containers, or wipe data without explicit user authorization. `pgdata` and `uploads` are never incidental cleanup.
6. Compare behavior to native dev when relevant; report discrepancies. After Docker runs, host files under the bind mount (including `src/app/generated/prisma`) must be owned by the host user, not `nobody` or root.

## Completion criteria

- [ ] Documented health/readiness success from this Compose project, **or** explicit statement that verification was not possible
- [ ] No claim that Docker was verified when only native dev was run
- [ ] No root/`nobody` files left on the bind-mounted repo
- [ ] No real patient data introduced
- [ ] No unauthorized volume deletion or cloud deployment
