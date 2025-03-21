#!/bin/bash

CERT_DIR="/etc/nginx/ssl"
CERT_KEY="$CERT_DIR/privkey.pem"
CERT_CRT="$CERT_DIR/fullchain.pem"

# Check if certs exist
if [ ! -f "$CERT_CRT" ] || [ ! -f "$CERT_KEY" ]; then
  echo "🔐 Generating self-signed SSL certificate..."
  mkdir -p "$CERT_DIR"
  openssl req -x509 -newkey rsa:2048 \
    -keyout "$CERT_KEY" \
    -out "$CERT_CRT" \
    -days 365 \
    -nodes \
    -subj "/CN=localhost"
else
  echo "✅ SSL certificates already exist. Skipping generation."
fi

echo "🚀 Starting NGINX..."
exec nginx -g 'daemon off;'


# #!/bin/sh
# # Creates self-signed SSL certificates for local HTTPS

# set -e  # Exit immediately if a command fails

# SSL_DIR="/etc/nginx/ssl"
# DOMAIN="localhost"
# CERT_FILE="$SSL_DIR/nginx.crt"
# KEY_FILE="$SSL_DIR/nginx.key"

# # Ensure the SSL directory exists
# mkdir -p "$SSL_DIR"

# # Check if SSL files already exist
# if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
#     echo "SSL certificate already exists. Skipping generation."
#     exit 0
# fi

# echo "Generating self-signed SSL certificate for $DOMAIN..."

# # Generate a 2048-bit RSA private key
# openssl genrsa -out "$KEY_FILE" 2048

# # Create a self-signed certificate valid for 365 days
# openssl req -new -x509 -key "$KEY_FILE" -out "$CERT_FILE" -days 365 \
#     -subj "/C=US/ST=State/L=City/O=Company/OU=Org/CN=$DOMAIN"

# # openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
# #     -keyout "$KEY_FILE" \
# #     -out "$CERT_FILE" \
# #     -subj "/C=US/ST=State/L=City/O=Company/OU=Org/CN=$DOMAIN"

# echo "SSL certificate created: $CERT_FILE/"

# # 🔒 Set correct permissions
# echo "Setting correct file permissions..."
# chmod -R 644 /etc/nginx/nginx.conf
# chmod -R 755 /usr/share/nginx/html
# chmod -R 600 /etc/nginx/ssl/* || true

# echo "Permissions set successfully."

# # Start Nginx
# exec "$@"
