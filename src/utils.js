const {TREE_FILTER_EXCLUDE} = require('./constants');

function getElementsExceptLast(array) {
    return array.slice(0, -1);
}

function getFolder(path) {
    return getElementsExceptLast(path.split('/')).join('/');
}

function getLastElement(array) {
    return array.slice(-1)[0];
}

function getFileName(path) {
    return getLastElement(path.split('/'));
}

function vectorLength(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}

function splitArray(array, size) {
    let stepArray = [];
    const result = [];

    for (let i=0; i<array.length; i++) {
        if (stepArray.length < size) {
            stepArray.push(array[i]);
        } else {
            result.push(stepArray);
            stepArray = [];
        }
    }

    if (stepArray.length > 0) {
        result.push(stepArray);
    }

    return result;
}

function resolvePath(folder, filePath) {
    let result = folder + '/' + filePath;
    result = result.replaceAll('//', '/');
    result = result.replaceAll('/./', '/');
    result = result.replace(/\/\.$/g, '');

    while (result.includes('..')) {
        result = result.replaceAll(/\/\w+\/\.\./g, '');
    }
    return result;
}

function resolveFolder(folder, partialFilePath) {
    return resolvePath(folder, getFolder(partialFilePath));
}

function isExcluded(path, excludeArr) {
    return excludeArr.some(type => !TREE_FILTER_EXCLUDE[type](path));
}

function isExcludedFromLoad(path) {
    return isExcluded(path, Object.keys(TREE_FILTER_EXCLUDE).filter(key => key !== 'css'));
}

function isExcludedFile(path) {
    return ['libs', '@', 'http'].every(type => TREE_FILTER_EXCLUDE[type](path));
}

// ----------------------- Async

async function sendRequest(url) {
    const response = await fetch(url);
    return response.json();
}

async function loadInSteps(promises, stepSize) {
    let arrays = [];

    if (promises.length > stepSize) {
        arrays = splitArray(promises, stepSize);
    } else {
        arrays.push(promises);
    }

    const results = [];

    for (let i=0; i<arrays.length; i++) {
        results.push(await Promise.all(arrays[i]));
    }

    return results.flat();
}

// ----------------------- DOM

function removeBlocks() {
    document.querySelectorAll('.block').forEach((el) => el.remove());
}

function insertContent(el, content) {
    if (Array.isArray(content))
        content.forEach(item => insertContent(el, item));
    else if (typeof content === 'object')
        el.appendChild(content);
    else
        el.innerHTML = content;
}

function body(content) {
    insertContent(document.body, content);
}

function createDiv(content = '', className, style) {
    const el = document.createElement('div');
    el.className = className;
    el.style = style;

    insertContent(el, content);

    return el;
}

function createBlock(content = '', style = '') {
    return createDiv(content, 'block', 'margin: 20px;background: white; padding: 8px; border-radius: 8px;height: 40px;box-shadow: 1px 1px 8px;' + style);
}

function createContainer(content) {
    return createDiv(content, 'block', 'display: flex;flex-direction: row;flex-wrap: nowrap;justify-content: center;height: 80px;margin-left: 145px;');
}

function createConnections(from, toArray) {
    const {bottom: rootBottom, left: rootLeft, width: rootWidth} = from.getBoundingClientRect();

    body(toArray.map(el => {
        const {top, left, width} = el.getBoundingClientRect();
        const rootX = rootLeft + rootWidth/2;
        const rootY = rootBottom - 8;
        const x = left + width/2;
        const length = vectorLength(x, top, rootX, rootY);
        const dx = rootX - x;
        const cos = dx / length;
        const rad = -Math.acos(cos);
        return createDiv('', 'block', `top: ${(rootY + top)/2}px;left: ${(rootX + x - length)/2}px;width: ${length + 4}px;height: 3px;transform: rotate(${rad}rad);background-color: black;position: absolute;z-index: -1;`);
    }));
}

function makeDraggable(block, dragElement) {
    if (!dragElement) dragElement = block;

    dragElement.style.cursor = 'move';
    block.style.position = 'absolute';

    dragElement.onmousedown = (e) => {
        e.preventDefault();
        // get the mouse cursor position at startup:
        let oldX = e.clientX;
        let oldY = e.clientY;

        document.addEventListener('mouseup', up);

        function up() {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        }

        // call a function whenever the cursor moves:
        document.addEventListener('mousemove', move);

        function move(e) {
            e.preventDefault();
            let x = e.clientX;
            let y = e.clientY;

            // calculate the new cursor position:
            dX = oldX - x;
            dY = oldY - y;
            oldX = e.clientX;
            oldY = e.clientY;

            // set the element's new position:
            block.style.left = (block.offsetLeft - dX) + "px";
            block.style.top = (block.offsetTop - dY) + "px";
        }
      };
}

module.exports = {
    getFolder,
    resolvePath,
    resolveFolder,
    getLastElement,
    isExcluded,
    isExcludedFromLoad,
    isExcludedFile,
    getElementsExceptLast,
    getFileName,
    vectorLength,
    sendRequest,
    loadInSteps,
    removeBlocks,
    createDiv,
    createBlock,
    makeDraggable,
    insertContent,
    body,
    createConnections,
    createContainer
}
