'use strict';

var numCPUs = require('os').cpus().length;
var path    = require('path');
var spawn   = require('child_process').spawn;

var async = require('async');
var http  = require('follow-redirects').http;
var chalk = require('chalk');
var jar = require('vnu-jar');

//
// Create new Grunt multi task
//
module.exports = function gruntHtmlLintHttp(grunt) {

    grunt.registerMultiTask('htmllint-http', 'Validate html files', function() {

        var done = this.async();

        var options = this.options({
            ignore: [],
            parallelLimit: numCPUs
        });

        if (!this.data || !this.data.urls) {
            grunt.log.error('No url\'s specified!');
            return done(false);
        }

        var tasks = [];
        this.data.urls.forEach(function(url) {
            tasks.push(_getTask(grunt, done, options, url));
        });
        async.parallelLimit(tasks, options.parallelLimit, function(err, results) {
            _reportLintFreeUrls(grunt, results);
            _hasError(results) ? done(false) : done();
        });
    });
};

//
// Returns a task for linting a single url
//
function _getTask(grunt, done, options, url) {

    return function(cb) {

        http.get(url, function(response) {

            if (response.statusCode !== 200) {
                grunt.log.warn('Got response code ' + response.statusCode + ' while trying to get ' + chalk.cyan(url));
                return cb(null, false);
            }

            var vnu = _spawnVnu();

            _collectOutput(vnu, function(output) {

                try {
                    var messages = JSON.parse(output).messages;
                } catch(e) {
                    return cb(null, false);
                }

                // Filter ignored messages
                messages = messages.filter(function(msg) {
                    return !~options.ignore.indexOf(msg.message);
                });

                messages.forEach(_logLintError.bind({}, grunt, url));

                cb(null, messages.length);
            });

            vnu.on('close', function(code) {
                if (code !== 0) {
                    grunt.fail.warn('vnu.jar exited with code ' + code + '.');
                    done(false);
                }
            });

            response.pipe(vnu.stdin);

            response.on('error', function(e) {
                grunt.fail.warn(e.message);
                done(false);
            });

        }).on('error', function(e) {
            grunt.fail.warn(e.message);
            done(false);
        });
    };
}

//
// Spawn vnu.jar
//
function _spawnVnu() {
    return spawn('java', [
        '-Xss512k', // sometimes we get *a lot* of output
        '-jar',
        jar,
        '--format',
        'json',
        '-'
    ]);
}

//
// Gather stdout/stderr from a process
//
function _collectOutput(process, cb) {

    var output = '';

    process.stdout.on('data', function(chunk) {
        output += chunk;
    });
    process.stderr.on('data', function(chunk) {
        output += chunk;
    });
    process.stdout.on('end', function() {
        cb(output);
    });
}

//
// Log a linting error with awesome coloring
//
function _logLintError(grunt, url, message) {

    grunt.log.writeln(
        chalk.cyan(url) + ' ' +
        chalk.red('[') +
        chalk.yellow(message.lastLine) +
        chalk.red(':') +
        chalk.yellow(message.lastColumn) +
        chalk.red('] ') +
        message.message
    );
}

//
// Print number of url's that are lint free
//
function _reportLintFreeUrls(grunt, results) {

    var lintFree = results.filter(function(result) {
        return result === 0;
    }).length;

    if (!lintFree) return;

    grunt.log.ok(lintFree + ' url\'s lint free.');
}

//
// Returns whether an error is present in the results
//
function _hasError(results) {

    return !!results.filter(function(result) {
        return result !== 0;
    }).length;
}
