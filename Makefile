SHELL := /bin/sh

.DEFAULT_GOAL := help

.PHONY: help up down logs restart shell test build clean

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "; printf "\nUsage:\n  make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start Docker dev environment (build + run)
	docker compose up --build

down: ## Stop Docker dev environment
	docker compose down

logs: ## Tail Docker logs
	docker compose logs -f

restart: ## Restart Docker dev environment
	docker compose down
	docker compose up --build

shell: ## Open a shell in app container
	docker compose run --rm app sh

test: ## Run tests in container
	docker compose run --rm app npm test

build: ## Build app in container
	docker compose run --rm app npm run build

clean: ## Stop Docker and remove volumes
	docker compose down -v --remove-orphans
