
BACKEND_URL  = http://localhost:8080
FRONTEND_URL = http://localhost:3000

DOCKER_COMPOSE = docker-compose -f docker/docker-compose.yml

# all: build up ## Build & Run Containers
all: build up

build: ## Build Docker Containers
	$(DOCKER_COMPOSE) build

up: create-env ## Run Docker Containers
	$(DOCKER_COMPOSE) up -d

down: ## Stop and Remove Containers
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f

clean: ## Clean Unused Docker Images & Containers
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker system prune -a -f

re: down build up ## Restart Everything

.PHONY: all up down clean re



create-env:
	@if [ ! -f backend/.env ]; then \
		echo "Creating .env file..."; \
		echo "DB_PATH=./database/db.sqlite" > backend/.env; \
		echo "APP_SECRET=$$(openssl rand -hex 16)" >> backend/.env; \
		echo ".env file created!"; \
	else \
		echo ".env file already exists."; \
	fi

.PHONY: create-env



open-back: ## Open backend in the browser
	xdg-open $(BACKEND_URL) || open $(BACKEND_URL) || start $(BACKEND_URL)

open-front: ## Open frontend in the browser
	xdg-open $(FRONTEND_URL) || open $(FRONTEND_URL) || start $(FRONTEND_URL)

check-back: ## 
	@curl -i $(BACKEND_URL) || echo "❌ Backend is NOT running!"

check-front:
	@curl -i $(FRONTEND_URL) || echo "❌ Frontend is NOT running!"

.PHONY: open-front open-back check-front check-back
