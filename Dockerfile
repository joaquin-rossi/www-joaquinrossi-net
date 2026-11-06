FROM node:26-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.17.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=80
COPY --from=build /app/.output ./.output
EXPOSE 80
CMD ["node", ".output/server/index.mjs"]
