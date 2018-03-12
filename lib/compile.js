'use strict';

const handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const _mkdirp = Promise.promisifyAll(require("mkdirp"));
const path = require('path');
const os = require('os')
const isEmpty = require('lodash/isEmpty');

const resolveHome = (filepath) => filepath[0] === '~'
    ? path.join(os.homedir(), filepath.slice(1))
    : filepath;

function read (filepath, encoding) {
    return fs.readFileAsync(filepath, encoding);
}

// @returns promise
function compile (filepath, data) {
    console.log('Generating', filepath);
    return read(filepath, 'utf8')
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
    read,
    compile,
    resolveHome,
    write,
    mkdirp,
    mkdirpSafe,
};
