# KasayiMultiBusiness ERP — Makefile
# Usage : make <target>
# Targets : install, dev, build, start, migrate, seed, docker-up, docker-down

.PHONY: install dev build start lint typecheck migrate seed docker-up docker-down clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm start

lint:
	npm run lint

typecheck:
	npm run typecheck

migrate:
	npx drizzle-kit push

seed:
	bash scripts/seed.sh

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

clean:
	rm -rf .next node_modules
