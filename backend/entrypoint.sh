#!/bin/sh
set -e  # Exit on error

echo "🚀 Running Prisma Migrations..."
npx prisma migrate deploy  # Ensures database is up-to-date

echo "✅ Starting Fastify server..."
exec node dist/server.js  # Ensure this process receives signals correctly
