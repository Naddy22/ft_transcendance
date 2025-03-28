
# Path to the .env file relative to the project root
ENV_FILE	:= backend/.env
ENV_EXAMPLE := ./utils/templates/.env.template

# Define multi-line variable for the .env content
define ENV_CONTENT

# Path to the SQLite database file
DATABASE_URL=sqlite://./data/database.sqlite

# Authentication
JWT_SECRET="super_secret_key"
# (Change this to a strong secret for JWT)

# Password Hashing with bcrypt
BCRYPT_SALT_ROUNDS=10

# Server Configuration
PORT=3000
# (The port Fastify will run on)

# Node environment
NODE_ENV=development
# NODE_ENV=production

# Frontend built directory for serving static files
FRONTEND_DIST="../../frontend/dist"

endef
export ENV_CONTENT

# ==============================
##@ .env Automation
# ==============================

env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$$ENV_CONTENT" > $(ENV_FILE); \
		echo "$(ENV_FILE) $(GREEN)Generated!$(RESET)"; \
	fi

env-create: ## Generate the .env with prompt for overwrite
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(YELLOW)Creating $(RESET)$(ENV_FILE) $(YELLOW)file...$(RESET)"; \
		echo "$$ENV_CONTENT" > $(ENV_FILE); \
		echo "$(GREEN).env file created at$(RESET) $(ENV_FILE)!"; \
	else \
		read -p "$(ENV_FILE) $(ORANGE)already exists.$(RESET) Overwrite? [Y/n]: " confirm; \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || [ -z "$$confirm" ]; then \
			echo "$(YELLOW)Overwriting$(RESET) $(ENV_FILE)$(ORANGE)...$(RESET)"; \
			echo "$$ENV_CONTENT" > $(ENV_FILE); \
			echo ".env $(GREEN)file overwritten!$(RESET)"; \
		else \
			echo "$(GREEN)Keeping existing .env file.$(RESET)"; \
		fi \
	fi

env-copy: ## Copies the '.env.template' file at './backend/.env'
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Copying $(ENV_EXAMPLE) file at $(ENV_FILE)..."; \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
		echo "$(GREEN).env file created at $(ENV_FILE)"; \
	else \
		read -p "$(ENV_FILE) $(ORANGE)already exists.$(RESET) Overwrite? [Y/n]: " confirm; \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || [ -z "$$confirm" ]; then \
			echo "$(YELLOW)Overwriting $(ENV_FILE) with template...$(RESET)"; \
			cp $(ENV_EXAMPLE) $(ENV_FILE); \
			echo ".env $(GREEN)file overwritten!$(RESET)"; \
		else \
			echo "$(GREEN)Keeping existing .env file.$(RESET)"; \
		fi \
	fi

env-clean: ## Remove .env file
	@$(call CLEANUP,$(ENV_FILE),.env file,$(ENV_FILE))

env-reset: env-clean env-create ## Overwrite .env file

.PHONY: env env-create env-copy env-clean env-reset

# ==============================
# ==============================

# # Backend
# BACKEND_PORT=3000
# DB_PATH=/database/sqlite.db

# # Authentication
# JWT_SECRET=your_super_secret_key
# SESSION_TIMEOUT=3600

# # Frontend


# 
# 
# # Check if .env exists, otherwise create it with default values
# backend/.env:
# 	@echo "⚠️  .env file missing, creating default .env..."
# 	@echo "DATABASE_URL=sqlite:///database/data.db" > backend/.env
# 	@echo "JWT_SECRET=default_secret" >> backend/.env
# 	@echo "NODE_ENV=development" >> backend/.env

# # Ensure .env is always generated before running Docker Compose
# docker-up: backend/.env
# 	docker-compose up --build


# echo "DATABASE_URL=sqlite:///database/data.db" > backend/.env
# echo "JWT_SECRET=default_secret" >> backend/.env
# echo "NODE_ENV=development" >> backend/.env
