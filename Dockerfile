# Stage 1: Build static distribution
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

# Compile tokens and static hub
RUN node packages/tokens/build.js
RUN cd apps/storybook-hub && node build.js

# Stage 2: Serve with NGINX
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/storybook-hub/dist /usr/share/nginx/html
COPY --from=builder /app/packages/tokens/dist/theme.css /usr/share/nginx/html/theme.css
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
