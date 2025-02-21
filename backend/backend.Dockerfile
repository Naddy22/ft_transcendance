
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy Prisma schema and migrations and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the application source code
COPY . .

# Build the app
RUN npm run build

# 
FROM node:18-alpine AS runtime
WORKDIR /app

# Copy built files from build stage
COPY --from=build /app /app

# Copy necessary startup scripts
COPY entrypoint.sh /app/entrypoint.sh
COPY healthcheck.sh /app/healthcheck.sh
RUN chmod +x /app/entrypoint.sh /app/healthcheck.sh

RUN npm run build

# Expose API port
EXPOSE 3000

# Expose Prisma Studio port
# EXPOSE 5555

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
