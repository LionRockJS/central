import Noop from './Noop.mjs';
export default class Worker extends Noop {
    constructor() {
        super();
    }
    static resolveFetchList(x, store, pathToFile) {
        // no filesystem in CF Workers — trust the path and add to store
        store.set(pathToFile, x);
        return true;
    }
    static fileExists(pathToFile) {
        // no filesystem access in CF Workers
        return false;
    }
    static dirname(file = null) {
        return new URL('.', file || import.meta.url).pathname;
    }
    static async import(pathToFile, cacheId = 0) {
        // CF Workers: dynamic import only works for bundled modules; no query-string cache busting
        const module = await import(pathToFile);
        return module.default || module;
    }
    static process() {
        return {};
    }
}
