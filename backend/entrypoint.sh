#!/bin/sh
set -e  # Exit on error

echo "🚀 Ensuring database file exists..."
mkdir -p /app/database
touch /app/database/data.db

echo "🚀 Running Prisma Migrations..."
npx prisma migrate deploy

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "✅ Starting Fastify server..."
exec node dist/server.js
