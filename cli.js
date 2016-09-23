#!/usr/bin/env node
'use strict';
var meow = require('meow');
var chalk = require('chalk');
var invoke = require('./');

var cli = meow({
  help: [
    'Usage',
    '  scribe-api-tools [--foo]',
    '',
    '',
    '--foo Prints a foo message.',
    ''
  ].join('\n')
});

var promise = null;

if (cli.flags.foo) {
  promise = invoke();
} else {
  console.error(chalk.red.bold('TODO: Not implemented.'));
}

if (promise) {
  promise.catch(function (err) {
    console.error(chalk.red.bold('Error: ' + err.message));
  });
}
