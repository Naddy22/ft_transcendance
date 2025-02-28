
# Path to the .env file relative to the project root
ENV_FILE = backend/.env

# Define multi-line variable for the .env content
define ENV_CONTENT
## Database Configuration
# DATABASE_URL="file:../database/data.db"
DATABASE_URL=sqlite://./data/database.sqlite
# (Path to the SQLite database file)

# Authentication
JWT_SECRET="super_secret_key"
# (Change this to a strong secret for JWT)

# Password Hashing with bcrypt
BCRYPT_SALT_ROUNDS=10

# Server Configuration
PORT=3000
# (The port Fastify will run on)

# CORS Configuration
# CORS_ORIGIN="http://localhost:5173"
# (Frontend URL during development)

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

env-clean: ## Remove .env file
	@$(call CLEANUP,$(ENV_FILE),.env file,$(ENV_FILE))

env-reset: env-clean env-create ## Overwrite .env file

.PHONY: env env-create env-clean env-reset

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
