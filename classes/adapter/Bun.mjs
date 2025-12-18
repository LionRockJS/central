import Node from './Node.mjs';
export default class Bun extends Node {
    static resolveFetchList(x, store, pathToFile) {
        return super.resolveFetchList(x, store, pathToFile);
    }
    static fileExists(pathToFile) {
        //if no extension, check for .ts, .mts, .mjs
        return super.fileExists(pathToFile + '.ts') || super.fileExists(pathToFile + '.mts') || super.fileExists(pathToFile);
    }
    static dirname(file = null) {
        return super.dirname(file);
    }
    static async import(pathToFile, cacheId = 0) {
        const module = await import(pathToFile);
        return module.default || module;
    }
}
