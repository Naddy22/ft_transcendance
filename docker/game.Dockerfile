
FROM node:18-alpine

WORKDIR /app

COPY game/package.json game/package-lock.json ./
RUN npm install --only=production

COPY game .
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
