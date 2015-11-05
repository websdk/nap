SHELL := /bin/bash

SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)
TST = $(wildcard test/*.js) $(wildcard test/**/*.js)
NPM = @npm install --local > /dev/null && touch node_modules

NM  = node_modules/.bin

v  ?= patch

build: node_modules $(LIB)
lib/%.js: src/%.js
	@mkdir -p $(@D)
	@$(NM)/browserify --exclude @websdk/rhumb $< --standalone $(@F:%.js=%) > $@

node_modules: package.json
	$(NPM)
node_modules/%:
	$(NPM)

test: build
	@$(NM)/tape $(TST)

.nyc_output: node_modules
	@$(NM)/nyc $(MAKE) test

coverage: .nyc_output
	@$(NM)/nyc report --reporter=text-lcov | $(NM)/coveralls

dev: node_modules
	@$(NM)/nodemon -q -x "(clear; $(NM)/nyc $(MAKE) test | $(NM)/tap-dot && $(NM)/nyc report) || true"

release: clean build test
	@npm version $(v)
	@npm publish
	@git push --follow-tags

clean:
	@rm -rf $$(cat .gitignore)

.PHONY: build test coverage dev release clean