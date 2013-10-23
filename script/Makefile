.PHONY: all realAll clean

# The following fake "all" target silences make's
# "Nothing to be done for `all'" message.

all: realAll
	@true

realAll: ../static/bundle.js ../static/login.js

TEMPLATES = $(shell find . -maxdepth 2 -name "*.hbs")
SCRIPTS = $(shell find . -maxdepth 2 -name "*.js")

../static/bundle.js: $(TEMPLATES) $(SCRIPTS)
	browserify -t hbsfy main.js -o ../static/bundle.js

../static/login.js: login.js
	cp login.js ../static/login.js

clean:
	rm -f ../static/bundle.js ../static/login.js
