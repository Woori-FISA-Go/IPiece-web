# 1단계: 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm 버전 명시적으로 준비
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# [수정됨] GitHub Actions에서 --build-arg로 넘겨준 값을 받기 위한 설정
# 이 부분이 없으면 pnpm build 할 때 환경변수가 들어가지 않습니다.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN pnpm build

# 2단계: 실행
FROM node:20-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000
CMD ["pnpm", "start"]