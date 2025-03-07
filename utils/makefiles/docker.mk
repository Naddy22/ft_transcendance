
# # When lagging **
# sudo pkill -9 node
# docker stop $(docker ps -aq)
# docker system prune -af --volumes

# docker volume rm ft_transcendence_sqlite_data
# docker logs ft_transcendence-back-1 --tail 50

# ==============================
# 🐳 Docker Helper Makefile
# ==============================

# Configurable Project Variables
PROJECT_NAME         := ft_transcendence
BACKEND_CONTAINER    := $(PROJECT_NAME)-backend-1
FRONTEND_CONTAINER   := $(PROJECT_NAME)-frontend-1
DATABASE_CONTAINER   := $(PROJECT_NAME)-database-1

# Docker Compose Files
COMPOSE_FILE		:= docker-compose.yml
DOCKER_COMPOSE		:= docker-compose -f $(COMPOSE_FILE)

# Docker Commands
DOCKER_CLEAN		:= $(DOCKER_COMPOSE) down --volumes --remove-orphans
DOCKER_PRUNE		:= docker system prune -a -f

# ==============================
##@ 🐳  Docker Build & Run
# ==============================

build: ## Build all containers
	$(DOCKER_COMPOSE) build

build-no-cache: ## Build all containers without cache
	$(DOCKER_COMPOSE) build --no-cache

up: ## Start containers in detached mode
	$(DOCKER_COMPOSE) up -d

down: ## Stop and remove containers
	$(DOCKER_COMPOSE) down
#	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans

restart: ## Restart all services
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up -d --build

logs: ## Show logs for all services
	$(DOCKER_COMPOSE) logs -f

.PHONY: build build-no-cache up down restart logs

# ==============================
##@ 🛠️  Container Management
# ==============================

exec-back: ## Access backend container shell
	docker exec -it $(BACKEND_CONTAINER) sh

exec-front: ## Access frontend container shell
	docker exec -it $(FRONTEND_CONTAINER) sh

exec-db: ## Access database container shell
	docker exec -it $(DATABASE_CONTAINER) sh

restart-back: ## Restart backend container
	docker restart $(BACKEND_CONTAINER)

restart-front: ## Restart frontend container
	docker restart $(FRONTEND_CONTAINER)

restart-db: ## Restart database container
	docker restart $(DATABASE_CONTAINER)

stop-all: ## Stop all running containers
	docker stop $$(docker ps -q)

.PHONY: exec-back exec-front exec-db restart-back restart-front restart-db stop-all

# ==============================
##@ 📜 Logs & Debugging
# ==============================

logs-back: ## Show logs for backend
	docker logs $(BACKEND_CONTAINER)

logs-back-short: ## Show last 50 lines of backend logs
	docker logs --tail 50 $(BACKEND_CONTAINER)

logs-front: ## Show logs for frontend
	docker logs $(FRONTEND_CONTAINER)

logs-db: ## Show logs for database
	docker logs $(DATABASE_CONTAINER)

.PHONY: logs-back logs-back-short logs-front logs-db

# ==============================
##@ 🔍 Troubleshooting & Cleanup
# ==============================

docker-cleanup: ## Remove unused Docker data
	@$(call INFO,Docker,Cleaning up Docker data)
	@$(DOCKER_CLEAN)
	@$(DOCKER_PRUNE)

kill-node: ## Kill all Node.js processes
	pkill -9 node || true

check-port: ## Check if a port is in use
	@$(call CHECK_PORT,$(PORT))

kill-port: ## Kill process on a specific port
	@$(call KILL_PROCESS_ON_PORT,$(PORT))

.PHONY: docker-cleanup kill-node check-port kill-port

# ==============================
# Docker Related Utility Macros
# ==============================

# Macro: PULL_IMAGE
# Pulls an image from the Docker registry
# Parameters:
# $(1): Docker image name.
# Behavior:
# Checks the local Docker image list using docker images.
# If not found, pulls the image using docker pull.
# Displays success messages based on the image's availability.
define PULL_IMAGE
	if ! docker images | grep -q "$(1)"; then \
		$(call INFO,Docker,,Pulling image '$(1)'...); \
		docker pull $(1); \
	else \
		$(call SUCCESS,Docker,Image '$(1)' is already available.); \
	fi
endef
# Example Usage:
# $(call PULL_IMAGE,$(WEECHAT_IMAGE))

# **************************************************************************** #

# Macro: CHECK_CONTAINER_EXISTS
# Checks if a Docker container exists (running or stopped)
# Parameters:
# $(1): Docker container name.
# Behavior:
# Uses docker ps -a to look for the container by name.
# Sets the shell variable CONTAINER_EXISTS to true if found, otherwise false.
define CHECK_CONTAINER_EXISTS
	if docker ps -a --format '{{.Names}}' | grep -q "^$(1)$$"; then \
		CONTAINER_EXISTS=true; \
	else \
		CONTAINER_EXISTS=false; \
	fi
endef
# Example Usage:
# $(call CHECK_CONTAINER_EXISTS,$(WEECHAT_CONT))
# if [ "$(CONTAINER_EXISTS)" = "true" ]; then \
	$(call STOP_CONTAINER,$(WEECHAT_CONT))

# **************************************************************************** #

# Macro: CHECK_CONTAINER_IS_RUNNING
# Checks if a Docker container is running
# Parameters:
# $(1): Docker container name.
# Behavior:
# Uses docker ps to look for the container by name.
# Sets the shell variable CONTAINER_RUNNING to true if found, otherwise false.
# ** Does not inform if the container exists **
define CHECK_CONTAINER_IS_RUNNING
	if docker ps --format '{{.Names}}' | grep -q "^$(1)$$"; then \
		CONTAINER_RUNNING=true; \
	else \
		CONTAINER_RUNNING=false; \
	fi
endef
# Example Usage:
# $(call CHECK_CONTAINER_IS_RUNNING,$(WEECHAT_CONT))
# if [ "$(CONTAINER_RUNNING)" = "true" ]; then \
	$(call REMOVE_CONTAINER,$(WEECHAT_CONT))

# **************************************************************************** #

# Macro: STOP_CONTAINER
# Stop a running Docker container
# Parameters:
# $(1): Docker container name.
# Behavior:
# Checks if the container is currently running.
# If running, stops the container and displays a success message.
define STOP_CONTAINER
	$(call CHECK_CONTAINER_IS_RUNNING,$(1)); \
	if [ "$(CONTAINER_RUNNING)" = "true" ]; then \
		$(call INFO,Docker,,Stopping container '$(1)'...); \
		docker stop $(1) > /dev/null; \
		$(call SUCCESS,Docker,Container '$(1)' was stopped.); \
	fi
endef
# Example Usage:
# $(call STOP_CONTAINER,$(WEECHAT_CONT))

# **************************************************************************** #

# Macro: REMOVE_CONTAINER
# Removes a Docker container
# Parameters:
# $(1): Docker container name.
# Behavior:
# Checks if the container exists.
# If the container exists, removes it using docker rm -f.
# Displays a success message upon completion.
define REMOVE_CONTAINER
	$(call CHECK_CONTAINER_EXISTS,$(1)); \
	if [ "$(CONTAINER_EXISTS)" = "true" ]; then \
		$(call INFO,Docker,,Removing container '$(1)'...); \
		docker stop $(1) > /dev/null || true; \
		docker rm -f $(1) > /dev/null; \
		$(call SUCCESS,Docker,Container '$(1)' was stopped and removed.); \
	fi
endef
# Example Usage:
# $(call REMOVE_CONTAINER,$(WEECHAT_CONT))

# **************************************************************************** #

# MACRO: REMOVE_MULTIPLE_CONTAINERS
# Removes multiple Docker containers
# Parameters:
# $(1): Docker container name(s)
# Behavior:
# Calls 'REMOVE_CONTAINER' macro on container(s)
define REMOVE_MULTIPLE_CONTAINERS
	for cont in $(1); do \
		$(call REMOVE_CONTAINER,$$cont); \
	done
endef
# Example Usage:
# $(call REMOVE_MULTIPLE_CONTAINERS,"container1 container2 container3")

# **************************************************************************** #

# MACRO: RESTART_CONTAINER
# Restarts a Docker container
# Parameters:
# $(1): Docker container name(s)
# Behavior:
# Checks if the container exists.
# If it exists, restarts the container using docker restart
define RESTART_CONTAINER
	$(call CHECK_CONTAINER_EXISTS,$(1)); \
	if [ "$(CONTAINER_EXISTS)" = "true" ]; then \
		$(call INFO,Docker,,Restarting container '$(1)'...); \
		docker restart $(1) > /dev/null; \
		$(call SUCCESS,Docker,Container '$(1)' restarted.); \
	fi
endef
# Example Usage:
# $(call RESTART_CONTAINER,$(WEECHAT_CONT))

# **************************************************************************** #

# MACRO: MANAGE_CONTAINER
# Applies specified action to Docker container
# Parameters:
# $(1): Name of the Docker container
# $(2): Action: "stop", "remove" or "restart"
# Behavior:
# Checks if the container exists and is running.
# Calls appropriate macro on the container
define MANAGE_CONTAINER
	$(call CHECK_CONTAINER_EXISTS,$(1)); \
	$(call CHECK_CONTAINER_IS_RUNNING,$(1)); \
	if [ "$(CONTAINER_EXISTS)" = "true" ]; then \
		if [ "$(2)" = "stop" ]; then \
			if [ "$(CONTAINER_RUNNING)" = "true" ]; then \
				$(call STOP_CONTAINER,$(1)); \
			else \
				$(call WARNING,Docker,Container '$(1)' is not running. Skipping stop.); \
			fi; \
		elif [ "$(2)" = "remove" ]; then \
			$(call REMOVE_CONTAINER,$(1)); \
		elif [ "$(2)" = "restart" ]; then \
			$(call RESTART_CONTAINER,$(1)); \
		else \
			$(call ERROR,Docker,Invalid action '$(2)'. Supported actions: stop, remove, restart.); \
			exit 1; \
		fi; \
	else \
		$(call INFO,Docker,No action taken. Container '$(1)' does not exist.); \
	fi
endef
# Example Usage:
# $(call MANAGE_CONTAINER,$(WEECHAT_CONT),stop)

# **************************************************************************** #

# MACRO: START_DOCKER
# Start Docker if it's not running
# Parameters:
# $(1): Name of the operating system
# Behavior:
# Checks if Docker is already running.
# If not, if the OS is macOS, opens Docker in background,
# then waits for it to be ready.
# If the OS is not macOS, informs user to start Docker manually
define START_DOCKER
	if ! docker info > /dev/null 2>&1; then \
		if [ "$(1)" = "Darwin" ]; then \
			$(call INFO,Docker,,Starting Docker on macOS...); \
			open --background -a Docker; \
			while ! docker info > /dev/null 2>&1; do \
				$(call INFO,Docker,,Waiting for Docker to be ready...); \
				sleep 1; \
				$(call UPCUT); \
			done; \
		else \
			$(call WARNING,Docker,Please start Docker manually on your system.); \
			exit 1; \
		fi; \
	fi
endef
# Example Usage:
# $(call START_DOCKER,$(shell uname))

# **************************************************************************** #
