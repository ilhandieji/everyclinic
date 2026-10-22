FROM node:24-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@12.11.2 --activate

WORKDIR /app

COPY docker/entrypoint.dev.sh /entrypoint.dev.sh
RUN chmod +x /entrypoint.dev.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.dev.sh"]
