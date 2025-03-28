
# NPM_LIST	:= npm ls --depth=0

# Project Info
NAME		:= ft_transcendence
AUTHOR		:= cdumais
TEAM		:= 'namoisan & $(AUTHOR)'
REPO_LINK	:= https://github.com/SaydRomey/ft_transcendence

# Network Info
BACKEND_PORT	:= 3000
BACKEND_URL		:= http://localhost:$(BACKEND_PORT)

# Directories
BACKEND_DIR		:= backend
FRONTEND_DIR	:= frontend

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
DIST_DIRS		:= $(BACKEND_DIR)/dist $(FRONTEND_DIR)/dist
NODE_MOD_DIRS	:= node_modules $(BACKEND_DIR)/node_modules $(FRONTEND_DIR)/node_modules

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

.PHONY: help repo

# ==============================
##@ 🎯 Main Targets
# ==============================

all: env-copy build up ## Build and start containers
	@$(OPEN) http://localhost

.PHONY: all

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
	@$(MAKE) env-clean $(NPD)
	@$(MAKE) script-clean $(NPD)
	@$(MAKE) tree-clean $(NPD)
	@$(call CLEANUP,$(NAME),database directory,$(DATABASE_DIR))

re: down build-no-cache up ## Restart all services
	@$(OPEN) http://localhost

.PHONY: clean fclean ffclean re
