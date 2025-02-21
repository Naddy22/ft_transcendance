
FROM nginx:stable-alpine
WORKDIR /etc/nginx

# Install OpenSSL (required for generating SSL certificates)
RUN apk add --no-cache openssl

# Copy the custom Nginx configuration file into the container
COPY deployments/nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script for SSL generation
COPY deployments/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy frontend build files to serve the static website
COPY frontend/dist /usr/share/nginx/html

# # Set file ownership and permissions
# RUN chmod -R 644 /etc/nginx/nginx.conf && \
#     chmod -R 755 /usr/share/nginx/html && \
#     chmod -R 600 /etc/nginx/ssl/* || true

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Run entrypoint script before starting Nginx
ENTRYPOINT ["/entrypoint.sh"]
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
