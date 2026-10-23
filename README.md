Persian-first doctor–patient platform (physician sites, services, appointments, clinical records, and payments). Domain boundaries and open decisions: [docs/ai/domain-model.md](docs/ai/domain-model.md).

Authentication is implemented in source. Appointments, clinical records, and payments are not built yet. Do not treat this README as a feature list.

## Getting Started

There are two local modes. Do not run both app servers at once: they share port `3000`, and Docker `prisma generate` writes into the same repo tree as native TypeScript.

### Native

Set `DATABASE_URL` in `.env` to your local Postgres (or Compose **Postgres only** on `localhost:5433` if you run `docker compose up db` without the app).

After cloning, changing `prisma/schema.prisma`, or pulling new migrations, apply them once (same database as `DATABASE_URL`):

```bash
pnpm exec prisma generate --config prisma7.config.ts
pnpm db:migrate
```

Then start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

If a previous Docker run left `nobody`-owned files under `.next` and `pnpm dev` fails with a lockfile permission error:

```bash
rm -rf .next
```

If `rm` is denied, take ownership first (`chown -R "$USER:$USER" .next`) then remove the directory.

### Local Docker

`compose.yml` runs Postgres and the Next dev server as the host UID/GID. The repo is bind-mounted; `.next`, `node_modules`, and `storage` are named volumes so the container does not leave root/`nobody` files on the host. Rebuild the image after `package.json` or `pnpm-lock.yaml` changes.

Create a `.env` with `NEXTAUTH_SECRET` before the first start. Compose overrides `DATABASE_URL` to the Postgres service. The database password in `compose.yml` is a local default, not a production secret.

```bash
docker compose up --build
```

If the first non-root `pnpm install` inside Compose fails because the old `node_modules` volume was created as root, recreate **that volume only** after you explicitly choose to delete it. Do not delete `pgdata` or `uploads`.

Registration creates a patient. A physician row is not created by the app. After the account exists, connect to the database and insert one profile. `singleton` must stay `1`.

From the host, Postgres is published on port `5433` (inside Compose the app still uses `db:5432`).

```bash
docker compose exec db psql -U clinic -d clinic
```

```sql
INSERT INTO physician_profiles (id, user_id, singleton, created_at, updated_at)
SELECT 'phy_' || md5(id), id, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users
WHERE email = 'physician@example.com';
```

Replace the email with the registered account. A second physician row is rejected.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
