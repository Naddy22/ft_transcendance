
# Path to the .env file relative to the project root
ENV_FILE = backend/.env

# Define multi-line variable for the .env content
define ENV_CONTENT
# Database Configuration
DATABASE_URL="file:./prisma/database.db"  # Path to the SQLite database file

# Authentication
JWT_SECRET="your_super_secret_key"  # Change this to a strong secret for JWT

# Server Configuration
PORT=3000  # The port Fastify will run on

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"  # Frontend URL during development

endef
export ENV_CONTENT

# ==============================
##@ .env Automation
# ==============================

create-env: ## Generate the .env file at backend/.env
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Creating $(ENV_FILE) file..."; \
		echo "$$ENV_CONTENT" > $(ENV_FILE); \
		echo ".env file created at $(ENV_FILE)!"; \
	else \
		echo ".env file already exists."; \
	fi

clean_env: ## Remove .env file
	@$(call CLEANUP, $(ENV_FILE),\t.env file,$(ENV_FILE))

reset_env: clean_env gen_env ## Overwrite .env file

.PHONY: gen_env clean_env reset_env

# # Default values if environment variables are missing
# USER_NAME := $(or $(USER), cdumais)
# COUNTRY := $(or $(COUNTRY), CA)
# DOMAIN_NAME := $(USER_NAME).42.fr

# # Define multi-line variable for the .env content
# define ENV_CONTENT
# # Environment variables
# USER=$(USER_NAME)
# DOMAIN_NAME=$(DOMAIN_NAME)
# COUNTRY=$(COUNTRY)

# # Database configuration
# DB_NAME=wordpress
# DB_HOST=mariadb
# DB_USER_FILE=/run/secrets/db_user
# DB_PASSWORD_FILE=/run/secrets/db_password
# DB_ROOT_PASSWORD_FILE=/run/secrets/db_root_password
# endef
# export ENV_CONTENT
