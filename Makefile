
# NPM_LIST	:= npm ls --depth=0

# Project Info
NAME		:= ft_transcendence
AUTHOR		:= cdumais
TEAM		:= 'namoisan & $(AUTHOR)'
REPO_LINK	:= https://github.com/SaydRomey/ft_transcendence

# Network Info
BACKEND_PORT	:= 3000
FRONTEND_PORT	:= 5173
BACKEND_URL		:= http://localhost:$(BACKEND_PORT)
FRONTEND_URL	:= http://localhost:$(FRONTEND_PORT)

# Directories
BACKEND_DIR		:= backend
FRONTEND_DIR	:= frontend
# FRONTEND_DIR	:= PongGame
GAME_DIR		:= PongGame

# Log files
LOG_DIRS			:= $(BACKEND_DIR)/logs $(FRONTEND_DIR)/logs
BACKEND_LOG_FILE	:= backend_$(TIMESTAMP).log
FRONTEND_LOG_FILE	:= frontend_$(TIMESTAMP).log

# Database
DATABASE_DIR	:= $(BACKEND_DIR)/data
DATABASE		:= $(DATABASE_DIR)/database.sqlite

# Avatar Upload
UPLOAD_DIR		:= $(BACKEND_DIR)/uploads

# Build
DIST_DIRS		:= $(BACKEND_DIR)/dist $(FRONTEND_DIR)/dist $(GAME_DIR)/dist
NODE_MOD_DIRS	:= node_modules $(BACKEND_DIR)/node_modules $(FRONTEND_DIR)/node_modules $(GAME_DIR)/node_modules

# Configuration Files
MK_PATH	:= utils/makefiles

# Imports for Utility Macros and Additional `make` Targets
include $(MK_PATH)/utils.mk		# Utility Variables and Macros
include $(MK_PATH)/docker.mk	# Docker Macros
include $(MK_PATH)/doc.mk		# Documentation Targets
include $(MK_PATH)/env.mk		# .env File Management
include $(MK_PATH)/scripts.mk	# Scripts management
include $(MK_PATH)/misc.mk		# Miscellaneous Utilities

# Default Target
.DEFAULT_GOAL	:= all
# .DEFAULT_GOAL	:= test_local # **tmp

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

# create-users: ## Run a script to register 3 users
# 	@$(call INFO,$(NAME),Generating users...)
# 	@chmod +x $(TEST_CREATE_USERS)

.PHONY: help repo

# ==============================
##@ 🎯 Main Targets
# ==============================

all: env-copy build up ## Build and start containers
	@$(OPEN) http://localhost

# Comment/Uncomment these to log outputs
# ENABLE_BACK_LOG		:= > logs/$(BACKEND_LOG_FILE) $(STDERR_STDOUT)
# ENABLE_FRONT_LOG	:= > logs/$(FRONTEND_LOG_FILE) $(STDERR_STDOUT)

# test_local: | $(LOG_DIRS) ## Automates frontend build and backend start process
# 	@if $(call IS_PORT_IN_USE,$(BACKEND_PORT)); then \
# 		$(MAKE) $(NPD) stop; \
# 	fi

# 	@$(call INFO,$(NAME),,Building frontend... (npm run build))
# 	@cd $(FRONTEND_DIR) && npm run build $(ENABLE_FRONT_LOG)
# 	@$(call SUCCESS,$(NAME),Frontend build complete.)

# 	@$(call INFO,$(NAME),,Starting backend... (npm run dev))
# 	@cd $(BACKEND_DIR) && npm run dev $(ENABLE_BACK_LOG) $(IN_BACKGROUND)
# 	@$(call SUCCESS,$(NAME),Backend is running on port $(BACKEND_PORT).)

# 	@sleep 1

# 	@$(call INFO,$(NAME),🌐 Open your browser and go to: $(BACKEND_URL))
# 	@$(call INFO,$(NAME),Use 'make stop' to stop the backend)
# 	@$(OPEN) $(BACKEND_URL) $(STDOUT_NULL) $(STDERR_STDOUT)

# $(LOG_DIRS):
# 	@$(MKDIR) $(LOG_DIRS)

stop: ## Kill all backend running BACKEND_PORT
	@$(call KILL_PROCESS_ON_PORT,$(BACKEND_PORT),print)
	@echo ""

.PHONY: all test_local stop

# ==============================
##@ 🧹 Cleanup
# ==============================

clean: docker-cleanup ## Remove all containers, images, volumes

fclean: clean ## Full Clean, including log files an build files
	@$(call CLEANUP,$(NAME),log files,$(LOG_DIRS),"All logs removed.","No logs to clean.")
	@$(call CLEANUP,$(NAME),built dist directories,$(DIST_DIRS))
	@$(call CLEANUP,$(NAME),node_modules directories,$(NODE_MOD_DIRS))
	@$(call CLEANUP,$(NAME),avatar upload directory,$(UPLOAD_DIR))

ffclean: fclean ## Remove all generated files and folders
	@$(MAKE) pdf-clean $(NPD)
#	@$(MAKE) env-clean $(NPD)
	@$(MAKE) script-clean $(NPD)
	@$(MAKE) tree-clean $(NPD)
	@$(call CLEANUP,$(NAME),database directory,$(DATABASE_DIR))

re: down build-no-cache up ## Restart all services

.PHONY: clean fclean ffclean re

# # ==============================
# ##@ Backend Section
# # ==============================

# back-install:  ## Install backend dependencies
# 	@cd $(BACKEND_DIR) && npm install

# # back-build:
# # back-start:

# back-dev:  ## Run backend locally
# 	@cd $(BACKEND_DIR) && npm run dev

# # back-test:

# back-curl: ## Check backend using `curl`
# 	curl -i $(BACKEND_URL)/health -k || echo "❌ Backend is NOT running!"

# back-check-port: ## Check if backend port is available
# 	@$(call CHECK_PORT,$(BACKEND_PORT),print)

# back-clean-port: ## Kill any process using the backend port
# 	@$(call KILL_PROCESS_ON_PORT,$(BACKEND_PORT))

# .PHONY: back-install back-dev back-curl \
# back-check-port back-clean-port

# # ==============================
# ##@ Frontend Section
# # ==============================

# front-install:  ## Install frontend dependencies
# 	@cd $(FRONTEND_DIR) && npm install

# front-build:  ## Build frontend for production
# 	@cd $(FRONTEND_DIR) && npm run build

# front-dev:  ## Run frontend locally
# 	@cd $(FRONTEND_DIR) && npm run dev

# # front-preview:

# front-check-port: ## Check if frontend port is available
# 	@$(call CHECK_PORT,$(FRONTEND_PORT),print)

# front-clean-port: ## Kill any process using the frontend port
# 	@$(call KILL_PROCESS_ON_PORT,$(BACKEND_PORT))

# .PHONY: front-install front-build front-dev \
# front-check-port front-clean-port

# # ==============================
# ##@ Pong Game Section (Babylon.js)
# # ==============================

# game-install:  ## Install game dependencies
# 	cd $(GAME_DIR) && npm install

# game-dev:  ## Run Pong game using vite
# 	cd $(GAME_DIR) && npm run dev

# game-build:  ## Build Pong game
# 	cd $(GAME_DIR) && npm run build

# # game-preview:

# .PHONY: game-install game-dev game-build
