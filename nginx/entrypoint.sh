#!/bin/bash

# File: nginx/entrypoint.sh
# nginx entrypoint script

# Creates self-signed SSL certificates for local HTTPS

set -e # Exit on any error

DOMAIN="${DOMAIN:-localhost}"
# DOMAIN="${DOMAIN:-CatPong}" # to change later, also in nginx.conf ?
SSL_DIR="/etc/nginx/ssl"
CERT_FILE="$SSL_DIR/nginx.cert"
KEY_FILE="$SSL_DIR/nginx.key"

# Ensure the SSL directory exists
mkdir -p "$SSL_DIR"

# Check if SSL files already exist
if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "🔐 Generating self-signed SSL certificate for $DOMAIN..."
  mkdir -p "$SSL_DIR"
  openssl req -x509 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -nodes \
    -subj "/CN=$DOMAIN"
else
  echo "✅ SSL certificates already exist. Skipping generation."
fi

# Set strict permissions
chmod 600 "$KEY_FILE" "$CERT_FILE"

echo "🚀 Starting NGINX..."
exec nginx -g 'daemon off;'
