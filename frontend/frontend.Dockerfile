
FROM node:18-alpine
# FROM node:18.17.0-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# # Remove node_modules to reduce size
# RUN rm -rf node_modules

# # Second stage: Serve optimized files
# FROM nginx:alpine AS production
# WORKDIR /usr/share/nginx/html

# COPY --from=build /app/dist ./

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
