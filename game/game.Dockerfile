# First stage: Build
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Ensure the output directory exists
RUN mkdir -p dist && npm run build

# Remove node_modules to reduce size
RUN rm -rf node_modules

# Second stage: Serve the built game with Nginx
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./

EXPOSE 8082
CMD ["nginx", "-g", "daemon off;"]
