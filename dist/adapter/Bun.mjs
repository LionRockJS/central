import Node from './Node.mjs';
export default class Bun extends Node {
    static resolveFetchList(x, store, pathToFile) {
        return super.resolveFetchList(x, store, pathToFile);
    }
    static fileExists(pathToFile) {
        return super.fileExists(pathToFile);
    }
    static dirname(file = null) {
        return super.dirname(file);
    }
    static async import(pathToFile, cacheId = 0) {
        let qs = `?r=${cacheId}`;
        if (cacheId === 0)
            qs = '';
        const module = await import(pathToFile + qs);
        return module.default || module;
    }
}
