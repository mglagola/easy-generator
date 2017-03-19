'use strict';

const handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const _mkdirp = Promise.promisifyAll(require("mkdirp"));
const path = require('path');
const isEmpty = require('lodash/isEmpty');

function resolveHome (filepath) {
    if (filepath[0] === '~') return path.join(process.env.HOME, filepath.slice(1));
    return filepath;
}

// @returns promise
function compile (filepath, data) {
    console.log('Generating', filepath);
    return fs.readFileAsync(filepath, 'utf-8')
        .then(source => handlebars.compile(source)(data))
        .catch(err => {
            console.error(err.toString());
            throw err;
        });
}

function mkdirp (path) {
    console.log('Making:', path);
    return _mkdirp.mkdirpAsync(path);
}

function mkdirpSafe (path) {
    if (isEmpty(path)) {
        return Promise.resolve(true);
    }
    return mkdirp(path);
}

function write (filePath, content) {
    const outputPath = resolveHome(filePath);
    console.log('Writing content to', outputPath);
    return fs.writeFileAsync(outputPath, content);
}

module.exports = {
    compile,
    resolveHome,
    write,
    mkdirp,
    mkdirpSafe,
};