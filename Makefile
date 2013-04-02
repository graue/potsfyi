.PHONY: all realAll clean

# The following fake "all" target silences make's
# "Nothing to be done for `all'" message.

all: realAll
	@true

realAll: static/bundle.js

TEMPLATES = $(shell find script -maxdepth 2 -name "*.hbs")
SCRIPTS = $(shell find script -maxdepth 2 -name "*.js")

static/bundle.js: $(TEMPLATES) $(SCRIPTS)
	browserify -t hbsfy script/main.js -o static/bundle.js

clean:
	rm static/bundle.js
