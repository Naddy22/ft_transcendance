
# ==============================
##@ 🌳 File Structure
# ==============================

# Outfile for 'tree' command
TREE_OUTFILE	:= tmp_tree.txt

# 'tree' command options (uncomment variables to activate)
TREE_IGNORES	:= -I '.git|node_modules|dist|build|docs|_local|tmp*'

# TREE_OUT		:= -n -o $(TREE_OUTFILE)
TREE_ALL		:= -a
# TREE_PERM		:= -p

TREE_OPTIONS	:= $(TREE_NO_COLORS) $(TREE_ALL) $(TREE_PERMS) $(TREE_OUT)

tree: ## Show minimal file structure (without node_modules/, dist/, etc.)
	@if $(call IS_COMMAND_AVAILABLE,tree); then \
		$(call INFO,TREE,Displaying directory and file structure...); \
		tree $(TREE_IGNORES) $(TREE_OPTIONS); \
		if [ -f $(TREE_OUTFILE) ]; then \
			$(call INFO,TREE,File structure available at $(BLUE)$(TREE_OUTFILE)); \
		fi \
	else \
		$(call WARNING,TREE,Command 'tree' not found.); \
	fi

tree-clean: ## Remove 'tree' outfile
	@$(call CLEANUP,TREE,'tree' output,$(TREE_OUTFILE))

.PHONY: tree tree-cleen

# ==============================
##@ 💾 Backup
# ==============================

BACKUP_NAME	:=$(ROOT_DIR)_$(USER)_$(TIMESTAMP).zip
BACKUP_NAME	:=$(ROOT_DIR)_$(USER)_$(TIMESTAMP).zip
MOVE_TO		:= ~/Desktop/$(BACKUP_NAME)

backup: ffclean ## Creates a zip file of the project
	@if which zip > $(VOID); then \
		zip -r --quiet $(BACKUP_NAME) ./*; \
		mv $(BACKUP_NAME) $(MOVE_TO); \
		$(call INFO,$(NAME),compressed as: ,$(CYAN)$(UNDERLINE)$(MOVE_TO)$(RESET)); \
	else \
		$(call ERROR,Please install zip to use the backup feature); \
	fi

.PHONY: backup

# ==============================
##@ 🎨 Decorations
# ==============================

define PROJECT_TITLE

 ██████╗ █████╗ ████████╗██████╗  ██████╗ ███╗   ██╗ ██████╗ 
██╔════╝██╔══██╗╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║██╔════╝ 
██║     ███████║   ██║   ██████╔╝██║   ██║██╔██╗ ██║██║  ███╗
██║     ██╔══██║   ██║   ██╔═══╝ ██║   ██║██║╚██╗██║██║   ██║
╚██████╗██║  ██║   ██║   ██║     ╚██████╔╝██║ ╚████║╚██████╔╝
 ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ 

endef
export PROJECT_TITLE

title: ## Print ft_irc's logo in ASCII art
	@echo "$(PINK)$$PROJECT_TITLE$(RESET)"
	@echo "$(PINK_HOT)Created by $(BOLD)$(TEAM)$(RESET)"
	@echo "$(PINK_LIGHT)Compiled for $(ITALIC)$(BOLD)$(PURPLE)$(USER)$(RESET)"
	@echo "$(PINK_PASTEL)$(TIME)$(RESET)\n"

.PHONY: title
