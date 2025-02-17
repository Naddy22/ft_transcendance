
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first, then install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy Prisma schema before generating client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Now copy the rest of the app
COPY backend ./

# Ensure Prisma Client is in the correct location
RUN ls -lah node_modules/.prisma && ls -lah node_modules/.prisma/client
RUN cp -R node_modules/.prisma node_modules/@prisma

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 3000

# Ensure Prisma Client is generated before running the server
CMD ["sh", "-c", "npx prisma generate && node dist/server.js"]

