
# ==============================
##@ 📚 Documentation
# ==============================

# Backend
URL_FASTIFY		:= https://fastify.dev/docs/latest/
URL_SQLITE		:= https://www.sqlite.org/docs.html

# Frontend
URL_TAILWIND	:= https://tailwindcss.com/docs/installation/using-vite
URL_BABYLON		:= https://doc.babylonjs.com/

# Docker
URL_DOCKER		:= https://docs.docker.com/reference/dockerfile/
URL_COMPOSE		:= https://docs.docker.com/compose/

doc: ## Show documentation links
	@clear
	@echo "Select documentation subject:"
	@echo "\n$(ORANGE)Backend$(RESET)"
	@echo "  0. Fastify"
	@echo "  1. SQLite"
	@echo "\n$(ORANGE)Frontend$(RESET)"
	@echo "  10. Tailwind CSS"
	@echo "  11. babylon.js"
	@echo "\n$(ORANGE)Docker$(RESET)"
	@echo "  100. Dockerfile"
	@echo "  101. docker-compose"

	@read url_choice; \
	case $$url_choice in \
		0) CHOICE=$(URL_FASTIFY);; \
		1) CHOICE=$(URL_SQLITE);; \
		10) CHOICE=$(URL_TAILWIND);; \
		11) CHOICE=$(URL_BABYLON);; \
		100) CHOICE=$(URL_DOCKER);; \
		101) CHOICE=$(URL_COMPOSE);; \
		*) $(call ERROR,Invalid choice:,$$CHOICE, Exiting.); exit 1;; \
	esac; \
	$(OPEN) $$CHOICE
	@clear
	@$(call INFO,,Opening documentation...)

.PHONY: doc

# ==============================
# PDF
# ==============================

URL_GIT		:= https://github.com/SaydRomey/
URL_PDF		:= $(URL_GIT)42_ressources/blob/main/pdf/
PDF_DIR		:= tmp_pdf
PDF_NAME	:= ft_transcendence
PDF			:= $(PDF_DIR)/$(PDF_NAME).pdf

# fr) PDF=$(PDF_NAME)_fr.pdf;;
pdf: | $(PDF_DIR) ## Opens the PDF instructions
	@clear
	@echo "Choose language: (en/fr)"; \
	read lang_choice; \
	case $$lang_choice in \
		en) PDF=$(PDF_NAME)_en.pdf;; \
		fr) $(call ERROR,French version currently unavailable, defaulting to English); PDF=$(PDF_NAME)_en.pdf;; \
		*) $(call ERROR,Invalid choice, defaulting to English); PDF=$(PDF_NAME)_en.pdf;; \
	esac; \
	curl -# -L $(URL_PDF)$$PDF?raw=true -o $(PDF); \
	echo "Opening $(PDF)..."
	@$(OPEN) $(PDF) || echo "Please install a compatible PDF viewer"

$(PDF_DIR):
	@$(MKDIR) $(PDF_DIR)

pdf-clean: ## Removes PDF generated directory
	@$(call CLEANUP,$(NAME),,$(PDF_DIR),PDF files removed.,No PDF files to remove.)

.PHONY: pdf pdf-clean
