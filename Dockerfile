# Production image: docker build -t resume-builder . && docker run -p 3000:3000 --env-file .env resume-builder
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000
# LibreOffice is optional; it gives exact page counts for Word exports. Uncomment to include it (~500 MB).
# RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /app ./
RUN npm prune --omit=dev && chown -R node:node /app
USER node
EXPOSE 3000
# Starts the server; it applies migrations and loads reference data on start-up (src/instrumentation.ts).
CMD ["npm", "run", "start:prod"]
