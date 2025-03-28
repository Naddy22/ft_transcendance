#!/bin/bash

# File: utils/scripts/createUsers.sh
# Creates 3 users in the database
# Run with: bash utils/scripts/createUsers.sh

# Base domains/ports
HTTPS_URL="https://localhost"
HTTP_URL="http://localhost:3000"

# Default curl opts
CURL_OPTS="-s"
API_URL=""

# Define the users to create
declare -A USERS
USERS["Naddy"]="namoisan@cat.pong"
USERS["Cedou"]="cdumais@cat.pong"
USERS["Marvin"]="noreply@42quebec.com"

DEFAULT_PASSWORD="password"

# Detect if HTTPS (nginx) is reachable
echo "🌐 Checking backend availability..."

if curl -sk --max-time 2 "$HTTPS_URL/health" > /dev/null; then
  echo "✅ NGINX (HTTPS) mode detected"
  API_URL="$HTTPS_URL"
  CURL_OPTS="-sk"  # Silent + ignore self-signed cert
elif curl -s --max-time 2 "$HTTP_URL/health" > /dev/null; then
  echo "✅ Backend solo mode (HTTP) detected"
  API_URL="$HTTP_URL"
else
  echo "❌ Could not reach backend on either HTTPS or HTTP. Is it running?"
  exit 1
fi

USERS_ENDPOINT="$API_URL/users"
REGISTER_ENDPOINT="$API_URL/auth/register"

# Check if user exists by username
user_exists() {
  local username="$1"
  local result=$(curl $CURL_OPTS "$USERS_ENDPOINT")
  echo "$result" | grep -iq "\"username\":\"$username\"" && return 0 || return 1
}

# Main loop
for username in "${!USERS[@]}"; do
  email="${USERS[$username]}"
  echo "🔍 Checking if user '$username' exists..."

  if user_exists "$username"; then
    echo "✅ User '$username' already exists, skipping."
  else
    echo "➕ Creating user '$username'..."
    response=$(curl $CURL_OPTS -X POST "$REGISTER_ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "{\"username\": \"$username\", \"email\": \"$email\", \"password\": \"$DEFAULT_PASSWORD\"}")

    if echo "$response" | grep -q '"id"'; then
      echo "✅ User '$username' created successfully."
    else
      echo "❌ Failed to create user '$username':"
      echo "$response"
    fi
  fi
done



# ##### (backend in solo mode)
# #!/bin/bash

# # File: utils/scripts/createUsers.sh
# # Creates 3 users in the database
# # Run with: bash utils/scripts/createUsers.sh

# # If you're running the backend standalone, use HTTP and the correct port
# API_URL="http://localhost:3000"  # <--- SOLO MODE URL
# USERS_ENDPOINT="$API_URL/users"
# REGISTER_ENDPOINT="$API_URL/auth/register"

# # No need for -k since it's not HTTPS
# CURL_OPTS="-s"  # -s = silent

# # Define the users to create
# declare -A USERS
# USERS["Naddy"]="namoisan@cat.pong"
# USERS["Cedou"]="cdumais@cat.pong"
# USERS["Marvin"]="noreply@42quebec.com"

# DEFAULT_PASSWORD="password"

# # Check if a user exists by username (case-insensitive)
# user_exists() {
#   local username="$1"
#   result=$(curl $CURL_OPTS "$USERS_ENDPOINT")
#   echo "$result" | grep -iq "\"username\":\"$username\"" && return 0 || return 1
# }

# # Main loop
# for username in "${!USERS[@]}"; do
#   email="${USERS[$username]}"
#   echo "🔍 Checking if user '$username' exists..."

#   if user_exists "$username"; then
#     echo "✅ User '$username' already exists, skipping."
#   else
#     echo "➕ Creating user '$username'..."
#     response=$(curl $CURL_OPTS -X POST "$REGISTER_ENDPOINT" \
#       -H "Content-Type: application/json" \
#       -d "{\"username\": \"$username\", \"email\": \"$email\", \"password\": \"$DEFAULT_PASSWORD\"}")

#     if echo "$response" | grep -q '"id"'; then
#       echo "✅ User '$username' created successfully."
#     else
#       echo "❌ Failed to create user '$username':"
#       echo "$response"
#     fi
#   fi
# done
# #####

# ##### (backend through nginx)
# #!/bin/bash

# # File: utils/scripts/createUsers.sh
# # Creates 3 users in the database
# # Run with: bash utils/createUsers.sh

# API_URL="https://localhost" # Served via nginx proxy
# USERS_ENDPOINT="$API_URL/users"
# REGISTER_ENDPOINT="$API_URL/auth/register"

# # Use self-signed certs
# CURL_OPTS="-sk" # -s silent, -k ignore cert

# # Define the users we want to create
# declare -A USERS
# USERS["Naddy"]="namoisan@cat.pong"
# USERS["Cedou"]="cdumais@cat.pong"
# USERS["Marvin"]="noreply@42quebec.com" # [Paced System Warning] Attendance is low

# DEFAULT_PASSWORD="password"

# # Function to check if a user exists by username (case-insensitive, with `grep -iq`)
# user_exists() {
#   local username="$1"
#   result=$(curl $CURL_OPTS "$USERS_ENDPOINT")
#   echo "$result" | grep -iq "\"username\":\"$username\"" && return 0 || return 1
# }

# # Main loop
# for username in "${!USERS[@]}"; do
#   email="${USERS[$username]}"
#   echo "🔍 Checking if user '$username' exists..."

#   if user_exists "$username"; then
#     echo "✅ User '$username' already exists, skipping."
#   else
#     echo "➕ Creating user '$username'..."
#     response=$(curl $CURL_OPTS -X POST "$REGISTER_ENDPOINT" \
#       -H "Content-Type: application/json" \
#       -d "{\"username\": \"$username\", \"email\": \"$email\", \"password\": \"$DEFAULT_PASSWORD\"}")

#     if echo "$response" | grep -q '"id"'; then
#       echo "✅ User '$username' created successfully."
#     else
#       echo "❌ Failed to create user '$username':"
#       echo "$response"
#     fi
#   fi
# done

# # Server is serving everything behind NGINX with HTTPS via self-signed certs.
# # Uses HTTPS and -k (since it's self-signed)
# # Hits the NGINX proxy (so https://localhost instead of backend:3000)
# # Checks if a user exists before attempting to register
# # Is idempotent: if the user exists, skips creating them
# #####
