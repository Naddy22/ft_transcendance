# Build Stage
FROM node:18-slim
# FROM node:18.17.0-slim
WORKDIR /app

RUN apt-get update && \
	apt-get install -y --no-install-recommends dumb-init && \
	rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
RUN npm run build

# Expose API port
EXPOSE 3000

# Ensures proper process handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
