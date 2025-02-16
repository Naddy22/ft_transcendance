
# Utility commands
MKDIR		:= mkdir -p
REMOVE		:= rm -rf
NPD			:= --no-print-directory
VOID		:= /dev/null

# System Information
OS			:= $(shell uname)
USER		:= $(shell whoami)
TIME		:= $(shell date "+%H:%M:%S")
USER		:= $(shell whoami)
ROOT_DIR	:= $(notdir $(shell pwd))
TIMESTAMP	:= $(shell date "+%Y%m%d_%H%M%S")

# Platform-specific adjustments
ifeq ($(OS), Linux)
	OPEN		:= xdg-open
	PLAY_SOUND	:= aplay
	NC_FLAG		:= -C
else ifeq ($(OS), Darwin)
	OPEN		:= open
	PLAY_SOUND	:= afplay
	NC_FLAG		:= -c
endif

# Default values if OS detection fails
OPEN		?= open
PLAY_SOUND	?= afplay
NC_FLAG		?= -c

# ==============================
# Text colors and style with ANSI
# ==============================

ESC			:= \033
RESET		:= $(ESC)[0m
BOLD		:= $(ESC)[1m
ITALIC		:= $(ESC)[3m
UNDERLINE	:= $(ESC)[4m
RED			:= $(ESC)[91m
GREEN		:= $(ESC)[32m
YELLOW		:= $(ESC)[93m
ORANGE		:= $(ESC)[38;5;208m
BLUE		:= $(ESC)[94m
PURPLE		:= $(ESC)[95m
CYAN		:= $(ESC)[96m
GRAYTALIC	:= $(ESC)[3;90m
UP			:= $(ESC)[A
ERASE_LINE	:= $(ESC)[2K

# ==============================
# Standardized Output Macros
# ==============================

# Macro: INFO
# Logs an informational message with optional additional details.
# Parameters:
# $(1): Context or section name (e.g., task name).
# $(2): Main informational message.
# $(3): Optional additional details.
# Behavior:
# Formats the message with bold and colored context,
# orange for the main message,
# and gray italics for details.
INFO	= printf "[$(BOLD)$(PURPLE)$(1)$(RESET)]\t$(2)$(RESET)$(GRAYTALIC)$(3)$(RESET)\n"

# Macro: SUCCESS
# Logs a success message.
# Parameters:
# $(1): Context or section name (e.g., task name).
# $(2): Success message.
# Behavior:
# Formats the message with bold and colored context
# and green for the success message.
SUCCESS	= echo "[$(BOLD)$(PURPLE)$(1)$(RESET)]\t$(GREEN)$(2)$(RESET)"

# Macro: WARNING
# Logs a warning message.
# Parameters:
# $(1): Context or section name (e.g., task name).
# $(2): Warning message.
# Behavior:
# Formats the message with bold and colored context
# and yellow for the warning message.
WARNING	= echo "[$(BOLD)$(PURPLE)$(1)$(RESET)]\t$(YELLOW)$(2)$(RESET)"

# Macro: ERROR
# Logs an error message and highlights it in red.
# Parameters:
# $(1): Main error context (e.g., error type or task).
# $(2): Detailed error message.
# Behavior:
# Displays the error with a red icon and message for immediate visibility.
ERROR	= echo "❌ Error: $(1)$(RED)$(2)$(RESET)"

# Macro: UPCUT
# Moves the cursor up one line and clears it,
# useful for refreshing messages in loops.
# Behavior:
# Uses ANSI escape codes to move the cursor up and clear the line.
UPCUT	= printf "$(UP)$(ERASE_LINE)"

# ==============================
# Utility Macros
# ==============================

# Macro: CLEANUP
# Parameters:
# $(1): Caller context (e.g., the project name or task name).
# $(2): Name of the cleanup task (for logging clarity).
# $(3): Files/Directories to clean.
# $(4): Optional custom success message (when cleaned).
# $(5): Optional custom warning message (when nothing to clean).
# Behavior:
# Checks if the specified files/directories exist.
# If they exist, logs an info message, removes the files, and logs a success message.
# If they do not exist, logs a warning message.
define CLEANUP
	if [ -n "$(wildcard $(3))" ]; then \
		$(REMOVE) $(3); \
		$(call SUCCESS,$(1),$(if $(strip $(4)),$(4),Removed $(2).)); \
	else \
		$(call WARNING,$(1),$(if $(strip $(5)),$(5),No $(2) to remove.)); \
	fi
endef
# Example Usage:
# $(call CLEANUP,$(NAME),object files,$(OBJ_DIR))
# $(call CLEANUP,$(NAME),test artifacts,testfile.txt received_file.txt,"All test artifacts removed.","No artifacts to clean.")

# **************************************************************************** #

# Macro: CHECK_COMMAND
# Check if a specific command is available on the system
# Parameters:
# $(1): Command name to check.
# Behavior:
# Verifies the command's availability using command -v.
# If the command is not found, displays an error message and exits with status 1.
define CHECK_COMMAND
	if ! command -v $(1) > /dev/null; then \
		$(call ERROR,Command Missing:,The required command '$(1)' is not installed.); \
		exit 1; \
	fi
endef
# Example Usage:
# $(call CHECK_COMMAND,docker)

# **************************************************************************** #

# Macro: CHECK_CONNECTION
# Check network connectivity to a specific IP and Port
# Parameters:
# $(1): IP address to check.
# $(2): Port number to check.
# Behavior:
# Uses nc -z to check connectivity to the given IP and port.
# If unreachable, an error message is displayed, and the script exits with status 1.
define CHECK_CONNECTION
	if ! nc -z $(1) $(2); then \
		$(call ERROR,Connection Error: Unable to reach $(1):$(2).\nCheck if the server is running.); \
		exit 1; \
	fi
endef
# Example Usage:
# $(call CHECK_CONNECTION,$(IRC_SERVER_IP),$(IRC_SERVER_PORT))

# **************************************************************************** #

# Macro: WAIT_FOR_CONNECTION
# Wait for a specific IP and port to become available before proceeding
# Parameters:
# $(1): IP address to wait for.
# $(2): Port number to wait for.
# Behavior:
# Continuously checks the IP and port using nc -z.
# Displays an info message every second while waiting.
# Once reachable, displays a success message.
define WAIT_FOR_CONNECTION
	while ! nc -z $(1) $(2); do \
		$(call INFO,Connection,,Waiting for $(1):$(2) to become available...); \
		sleep 1; \
		$(call UPCUT); \
	done
	@$(call SUCCESS,Connection,$(1):$(2) is now reachable!)
endef
# Example Usage:
# $(call WAIT_FOR_CONNECTION,$(IRC_SERVER_IP),$(IRC_SERVER_PORT))

# **************************************************************************** #

# Macro: CHECK_PORT
# Check if a specific port is already in use
# Parameters:
# $(1): Port number to check.
# $(2): use "print" to display port's availabilty
# Behavior:
# First attempts to use lsof to detect the port's status.
# Falls back to netstat if lsof is unavailable.
# If the port is available and "print" was used as second parameter,
# displays a message indicating port's availability
# If the port is occupied, an error message is displayed, and the script exits with status 1.
# If neither tool is available, a warning message is displayed, and the check is skipped.
define CHECK_PORT
	if command -v lsof > /dev/null; then \
		if lsof -i :$(1) | grep LISTEN > /dev/null 2>&1; then \
			$(call ERROR,Port $(1) is already in use!); \
			exit 1; \
		elif [ "$(2)" = "print" ]; then \
			$(call SUCCESS,Port $(1),Port is available.); \
		fi; \
	elif command -v netstat > /dev/null; then \
		if netstat -an | grep ":$(1) .*LISTEN" > /dev/null; then \
			$(call ERROR,Port $(1) is already in use!); \
			exit 1; \
		elif [ "$(2)" = "print" ]; then \
			$(call SUCCESS,Port $(1),Port is available.); \
		fi; \
	else \
		$(call WARNING,Port Check,Could not determine if port $(1) is in use. Skipping check.); \
	fi
endef
# Example Usage:
# $(call CHECK_PORT,$(IRC_SERVER_PORT))
# $(call CHECK_PORT,$(IRC_SERVER_PORT),print)

# **************************************************************************** #

define KILL_PROCESS_ON_PORT
	if lsof -t -i :$(1) > /dev/null 2>&1; then \
		PID=$$(lsof -t -i :$(1)); \
		$(call INFO,Port $(1),$(ORANGE)Killing process $$PID using port $(1)...); \
		kill -9 $$PID; \
		$(call SUCCESS,Port $(1),$(GREEN)Process $$PID has been killed.); \
	else \
		$(call INFO,Port $(1),$(YELLOW)No process is using port $(1).); \
	fi
endef
