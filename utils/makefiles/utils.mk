
# Utility commands
MKDIR		:= mkdir -p
REMOVE		:= rm -rf
NPD			:= --no-print-directory
VOID		:= /dev/null

# System Information
OS			:= $(shell uname)
USER		:= $(shell whoami)
ROOT_DIR	:= $(notdir $(shell pwd))
TIME		:= $(shell date "+%H:%M:%S")
DATE		:= $(shell date "+%d/%m/%y")
TIMESTAMP	:= $(shell date "+%Y%m%d_%H%M%S")

# Redirection variables
STDOUT_NULL		:= > /dev/null
STDERR_STDOUT	:= 2>&1
IN_BACKGROUND	:= &

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
# 
# Parameters:
# $(1): Context or section name (e.g., task name).
# $(2): Main informational message.
# $(3): Optional additional details.
# 
# Behavior:
# Formats the message with bold and colored context,
# orange for the main message,
# and gray italics for details.
INFO	= printf "[$(BOLD)$(PURPLE)$(1)$(RESET)]\t$(2)$(RESET)$(GRAYTALIC)$(3)$(RESET)\n"

# Macro: SUCCESS
# Logs a success message.
# 
# Parameters:
# $(1): Context or section name (e.g., task name).
# $(2): Success message.
# 
# Behavior:
# Formats the message with bold and colored context
# and green for the success message.
SUCCESS	= echo "[$(BOLD)$(PURPLE)$(1)$(RESET)]\t$(GREEN)$(2)$(RESET)"

# Macro: WARNING
# Logs a warning message.
# 
# Parameters:
# $(1): Context or section name (e.g., task name).
# $(2): Warning message.
# 
# Behavior:
# Formats the message with bold and colored context
# and yellow for the warning message.
WARNING	= echo "[$(BOLD)$(PURPLE)$(1)$(RESET)]\t$(YELLOW)$(2)$(RESET)"

# Macro: ERROR
# Logs an error message and highlights it in red.
# 
# Parameters:
# $(1): Main error context (e.g., error type or task).
# $(2): Detailed error message.
# 
# Behavior:
# Displays the error with a red icon and message for immediate visibility.
ERROR	= echo "❌ Error: $(1)$(RED)$(2)$(RESET)"

# Macro: UPCUT
# Moves the cursor up one line and clears it,
# useful for refreshing messages in loops.
# 
# Behavior:
# Uses ANSI escape codes to move the cursor up and clear the line.
UPCUT	= printf "$(UP)$(ERASE_LINE)"

# ==============================
# Utility Macros
# ==============================

# Macro: CLEANUP
# 
# Parameters:
# $(1): Caller context (e.g., the project name or task name).
# $(2): Name of the cleanup task (for logging clarity).
# $(3): Files/Directories to clean.
# $(4): Optional custom success message (when cleaned).
# $(5): Optional custom warning message (when nothing to clean).
# 
# Behavior:
# Checks if the specified files/directories exist.
# If they exist, logs an info message, removes the files, and logs a success message.
# If they do not exist, logs a warning message.
# 
# Example Usage:
# $(call CLEANUP,$(NAME),object files,$(OBJ_DIR))
# $(call CLEANUP,$(NAME),test artifacts,testfile.txt received_file.txt,"All test artifacts removed.","No artifacts to clean.")
# 
define CLEANUP
	if [ -n "$(wildcard $(3))" ]; then \
		$(REMOVE) $(3); \
		$(call SUCCESS,$(1),$(if $(strip $(4)),$(4),Removed $(2).)); \
	else \
		$(call WARNING,$(1),$(if $(strip $(5)),$(5),No $(2) to remove.)); \
	fi
endef

# **************************************************************************** #

# Macro: IS_COMMAND_AVAILABLE
# Checks whether a given command is available on the system.
#
# Parameters:
# $(1): Command name to check.
#
# Behavior:
# - Returns `0` (true) if the command exists.
# - Returns `1` (false) if the command is missing.
#
# Example Usage:
# if $(call IS_COMMAND_AVAILABLE,lsof); then echo "lsof is installed!"; fi
#
define IS_COMMAND_AVAILABLE
	command -v $(1) > /dev/null 2>&1
endef

# **************************************************************************** #

# Macro: CHECK_COMMAND
# Checks if a specific command is available on the system.
# If the command is missing, it prints an **error** and exits with status `1`.
# 
# Parameters:
# $(1): Command name to check.
# 
# Behavior:
# - Uses `IS_COMMAND_AVAILABLE` to verify the command.
# - If missing, prints an **error message** and exits with **status `1`**.
# 
# Example Usage:
# $(call CHECK_COMMAND,docker)
# 
define CHECK_COMMAND
	if ! $(call IS_COMMAND_AVAILABLE,$(1)); then \
		$(call ERROR,Command Missing:,The required command '$(1)' is not installed.); \
		exit 1; \
	fi
endef

# **************************************************************************** #

# Macro: CHECK_CONNECTION
# Checks network connectivity to a specific IP and Port
# 
# Parameters:
# $(1): IP address to check.
# $(2): Port number to check.
# 
# Behavior:
# Uses nc -z to check connectivity to the given IP and port.
# If unreachable, an error message is displayed, and the script exits with status 1.
# 
# Example Usage:
# $(call CHECK_CONNECTION,$(IRC_SERVER_IP),$(IRC_SERVER_PORT))
# 
define CHECK_CONNECTION
	if ! nc -z $(1) $(2); then \
		$(call ERROR,Connection Error: Unable to reach $(1):$(2).\nCheck if the server is running.); \
		exit 1; \
	fi
endef

# **************************************************************************** #

# Macro: WAIT_FOR_CONNECTION
# Waits for a specific IP and port to become available before proceeding
# 
# Parameters:
# $(1): IP address to wait for.
# $(2): Port number to wait for.
# 
# Behavior:
# Continuously checks the IP and port using nc -z.
# Displays an info message every second while waiting.
# Once reachable, displays a success message.
# 
# Example Usage:
# $(call WAIT_FOR_CONNECTION,$(IRC_SERVER_IP),$(IRC_SERVER_PORT))
# 
define WAIT_FOR_CONNECTION
	while ! nc -z $(1) $(2); do \
		$(call INFO,Connection,,Waiting for $(1):$(2) to become available...); \
		sleep 1; \
		$(call UPCUT); \
	done
	@$(call SUCCESS,Connection,$(1):$(2) is now reachable!)
endef

# **************************************************************************** #

# Macro: IS_PORT_IN_USE
# Checks whether a specific port is currently in use.
#
# Parameters:
# $(1): Port number to check.
#
# Behavior:
# - If `lsof` exists, checks for processes using the port.
# - Otherwise, if `netstat` exists, checks for active listeners on the port.
# - If neither tool exists, it prints a **warning** and returns **2**.
#
# Exit Codes:
# - `0` → Port is **in use**.
# - `1` → Port is **free**.
# - `2` → Port check **could not be performed**.
#
# Example Usage:
# if $(call IS_PORT_IN_USE,$(BACKEND_PORT)); then echo "Port is occupied!"; fi
#
define IS_PORT_IN_USE
	if $(call IS_COMMAND_AVAILABLE,lsof); then \
		lsof -t -i :$(1) > /dev/null 2>&1; \
	elif $(call IS_COMMAND_AVAILABLE,netstat); then \
		netstat -an | grep -q ":$(1) .*LISTEN"; \
	else \
		$(call WARNING,Port Check,Neither 'lsof' nor 'netstat' is available. Skipping check.); \
		exit 2; \
	fi
endef

# **************************************************************************** #

# Macro: CHECK_PORT
# Checks if a specific port is in use and optionally prints a message.
#
# Parameters:
# $(1): Port number to check.
# $(2): (Optional) Use `"print"` to display port availability.
#
# Behavior:
# - Calls `IS_PORT_IN_USE` to check if the port is occupied.
# - If the port is in use, prints an **error message** and exits (`1`).
# - If the port is free and `"print"` is passed, prints a **success message**.
# - If neither `lsof` nor `netstat` is available, prints a **warning** and exits (`2`).
#
# Example Usage:
# $(call CHECK_PORT,$(BACKEND_PORT))          # Exits if port is in use.
# $(call CHECK_PORT,$(BACKEND_PORT),print)    # Prints availability if port is free.
#
define CHECK_PORT
	IS_USED=$$( $(call IS_PORT_IN_USE,$(1)) ); \
	if [ "$$IS_USED" -eq 0 ]; then \
		$(call ERROR,Port $(1) is already in use!); \
		exit 1; \
	elif [ "$$IS_USED" -eq 2 ]; then \
		$(call WARNING,Port $(1),Could not determine if the port is in use. Skipping check.); \
		exit 2; \
	elif [ "$(2)" = "print" ]; then \
		$(call SUCCESS,Port $(1),Port is available.); \
	fi
endef

# **************************************************************************** #

# Macro: KILL_PROCESS_ON_PORT
# Terminates all processes using a specific port.
# 
# Parameters:
# $(1): Port number to use for the kill signal
# $(2): (Optional) Use "print" to display killed process IDs.
#
# Behavior:
# - Checks if any processes are using the given port using `lsof`.
# - If found, terminates them using `kill -9`.
# - If "print" is passed as the second parameter:
#   - Lists all process IDs before terminating them.
# - Provides success and error messages for clarity.
# 
# Example Usage:
# $(call KILL_PROCESS_ON_PORT,$(BACKEND_PORT))        # Kills but doesn't print PIDs.
# $(call KILL_PROCESS_ON_PORT,$(BACKEND_PORT),print)  # Kills and prints all PIDs first.
# 
define KILL_PROCESS_ON_PORT
	PIDS=$$(lsof -t -i :$(1)); \
	if [ -n "$$PIDS" ]; then \
		$(call INFO,Port $(1),Killing process(es) using port $(1):); \
		if [ "$(2)" = "print" ]; then \
			for PID in $$PIDS; do \
				echo "\t\t$(ORANGE)$$PID$(RESET)"; \
			done; \
		fi; \
		kill -9 $$PIDS; \
		$(call SUCCESS,Port $(1),All processes on port $(1) have been killed.); \
	else \
		$(call WARNING,Port $(1),No process is using port $(1).); \
	fi
endef
# $(call INFO,Port $(1),- Process $(ORANGE)$$PID$(RESET)); \
