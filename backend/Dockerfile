FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/vitest.config.ts ./
COPY --from=builder /app/tests ./tests

EXPOSE 3001
CMD ["node", "dist/server.js"]
