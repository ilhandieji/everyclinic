#!/bin/sh
set -eu
cd /app

mkdir -p \
  /tmp/app-home \
  /tmp/app-home/.local/share/pnpm \
  /tmp/.npm \
  /tmp/.cache \
  /app/.next

if [ ! -d node_modules/next ]; then
  pnpm install --frozen-lockfile
fi

pnpm exec prisma generate
pnpm exec prisma migrate deploy
exec pnpm dev --hostname 0.0.0.0 --port 3000
