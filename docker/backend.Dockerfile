FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the backend source code
COPY backend .
RUN npx prisma generate

# Expose port 3000 for Fastify
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
