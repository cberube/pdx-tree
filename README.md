# PDX Tree

> An AngularJS tree directive for loading tree and node data on demand.

## Example

A quick example of PdxTree functionality and config is available in `example/` directory of this repository.

```
cd PdxTree/
./scripts/web-server.js
```

Navigate to <http://127.0.0.1:8000/example/index.html>

**OR** use grunt to set up the example server.

```
cd PdxTree/
grunt example
```

Navigate to <http://127.0.0.1:8981/example>

## Development

You need to have [NodeJS](http://nodejs.org), [Grunt](http://gruntjs.com), and [Bower](http://bower.io) installed.

`npm install -g grunt-cli bower`

To install the projects dependencies.

```
git clone https://github.com/cberube/PdxTree.git
cd PdxTree/
npm install
bower install
```

**Watch Task for tests**

`grunt dev`

Now change or save any `src/**/*.js` or `test/unit/**/*.js` file to see the tests run.

**Build Process**

Work with the separated files, and use `grunt concat` or `grunt concat:dist` to concatenate the files into a distributable package. The `concat` config in Gruntfile.js manages the list of files to concatenate.