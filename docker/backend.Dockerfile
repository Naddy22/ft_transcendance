
FROM node:18-alpine
WORKDIR /app

# Install dependencies first for better caching
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --only=production

# Copy Prisma files and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application
COPY backend ./

# Copy necessary startup scripts
COPY docker/entrypoint.sh /app/entrypoint.sh
COPY docker/healthcheck.sh /app/healthcheck.sh

# Ensure scripts are executable
RUN chmod +x /app/entrypoint.sh /app/healthcheck.sh

RUN npm run build

# Expose API port
EXPOSE 3000
# EXPOSE 5555

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

# # Start Fastify server
# CMD ["node", "dist/server.js"]
