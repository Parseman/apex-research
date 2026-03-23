.PHONY: up up.log down restart build preview lint install clean push deploy help

# ─── Dev ───────────────────────────────────────────────────────────────────────

up:          ## Start dev server
	npm run dev

up.log:      ## Start dev server with output logged to dev.log
	npm run dev 2>&1 | tee dev.log

down:        ## Kill dev server (port 5173)
	-npx kill-port 5173

restart: down up  ## Restart dev server

# ─── Build ─────────────────────────────────────────────────────────────────────

build:       ## Type-check + production build
	npm run build

preview:     ## Serve the production build locally
	npm run preview

# ─── Quality ───────────────────────────────────────────────────────────────────

lint:        ## Run ESLint
	npm run lint

typecheck:   ## Type-check only (no emit)
	npx tsc --noEmit

# ─── Dependencies ──────────────────────────────────────────────────────────────

install:     ## Install dependencies
	npm install

clean:       ## Remove node_modules and dist
	rm -rf node_modules dist

# ─── Git ───────────────────────────────────────────────────────────────────────

push:        ## Commit all changes and push  (usage: make push m="message")
	git add .
	git commit -m "$(m)"
	git push

# ─── Vercel ────────────────────────────────────────────────────────────────────

deploy:      ## Trigger a Vercel redeploy (empty commit)
	git commit --allow-empty -m "chore: trigger redeploy"
	git push

# ─── Help ──────────────────────────────────────────────────────────────────────

help:        ## Show this help
	@grep -E '^[a-zA-Z_.\-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
