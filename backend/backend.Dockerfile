# backend.Dockerfile (from "backend/" context)
# File: backend/backend.Dockerfile

FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["node", "dist/server.js"]
