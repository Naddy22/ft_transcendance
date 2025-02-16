
# Path to the .env file relative to the project root
ENV_FILE = backend/.env

# Define multi-line variable for the .env content
define ENV_CONTENT
## Database Configuration
DATABASE_URL="file:./prisma/database.db"
# (Path to the SQLite database file)

# Authentication
JWT_SECRET="your_super_secret_key"
# (Change this to a strong secret for JWT)

# Server Configuration
PORT=3000
# (The port Fastify will run on)

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"
# (Frontend URL during development)

endef
export ENV_CONTENT

# ==============================
##@ .env Automation
# ==============================

env-create: ## Generate the .env file at backend/.env
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Creating $(ENV_FILE) file..."; \
		echo "$$ENV_CONTENT" > $(ENV_FILE); \
		echo ".env file created at $(ENV_FILE)!"; \
	else \
		read -p "$(ENV_FILE) already exists. Overwrite? [Y/n]: " confirm; \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || [ -z "$$confirm" ]; then \
			echo "Overwriting $(ENV_FILE)..."; \
			echo "$$ENV_CONTENT" > $(ENV_FILE); \
			echo ".env file overwritten!"; \
		else \
			echo "Keeping existing .env file."; \
		fi \
	fi

env-clean: ## Remove .env file
	@$(call CLEANUP,$(ENV_FILE),.env file,$(ENV_FILE))

env-reset: env-clean env-create ## Overwrite .env file

.PHONY: env-create env-clean env-reset
