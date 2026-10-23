FROM node:24-bookworm-slim

# Shared Corepack store so Compose `user:` (host UID) can run pnpm without writing /root.
ENV COREPACK_HOME=/usr/local/share/corepack

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p "$COREPACK_HOME" \
  && corepack enable \
  && corepack prepare pnpm@12.11.2 --activate \
  && pnpm --version \
  && chmod -R a+rX "$COREPACK_HOME" /usr/local/bin

WORKDIR /app

# Run as the Compose `user:` (host UID/GID). Do not bake USER into the image.
COPY docker/entrypoint.dev.sh /entrypoint.dev.sh
RUN chmod +x /entrypoint.dev.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.dev.sh"]
