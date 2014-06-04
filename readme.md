# grunt-htmllint-http

[Grunt](http://gruntjs.com/) plugin for html validation, using the [vnu.jar markup checker](https://validator.github.io/).

## Getting Started
Install this grunt plugin next to your project's [gruntfile](http://gruntjs.com/getting-started) with:
`npm install grunt-htmllint-http --save-dev`

Then add this line to your project's gruntfile:

```js
grunt.loadNpmTasks('grunt-htmllint-http');
```

Then specify what url's to validate in your config:

```js
grunt.initConfig({
    'htmllint-http': {
        dist: {
            urls: [
                'http://localhost/',
                'http://localhost/articles.html',
                'http://localhost/articles/interesting-fact.html'
            ]
        }
    }
});
```

Then run it like this:

```
grunt htmllint-http
```

## Options
There are currently no options.

## License
MIT