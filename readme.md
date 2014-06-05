# grunt-htmllint-http

[Grunt](http://gruntjs.com/) plugin for html validation, using the
[vnu.jar markup checker](https://validator.github.io/).

_This is grunt plugin only accepts url's as input._ If you want to lint local files, take a look at
[grunt-html](https://github.com/jzaefferer/grunt-html).

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

### ignore
An array of messages you don't want to report as error. Example config:

```js
'htmllint-http': {
    options: {
        ignore: [
            'Bad value “X-UA-Compatible” for attribute “http-equiv” on XHTML element “meta”.',
            'Bad value “apple-mobile-web-app-title” for attribute “name” on XHTML element “meta”: Keyword “apple-mobile-web-app-title” is not registered.'
        ]
    },
    dist: {
        urls: [
            'http://localhost:1337/',
            'http://localhost:1337/articles.html'
        ]
    }
}
```

### parallelLimit
Starting vnu.jar requires quite a bit of time and resources. To prevent clogging your machine when linting a large
amount of files, a concurrency limit is in order. This defaults to the number of cores your cpu has.

```js
'htmllint-http': {
    options: {
        parallelLimit: (require('os').cpus().length * 2)
    },
    dist: {
        urls: (function() {
            return glob.sync('src/**/*.html') // A LOT of files
                .map(function(file) {
                    return file.substr(3);
                })
                .filter(function(file) {
                    return !file.substr(0, 8) === '/layout/';
                })
                .map(function(file) {
                    return 'http://localhost:' + config.server.port + file;
                });
        }())
    }
}
```

## License
MIT