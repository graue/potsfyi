.PHONY: all realAll clean

# The following fake "all" target silences make's
# "Nothing to be done for `all'" message.

all: realAll
	@true

realAll: static/bundle.js

TEMPLATES = $(shell find script/template -name "*.hbs")
SCRIPTS = $(shell find script/lib script/app script/*.js -name "*.js")

static/bundle.js: $(TEMPLATES) $(SCRIPTS)
	browserify -t hbsfy script/main.js -o static/bundle.js

clean:
	rm static/bundle.js
