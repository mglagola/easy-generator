'use strict';

const Promise = require('bluebird');
const Path = require('path');
const flattenDeep = require('lodash/flattenDeep');
const fs = Promise.promisifyAll(require('fs'));
const {
    compile,
    mkdirpSafe,
    write,
} = require('./compile');

async function readdir (path, _basePath) {
    const basePath = _basePath || path;
    const files = await fs.readdirAsync(path);

    return Promise.all(files.map(file => {
        const filepath = Path.join(path, file);
        const shortpath = filepath.replace(basePath, '');
        const directory = path.replace(basePath, '');
        return fs.lstatAsync(filepath)
            .then(async (stats) => {
                const isDirectory = stats.isDirectory();
                const children = isDirectory ? await readdir(filepath, basePath) : [];
                return [{
                    filename: file,
                    templateFilepath: filepath,
                    shortpath,
                    directory,
                    isDirectory,
                    stats,
                }].concat(children);
            });
    }));
}

const createDir = (parentOutputDir) => ({ shortpath }) => {
    const path = Path.join(parentOutputDir, shortpath);
    return mkdirpSafe(path);
};

const createFile = (parentOutputDir, data) => ({ templateFilepath, shortpath, directory }) => {
    const dirpath = Path.join(parentOutputDir, directory);
    return mkdirpSafe(dirpath)
        .then(() => {
            return compile(templateFilepath, data).then(content => ({ content, shortpath }));
        })
        .then(({ content, shortpath }) => {
            const path = Path.join(parentOutputDir, shortpath);
            return write(path, content);
        });
};

async function gen ({ templateDir, outputDir, data, genEmptyDirs = false }) {
    const allFiles = flattenDeep(await readdir(templateDir));

    const dirs = allFiles.filter(file => file.isDirectory);
    const files = allFiles.filter(file => !file.isDirectory);

    await mkdirpSafe(outputDir);
    if (genEmptyDirs) {
        await Promise.all(dirs.map(createDir(outputDir)));
    }
    await Promise.all(files.map(createFile(outputDir, data)));

    return true;
}

module.exports = gen;
