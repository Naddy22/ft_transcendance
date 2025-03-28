
# Path to the backend .env file relative to the project root
ENV_FILE_BACKEND		:= backend/.env
ENV_TEMPLATE_BACKEND	:= ./utils/templates/.env.backend.template

# Path to the root .env file relative to the project root
ENV_FILE_ROOT			:= ./.env
ENV_TEMPLATE_ROOT		:= ./utils/templates/.env.root.template

# ==============================
# Define multi-line variable for the backend .env content
define ENV_CONTENT_BACKEND
# File: backend/.env

# Path to the SQLite database file
DATABASE_URL=sqlite://./data/database.sqlite

# Authentication
JWT_SECRET="supersecretkey"
# (Change this to a strong secret for JWT)

# Password Hashing with bcrypt
BCRYPT_SALT_ROUNDS=10

# Node environment
NODE_ENV=development
# NODE_ENV=production

# Server Configuration
PORT=3000
# (The port Fastify will run on)

endef
export ENV_CONTENT_BACKEND

# ==============================
# Define multi-line variable for the root .env (used by docker)
define ENV_CONTENT_ROOT
# File: ./.env

# Authentication
JWT_SECRET="supersecretkey"
# (Change this to a strong secret for JWT)

# Authentication
JWT_SECRET="supersecretkey"
# (Change this to a strong secret for JWT)

# Node environment
NODE_ENV=production

# Nginx environment
DOMAIN=localhost
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

endef
export ENV_CONTENT_ROOT

# ==============================
##@ .env Automation
# ==============================

env: ## Destructive env creation (uses 'env.mk' variables)
	@if [ ! -f $(ENV_FILE_BACKEND) ]; then \
		echo "$$ENV_CONTENT_BACKEND" > $(ENV_FILE_BACKEND); \
		echo "$(ENV_FILE_BACKEND) $(GREEN)Generated!$(RESET)"; \
	fi
	@if [ ! -f $(ENV_FILE_ROOT) ]; then \
		echo "$$ENV_CONTENT_ROOT" > $(ENV_FILE_ROOT); \
		echo "$(ENV_FILE_ROOT) $(GREEN)Generated!$(RESET)"; \
	fi

env-copy: ## Copies the '.env' template' files at './backend/.env' and './.env'
	@if [ ! -f $(ENV_FILE_BACKEND) ]; then \
		echo "Copying $(ENV_TEMPLATE_BACKEND) file at $(ENV_FILE_BACKEND)..."; \
		cp $(ENV_TEMPLATE_BACKEND) $(ENV_FILE_BACKEND); \
		echo "$(GREEN).env file created at $(ENV_FILE_BACKEND)"; \
	fi
	@if [ ! -f $(ENV_FILE_ROOT) ]; then \
		echo "Copying $(ENV_TEMPLATE_ROOT) file at $(ENV_FILE_ROOT)..."; \
		cp $(ENV_TEMPLATE_ROOT) $(ENV_FILE_ROOT); \
		echo "$(GREEN).env file created at $(ENV_FILE_ROOT)"; \
	fi

env-create: ## Generate the .env files with prompt for overwrite
	@if [ ! -f $(ENV_FILE_BACKEND) ]; then \
		echo "$(YELLOW)Creating $(RESET)$(ENV_FILE_BACKEND) $(YELLOW)file...$(RESET)"; \
		echo "$$ENV_CONTENT_BACKEND" > $(ENV_FILE_BACKEND); \
		echo "$(GREEN).env file created at$(RESET) $(ENV_FILE_BACKEND)!"; \
	else \
		read -p "$(ENV_FILE_BACKEND) $(ORANGE)already exists.$(RESET) Overwrite? [Y/n]: " confirm; \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || [ -z "$$confirm" ]; then \
			echo "$(YELLOW)Overwriting$(RESET) $(ENV_FILE_BACKEND)$(ORANGE)...$(RESET)"; \
			echo "$$ENV_CONTENT_BACKEND" > $(ENV_FILE_BACKEND); \
			echo ".env $(GREEN)file overwritten!$(RESET)"; \
		else \
			echo "$(GREEN)Keeping existing .env file.$(RESET)"; \
		fi \
	fi
	@if [ ! -f $(ENV_FILE_ROOT) ]; then \
		echo "$(YELLOW)Creating $(RESET)$(ENV_FILE_ROOT) $(YELLOW)file...$(RESET)"; \
		echo "$$ENV_CONTENT_ROOT" > $(ENV_FILE_ROOT); \
		echo "$(GREEN).env file created at$(RESET) $(ENV_FILE_ROOT)!"; \
	else \
		read -p "$(ENV_FILE_ROOT) $(ORANGE)already exists.$(RESET) Overwrite? [Y/n]: " confirm; \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || [ -z "$$confirm" ]; then \
			echo "$(YELLOW)Overwriting$(RESET) $(ENV_FILE_ROOT)$(ORANGE)...$(RESET)"; \
			echo "$$ENV_CONTENT_ROOT" > $(ENV_FILE_ROOT); \
			echo ".env $(GREEN)file overwritten!$(RESET)"; \
		else \
			echo "$(GREEN)Keeping existing .env file.$(RESET)"; \
		fi \
	fi

env-clean: ## Remove .env files
	@$(call CLEANUP,Environment,.env file,$(ENV_FILE_BACKEND) $(ENV_FILE_ROOT))

env-reset: env-clean env-create ## Overwrite .env file

.PHONY: env env-create env-copy env-clean env-reset
