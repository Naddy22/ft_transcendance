# Build Stage
FROM node:18-slim
# FROM node:18.17.0-slim
WORKDIR /app

RUN apt-get update && \
	apt-get install -y --no-install-recommends dumb-init && \
	rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd --create-home --shell /bin/bash appuser

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the source code
COPY . .

# Build the backend (if using TypeScript)
RUN npm run build

# Change ownership of files if needed (this should be safe since everything was copied by root)
RUN chown -R appuser:appuser /app

# Expose the backend port
EXPOSE 3000

# Run as non-root user and use dumb-init for proper signal handling
USER appuser
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
# CMD ["npm", "run", "start"]
