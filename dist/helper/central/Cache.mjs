export default class HelperCache {
    constructor() { }
    static cacheId = 0;
    static async init() {
        this.clearImportCache();
    }
    static clearImportCache() {
        this.cacheId++;
    }
}
