import Noop from './Noop.mjs';
export default class Worker extends Noop {
    constructor() {
        super();
    }
    resolveFetchList(x, store, pathToFile) {
        // no filesystem in CF Workers — trust the path and add to store
        store.set(pathToFile, x);
        return true;
    }
    fileExists(pathToFile) {
        // no filesystem access in CF Workers
        return false;
    }
    dirname(file = null) {
        return new URL('.', file || import.meta.url).pathname;
    }
    async import(pathToFile, cacheId = 0) {
        const module = await import(pathToFile);
        return module.default || module;
    }
    process() {
        return super.process();
    }
}
