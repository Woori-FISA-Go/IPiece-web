# 1단계: 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm 사용
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# 2단계: 실행
FROM node:20-alpine
WORKDIR /app

RUN corepack enable
ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000
CMD ["pnpm", "start"]
