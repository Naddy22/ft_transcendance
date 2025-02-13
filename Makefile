
DOCKER_COMPOSE = docker-compose -f docker/docker-compose.yml

# all: build up ## Build & Run Containers
all: build up

build: ## Build Docker Containers
	$(DOCKER_COMPOSE) build

up: ## Run Docker Containers
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



# create-env:
# 	@if [ ! -f backend/.env ]; then \
# 		echo "Creating .env file..."; \
# 		echo "DB_PATH=./database/db.sqlite" > backend/.env; \
# 		echo "APP_SECRET=$$(openssl rand -hex 16)" >> backend/.env; \
# 		echo ".env file created!"; \
# 	else \
# 		echo ".env file already exists."; \
# 	fi

# DATABASE_URL="file:./database.sqlite"
# JWT_SECRET="supersecretkey"

# setup_db:
# 	@if [ ! -f backend/database/db.sqlite ]; then \
# 		echo "Creating SQLite database..."; \
# 		touch backend/database/db.sqlite; \
# 		docker exec -it $$(docker ps --filter "name=backend" -q) sqlite3 /var/www/html/database/db.sqlite < backend/database/init.sql; \
# 		echo "Database initialized!"; \
# 	else \
# 		echo "Database already exists."; \
# 	fi


# setup_db:
# 	@if [ ! -f backend/database/db.sqlite ]; then \
# 		echo "Creating SQLite database..."; \
# 		touch backend/database/db.sqlite; \
# 		docker exec -it $$(docker ps --filter "name=backend" -q) sqlite3 /var/www/html/database/db.sqlite < /var/www/html/database/init.sql; \
# 		echo "Database initialized!"; \
# 	else \
# 		echo "Database already exists, ensuring tables..."; \
# 		docker exec -it $$(docker ps --filter "name=backend" -q) sh -c "sqlite3 /var/www/html/database/db.sqlite '.tables' | grep 'users' || sqlite3 /var/www/html/database/db.sqlite < /var/www/html/database/init.sql"; \
# 		echo "Tables checked."; \
# 	fi

# .PHONY: create-env setup-db

# BACKEND_PORT  = 8080
BACKEND_PORT  = 3000 
FRONTEND_PORT = 3000

BACKEND_URL  = http://localhost:$(BACKEND_PORT)
FRONTEND_URL = http://localhost:$(FRONTEND_PORT)

open-backend: ## Open backend in the browser
	xdg-open $(BACKEND_URL) || open $(BACKEND_URL) || start $(BACKEND_URL)

open-frontend: ## Open frontend in the browser
	xdg-open $(FRONTEND_URL) || open $(FRONTEND_URL) || start $(FRONTEND_URL)

check-backend: ## 
	@curl -i $(BACKEND_URL) || echo "❌ Backend is NOT running!"

check-frontend:
	@curl -i $(FRONTEND_URL) || echo "❌ Frontend is NOT running!"

.PHONY: open-frontend open-backend check-frontend check-backend


# cd backend
# npm init -y
# npm install fastify


# npm install @prisma/client
# npm install --save-dev prisma
# npx prisma init --datasource-provider sqlite
# # (in database/.env)
# DATABASE_URL="file:./database.sqlite"
# npx prisma migrate dev --name init

# # adding a user:
# curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Alice", "email": "alice@example.com"}'

# curl -X POST http://localhost:3000/register \
#      -H "Content-Type: application/json" \
#      -d '{"name": "Alice", "email": "alice@example.com", "password": "securepass"}'

# Test Login
# curl -X POST http://localhost:3000/login \
#      -H "Content-Type: application/json" \
#      -d '{"email": "alice@example.com", "password": "securepass"}'


# # checking users:
# curl http://localhost:3000/users
