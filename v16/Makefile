
# Variables
DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml
FRONTEND_DIR = frontend
BACKEND_DIR = backend/src

# Default: Build & Run Containers
all: build up

# Build Docker Containers
build:
	$(DOCKER_COMPOSE) build

# Run Docker Containers
up:
	$(DOCKER_COMPOSE) up --build -d

# Stop and Remove Containers
down:
	$(DOCKER_COMPOSE) down

# Install Frontend Dependencies
install-frontend:
	cd $(FRONTEND_DIR) && npm install

# Install Backend Dependencies (if needed)
install-backend:
	@echo "Backend is PHP, no dependencies needed!"

# Run Tests
test:
	php tests/backend/test_server.php
	cd $(FRONTEND_DIR) && npm run test

# Format & Lint Code
lint:
	cd $(FRONTEND_DIR) && npm run lint

# Clean Unused Docker Images & Containers
clean:
	docker system prune -a -f

# Restart Everything
restart: down build up

.PHONY: all build up down install-frontend install-backend test lint clean restart
