# Stage 1: Build static distribution
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

# Compile tokens and static hub
RUN node packages/tokens/build.js
RUN cd apps/storybook-hub && node build.js
# The docs are downloaded before the build (scripts/fetch-cli-docs.sh); never ship a portal without them
RUN test -s apps/storybook-hub/dist/cli-state-handler/version.json || { echo 'cli-state-handler docs missing: run scripts/fetch-cli-docs.sh before docker build' >&2; exit 1; }

# Stage 2: Serve with NGINX
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/apps/storybook-hub/dist /usr/share/nginx/html
COPY --from=builder /app/packages/tokens/dist/theme.css /usr/share/nginx/html/theme.css

# Ensure sub-paths exist for consolidated library doc portals
RUN mkdir -p /usr/share/nginx/html/server-decorator /usr/share/nginx/html/cli-state-handler

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
