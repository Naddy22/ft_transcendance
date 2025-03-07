
FROM nginx:stable-alpine
# FROM nginx:1.24.0-alpine
# WORKDIR /etc/nginx

# Install dumb-init without extra recommended packages
RUN apk add --no-cache dumb-init

COPY nginx.conf /etc/nginx/nginx.conf

# Copy built frontend files to serve the static website
COPY --from=ft_transcendence-frontend /app/dist /usr/share/nginx/html

# Ensure the SSL certificates are copied (assuming they're generated in backend)
COPY --chown=nginx:nginx /backend/certs /etc/nginx/ssl

# Change ownership of copied files (important for running as non-root)
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx

# Switch to non-root user
USER nginx

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Handles signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]

# ##### Generating SSL certificates at build time:
# # 
# # Ensure SSL directory exists
# RUN mkdir -p /etc/nginx/ssl

# # Generate self-signed SSL certificate in the container
# RUN apk add --no-cache openssl && \
#     openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout /etc/nginx/ssl/nginx.key \
#     -out /etc/nginx/ssl/nginx.crt \
#     -subj "/C=US/ST=State/L=City/O=Company/OU=Org/CN=localhost"

# # Set file permissions (ensure correct read access)
# RUN chmod 600 /etc/nginx/ssl/nginx.key /etc/nginx/ssl/nginx.crt

# # Expose HTTP and HTTPS ports
# EXPOSE 80 443

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]
# # 
# #####
