NPM = npm

all: test

test: clean
	node test $(NPM)

clean:
	rm -rf subRepo/.git
	rm -rf parentRepo/.git
	rm -rf parentRepo/.gitmodules
	rm -rf parentRepo/subRepo
	rm -rf node_modules/parentRepo

.PHONY: all test clean
