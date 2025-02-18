
# Path to the .env file relative to the project root
ENV_FILE = backend/.env

# Define multi-line variable for the .env content
define ENV_CONTENT
## Database Configuration
DATABASE_URL="file:/database/data.db"
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
