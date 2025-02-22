
# Project Info
NAME		:= ft_transcendence
AUTHOR		:= cdumais
TEAM		:= "namoisan & $(AUTHOR)"
REPO_LINK	:= https://github.com/SaydRomey/ft_transcendence

# Network Info
LOCALHOST		:= http://localhost
BACKEND_PORT	:= 3000
FRONTEND_PORT	:= 5173

# Directories
BACKEND_DIR		:= backend
FRONTEND_DIR	:= frontend
GAME_DIR		:= game

# Configuration Files
MK_PATH	:= utils/makefiles

# Imports for Utility Macros and Additional `make` Targets
include $(MK_PATH)/utils.mk		# Utility Variables and Macros
include $(MK_PATH)/docker.mk	# Docker Macros
include $(MK_PATH)/doc.mk		# Documentation Targets
include $(MK_PATH)/env.mk		# .env File Management

# Default Target
.DEFAULT_GOAL	:= all

.DEFAULT:
	$(info make: *** No rule to make target '$(MAKECMDGOALS)'.  Stop.)
	@$(MAKE) help $(NPD)

# ==============================
##@ 🛠  Utility
# ==============================

help: ## Display available targets
	@echo "\nAvailable targets:"
	@awk 'BEGIN {FS = ":.*##";} \
		/^[a-zA-Z_0-9-]+:.*?##/ { \
			printf "   $(CYAN)%-15s$(RESET) %s\n", $$1, $$2 \
		} \
		/^##@/ { \
			printf "\n$(BOLD)%s$(RESET)\n", substr($$0, 5) \
		}' $(MAKEFILE_LIST)

repo: ## Open the GitHub repository
	@$(call INFO,$(NAME),Opening $(AUTHOR)'s github repo...)
	@open $(REPO_LINK);

tree: ## Show file structure (without node_modules/)
	tree -I "node_modules" -I "_local" -I "docs"

.PHONY: help repo tree

# ==============================
##@ 🎯 Main Targets
# ==============================

all: env build up ## Build and start containers

.PHONY: all # build build-no-cache up down logs

# ==============================
##@ 🧹 Cleanup
# ==============================

clean: docker-cleanup ## Remove all containers, images, volumes

fclean: clean ## Full Clean (currently same as `clean`)
# remove dist/ where they are (todo)
# remove node_modules also ? (todo)

ffclean: fclean ## Remove all generated files and folders
	@$(MAKE) pdf-clean $(NPD)
# @$(MAKE) env-clean $(NPD)

re: down build-no-cache up ## Restart all services

.PHONY: clean fclean ffclean re

# ==============================
##@ ** WIP **
# ==============================

# ==============================
##@ Backend Section
# ==============================

backend:  ## Run backend locally
	cd $(BACKEND_DIR) && npm run dev

backend-install:  ## Install backend dependencies
	cd $(BACKEND_DIR) && npm install

backend-test:  ## Run backend tests
	cd $(BACKEND_DIR) && npm test

backend-lint:  ## Lint backend code
	cd $(BACKEND_DIR) && npm run lint

backend-open:  ## Open backend in browser
	$(OPEN) $(LOCALHOST):$(BACKEND_PORT)

backend-curl: ## Check backend using `curl`
	curl -i $(LOCALHOST):$(BACKEND_PORT) || echo "❌ Backend is NOT running!"

backend-check-port: ## Check if backend port is available
	@$(call CHECK_PORT,$(BACKEND_PORT),print)

backend-clean-port: ## Kill any process using the backend port
	@$(call KILL_PROCESS_ON_PORT,$(BACKEND_PORT))

.PHONY: backend backend-install backend-test backend-lint \
		backend-open backend-curl backend-check-port backend-clean-port

# ==============================
##@ Frontend Section
# ==============================

frontend:  ## Run frontend locally
	cd $(FRONTEND_DIR) && npm run dev

frontend-install:  ## Install frontend dependencies
	cd $(FRONTEND_DIR) && npm install

frontend-build:  ## Build frontend for production
	cd $(FRONTEND_DIR) && npm run build

frontend-test:  ## Run frontend tests
	cd $(FRONTEND_DIR) && npm test

frontend-lint:  ## Lint frontend code
	cd $(FRONTEND_DIR) && npm run lint

frontend-open:  ## Open frontend in browser
	$(OPEN) $(LOCALHOST):$(FRONTEND_PORT)

frontend-curl: ## Check frontend using `curl`
	curl -i $(LOCALHOST):$(FRONTEND_PORT) || echo "❌ Frontend is NOT running!"

frontend-check-port: ## Check if frontend port is available
	@$(call CHECK_PORT,$(FRONTEND_PORT),print)

frontend-clean-port: ## Kill any process using the frontend port
	@$(call KILL_PROCESS_ON_PORT,$(BACKEND_PORT))

.PHONY: frontend frontend-install frontend-build frontend-test frontend-lint \
		frontend-open frontend-curl frontend-check-port frontend-clean-port

# ==============================
##@ Pong Game Section (Babylon.js)
# ==============================

game:  ## Run Pong game
	cd $(GAME_DIR) && npm run dev

game-install:  ## Install game dependencies
	cd $(GAME_DIR) && npm install

game-build:  ## Build Pong game
	cd $(GAME_DIR) && npm run build

# ==============================
##@ Database Section
# ==============================

# Regenerate Prisma Client to apply changes:
# npx prisma generate --schema=backend/src/prisma/schema.prisma

# Run the Prisma migration command again to confirm it's using the correct folder
# npx prisma migrate dev --name init --schema=backend/src/prisma/schema.prisma



db-migrate:  ## Run Prisma migrations
	cd $(BACKEND_DIR) && npx prisma migrate dev --name init

db-seed:  ## Seed the database with test data
	cd $(BACKEND_DIR) && npx prisma db seed

db-reset:  ## Reset the database
	cd $(BACKEND_DIR) && npx prisma migrate reset --force

# ==============================
##@ Production Deployment
# ==============================

prod-build:  ## Build containers for production
	$(DOCKER_COMPOSE_PROD) build

prod-up:  ## Start production containers
	$(DOCKER_COMPOSE_PROD) up -d

prod-down:  ## Stop production containers
	$(DOCKER_COMPOSE_PROD) down

prod-logs:  ## Show logs for production
	$(DOCKER_COMPOSE_PROD) logs -f


# ==============================
# ** TOCHECK **
# ==============================

# # Frontend Section ** 

# FRONTEND_DIR	:= frontend
# SRC_DIR			:= $(FRONTEND_DIR)/src
# DIST_DIR		:= $(FRONTEND_DIR)/dist
# TS_FILES		:= $(wildcard $(SRC_DIR)/*ts)
# JS_FILES		:= $(TS_FILES:$(SRC_DIR)/%.ts=$(DIST_DIR)/%.js)

# tsc: ## Compile TypeScript files
# 	tsc

# build: tsc ## Compile everything and update files (default command)

# clean: ## Remove compiled files
# 	rm -rf $(DIST_DIR)/*.js

# start: build ## Launch project after compilation
# # (add command to lauch project here, e.g.: a local server)

# test: ## Test (if necessary)

# .PHONY: tsc build clean start test

# frontend dependencies ? **tocheck
# nodejs
# npm
# typescript
# babylonjs (3D)

# npm install --save-dev vite
# npm run dev

# # 2d vs 3d
# # inside 'index.html' L.70 :
# <script type="module" src="./src/main.ts"></script> # 2D
# <script type="module" src="./src/main3D.ts"></script> # 3D

# ==============================
# ==============================

# cd $(BACKEND_DIR)
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

# ==============================
# ==============================
