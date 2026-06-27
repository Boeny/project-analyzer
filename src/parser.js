const fs = require('fs');
const _path = require('path');
const {getLastElement, isExcluded} = require('./utils');

function scanDir(dirName) {
    try {
        return fs.readdirSync(dirName, {withFileTypes: true})
            .map(f => ({...f, isFile: f.isFile()}));
    } catch (e) {
        return e.message;
    }
}

function readFile(path) {
    try {
        return fs.readFileSync(path, 'utf-8');
    } catch (e) {
        return e.message;
    }
}

function parseImportSources(rows) {
    let startBracketIndex = null;

    const sourceFiles = rows.map((row, i) => {
        if (startBracketIndex !== null) { // multiple lines import
            if (row.includes('}')) {
                startBracketIndex = null;
                return getLastElement(row.split('}')[1].split(' ')).replace(/[;'"]/g, '');
            }
            return null;
        }
        if (!row.includes('import ')) {
            return null;
        }
        if (row.match(/\/\*(.)*(\n)*(.)*\*\//g)) { // commented
            return null;
        }

        const source = getLastElement(row.split(' ')).replace(/[;'"]/g, '');
        if (source.includes('{')) {
            startBracketIndex = i;
            return null;
        }
        if (source.includes(',')) {
            startBracketIndex = i;
            return null;
        }

        return source;
    });

    return sourceFiles.flat().filter(Boolean);
}

const EXT = ['js', 'jsx', 'ts', 'tsx', 'css', 'json', 'svg', 'png', 'jpg'];
const EXT_ERROR = `no such file with extensions .${EXT.join(', .')}`;

function checkFileExtentions(fileName, dir) {
    for (let i = 0; i < EXT.length; i++) {
        let tree = parseFile(fileName + '.' + EXT[i], dir);

        if (tree !== 'no such file') {
            return tree;
        }
    }
    if (!fileName.match(/index$/g)) {
        tree = checkFileExtentions('index', _path.resolve(dir, fileName));

        if (tree !== 'no such file' && tree !== EXT_ERROR) {
            tree.imports = tree.imports.map(t => isExcluded(t, ['libs', '@', 'http']) ? t : './' + fileName + '/' + t);
            console.log(fileName, tree.imports);
            return tree;
        }
    }

    console.log(fileName, EXT_ERROR);
    return EXT_ERROR;
}

function parseFile(fileName, dir) {
    // if no file extention
    if (!fileName.includes('.') || EXT.every(ext => !fileName.includes(ext))) {
        return checkFileExtentions(fileName, dir);
    }

    let content;
    fileName = _path.resolve(dir, fileName);

    try {
        content = fs.readFileSync(fileName, 'utf-8');
    }
    catch(e) {
        console.error(`no such file ${fileName}`);
        return 'no such file';
    }

    try {
        const rows = content.split('\n').map(row => row.trim());

        return {root: fileName, imports: parseImportSources(rows)};
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
}

function deleteFiles(dir, files) {
    let msg = '';

    files.forEach(file => {
        fs.unlinkSync(dir + '/' + file);
    });

    const objects = scanDir(dir);

    if (objects.length === 0) {
        fs.rmdirSync(dir);
        msg = `folder ${dir} was deleted and `;
    }

    return {result: msg + `${files.length} ${files.length === 1 ? 'file was' : 'files were'} deleted`};
}

module.exports = {scanDir, parseFile, readFile, deleteFiles}
