# nginx.Dockerfile (from project root context)
# File: nginx/nginx.Dockerfile

# Stage 1 - Build frontend
FROM node:18 AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

# Stage 2 - Serve using NGINX
FROM nginx:stable AS serve

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html

ENTRYPOINT ["/entrypoint.sh"]
