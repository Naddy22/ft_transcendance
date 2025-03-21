
FROM node:18-alpine
# FROM node:18.17.0-alpine
WORKDIR /app

# Create a non-root group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files and install dependencies (as root)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code.
# (Because we’ve excluded dist via .dockerignore, no built output is copied.)
COPY . .

# (Optional) Adjust file permissions if needed (try to avoid chown on node_modules if possible)
RUN chown -R appuser:appgroup /app

# Build the frontend
USER appuser
RUN npm run build

# The built assets will be in /app/dist

# # Remove node_modules to reduce size
# RUN rm -rf node_modules

# # Second stage: Serve optimized files
# FROM nginx:alpine AS production
# WORKDIR /usr/share/nginx/html

# COPY --from=build /app/dist ./

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
