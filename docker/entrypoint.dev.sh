#!/bin/sh
set -eu
cd /app

if [ ! -d node_modules/next ]; then
  pnpm install --frozen-lockfile
fi

pnpm exec prisma generate
pnpm exec prisma migrate deploy
exec pnpm dev --hostname 0.0.0.0 --port 3000
