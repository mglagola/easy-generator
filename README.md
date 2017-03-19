# Easy Generator

A simple template generator that combs through a template directory (`templateDir`) and will compile all files via `handlebars`. The files are then written to the provided output directory (`outputDir`).

## Install

```bash
npm install --save easy-generator
```

## Examples

### Production Example

* [hapi-site-gen](hapi-site-generator)

### Simple Example

```js
const gen = require('easy-generator');

const outputDir = '/Users/SOME_USER/Desktop/temp';
const templateDir = './TEMPLATE_DIR';

// `data` is passed to every file in the templateDir for handlebars compilation
const data = {
    name: 'Mark',
    nodeVersion: '7.7',
};

gen({ outputDir, templateDir, data })
    .then(() => {
        console.log('✅  Generated ✅');
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        console.error(`❌  FAILED to generate ❌`);
        process.exit(1);
    });

```

### Longer Example

```js
#! /usr/bin/env node

'use strict';

const Promise = require('bluebird');
global.Promise = Promise;

const Inquirer = require('inquirer');
const Path = require('path');
const program = require('commander');
const gen = require('easy-generator');

const Questions = [{
    type: 'input',
    name: 'name',
    message: 'What is the name of your site?',
}, {
    type: 'input',
    name: 'description',
    message: 'Site\'s description?',
}, {
    type: 'input',
    name: 'version',
    message: 'Site\'s version?',
}, {
    type: 'input',
    name: 'author',
    message: 'Site author?',
}, {
    type: 'input',
    name: 'nodeVersion',
    message: 'What node version are you using?',
    default: '7.7',
}];

const outputDir = Path.join(process.cwd(), name);
const templateDir = '/SOME/PATH/TO/TEMPLATE/DIR';

Inquirer.prompt(questions(name))
    .then(answers => {
        const data = answers;
        return gen({ templateDir, outputDir, data });
    })
    .then(() => {
        console.log('✅  Generated ✅');
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        console.error(`❌  FAILED to generate ❌`);
        process.exit(1);
    });

```
