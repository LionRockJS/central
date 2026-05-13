import Node from './Node.mjs';
export default class Bun extends Node {
    constructor() {
        super();
    }
    resolveFetchList(x, store, pathToFile) {
        return super.resolveFetchList(x, store, pathToFile);
    }
    fileExists(pathToFile) {
        //if no extension, check for .ts, .mts, .mjs
        return super.fileExists(pathToFile + '.ts') || super.fileExists(pathToFile + '.mts') || super.fileExists(pathToFile);
    }
    dirname(file = null) {
        return super.dirname(file);
    }
    async import(pathToFile, cacheId = 0) {
        //    let path = (cacheId === 0) ? pathToFile : `${pathToFile}?cache=${cacheId}`;
        const module = await import(pathToFile);
        return module.default || module;
    }
    process() {
        return process;
    }
}
