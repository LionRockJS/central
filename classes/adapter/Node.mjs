import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import Os from "node:os";
import Noop from './Noop.mjs';
export default class Node extends Noop {
    constructor() {
        super();
    }
    resolveFetchList(x, store, pathToFile) {
        if (this.fileExists(x) !== true)
            return false;
        store.set(pathToFile, x);
        return true;
    }
    fileExists(pathToFile) {
        let pathToTest = pathToFile;
        if (path.extname(pathToFile) === '')
            pathToTest = `${pathToFile}.mjs`;
        try {
            return fs.statSync(pathToTest).isFile();
        }
        catch (e) {
            return false;
        }
    }
    dirname(file = null) {
        return path.dirname(fileURLToPath(file || import.meta.url));
    }
    async import(pathToFile, cacheId = 0) {
        let qs = `?r=${cacheId}`;
        if (cacheId === 0)
            qs = '';
        let importPath = pathToFile;
        if (Os.platform() === 'win32')
            importPath = pathToFileURL(pathToFile).href;
        const module = await import(importPath + qs);
        return module.default || module;
    }
    process() {
        return process;
    }
}
