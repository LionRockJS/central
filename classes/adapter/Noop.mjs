export default class Noop {
    static resolveFetchList(x, store, pathToFile) {
        return true;
    }
    static dirname() {
        return './';
    }
    static async import(pathToFile, cacheId = 0) {
        return {};
    }
    static fileExists(pathToFile) {
        return false;
    }
    static process() {
        return {};
    }
}
