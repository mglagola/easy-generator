const Promise = require('bluebird');
const Path = require('path');
const flattenDeep = require('lodash/flattenDeep');
const last = require('lodash/last');
const fs = Promise.promisifyAll(require('fs'));
const {
    read,
    compile,
    mkdirpSafe,
    write,
} = require('./compile');

const DEFAULT_IGNORE_FILENAMES = [
    '.DS_Store',
];

const DEFAULT_SKIP_COMPILE_FILE_EXTENSIONS = [
    'hbs',
];

async function readdir (path, ignoreFilenames = [], _basePath = undefined) {
    const basePath = _basePath || path;
    const files = await fs.readdirAsync(path);

    const promises = files
        .filter(file => ignoreFilenames.indexOf(file) < 0)
        .map(file => {
            const filepath = Path.join(path, file);
            const shortpath = filepath.replace(basePath, '');
            const directory = path.replace(basePath, '');
            return fs.lstatAsync(filepath)
                .then(async (stats) => {
                    const isDirectory = stats.isDirectory();
                    const children = isDirectory ? await readdir(filepath, ignoreFilenames, basePath) : [];
                    return [{
                        filename: file,
                        templateFilepath: filepath,
                        shortpath,
                        directory,
                        isDirectory,
                        stats,
                    }].concat(children);
                });
        });

    return Promise.all(promises);
}

const createDir = (parentOutputDir) => ({ shortpath }) => {
    const path = Path.join(parentOutputDir, shortpath);
    return mkdirpSafe(path);
};

const createFile = (parentOutputDir, data, skipCompileForFileExtensions = []) => async ({ templateFilepath, filename, shortpath, directory }) => {
    const dirpath = Path.join(parentOutputDir, directory);
    await mkdirpSafe(dirpath);

    const fileExt = last(filename.split('.'));
    const shouldSkip = skipCompileForFileExtensions.indexOf(fileExt) >= 0;

    const content = shouldSkip
        ? await read(templateFilepath)
        : await compile(templateFilepath, data);
    
    const filepath = Path.join(parentOutputDir, shortpath);
    return write(filepath, content);
};

async function gen ({
    templateDir,
    outputDir,
    data,
    genEmptyDirs = true,
    ignoreFilenames = DEFAULT_IGNORE_FILENAMES,
    skipCompileForFileExtensions = DEFAULT_SKIP_COMPILE_FILE_EXTENSIONS,
}) {
    const allFiles = flattenDeep(await readdir(templateDir, ignoreFilenames));

    const dirs = allFiles.filter(file => file.isDirectory);
    const files = allFiles.filter(file => !file.isDirectory);

    await mkdirpSafe(outputDir);
    if (genEmptyDirs) {
        await Promise.all(dirs.map(createDir(outputDir)));
    }
    await Promise.all(files.map(createFile(outputDir, data, skipCompileForFileExtensions)));

    return true;
}

module.exports = gen;
