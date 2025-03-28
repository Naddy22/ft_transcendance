# nginx.Dockerfile (from project root context)
# File: nginx/nginx.Dockerfile

# # Stage 1 - Build frontend
# FROM node:18 AS builder
# WORKDIR /app

# COPY frontend/package*.json ./
# RUN npm ci

# COPY frontend .
# RUN npm run build

# # Stage 2 - Serve using NGINX
# FROM nginx:stable AS serve

# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
# COPY nginx/entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# COPY --from=builder /app/dist /usr/share/nginx/html

# ENTRYPOINT ["/entrypoint.sh"]

# #
# Stage 1 - Build frontend
FROM node:18 AS builder
WORKDIR /app

COPY PongGame/package*.json ./
RUN npm ci

COPY PongGame .
RUN npm run build

# Stage 2 - Serve using NGINX
FROM nginx:stable AS serve

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html

ENTRYPOINT ["/entrypoint.sh"]
# #

# FROM nginx:stable-alpine
# # FROM nginx:1.24.0-alpine
# # WORKDIR /etc/nginx

# # Install dumb-init
# RUN apk add --no-cache dumb-init

# # Copy custom nginx.conf into the container
# # COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
# COPY ./nginx.conf /etc/nginx/nginx.conf

# # Copy the built frontend files from the "frontend" service (multi-stage copy)
# # Note: This requires the frontend image to be built first and referenced by its service name.
# COPY --from=ft_transcendence-frontend /app/dist /usr/share/nginx/html

# # # Copy SSL certificates from the backend container (assuming they are in ./backend/certs)
# # COPY ./backend/certs /etc/nginx/certs:ro

# # Change ownership of copied files and required directories for nginx
# RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx

# # Switch to non-root user
# USER nginx

# # Expose HTTP and HTTPS ports
# EXPOSE 80 443


# # Use dumb-init for proper signal handling
# ENTRYPOINT ["/usr/bin/dumb-init", "--"]
# CMD ["nginx", "-g", "daemon off;"]

# # ##### Generating SSL certificates at build time:
# # # 
# # # Ensure SSL directory exists
# # RUN mkdir -p /etc/nginx/ssl

# # # Generate self-signed SSL certificate in the container
# # RUN apk add --no-cache openssl && \
# #     openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
# #     -keyout /etc/nginx/ssl/nginx.key \
# #     -out /etc/nginx/ssl/nginx.crt \
# #     -subj "/C=US/ST=State/L=City/O=Company/OU=Org/CN=localhost"

# # # Set file permissions (ensure correct read access)
# # RUN chmod 600 /etc/nginx/ssl/nginx.key /etc/nginx/ssl/nginx.crt

# # # Expose HTTP and HTTPS ports
# # EXPOSE 80 443

# # # Start Nginx
# # CMD ["nginx", "-g", "daemon off;"]
# # # 
# # #####
