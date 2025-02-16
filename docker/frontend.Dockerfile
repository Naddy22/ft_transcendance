FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the frontend source code
COPY frontend .

# Build the TypeScript project
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
