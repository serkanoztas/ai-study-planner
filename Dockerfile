# 1. Aşama: Bağımlılıkların Kurulması
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# 2. Aşama: Kodun Derlenmesi
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 3. Aşama: Üretim İmajı (Çalıştırma Ortamı)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# PRISMA ŞEMASINI EKLİYORUZ:
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]