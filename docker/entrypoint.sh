#!/bin/sh
set -e  # Exit immediately if a command fails

echo "🚀 Running Prisma setup..."
npx prisma generate
npx prisma migrate deploy  # Ensures database is up-to-date

echo "✅ Starting Fastify server..."
exec node dist/server.js  # Ensure this process receives signals correctly
