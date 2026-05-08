export default class Noop {
    resolveFetchList(x, store, pathToFile) {
        return true;
    }
    dirname(file = null) {
        return './' + (file || '');
    }
    async import(pathToFile, cacheId = 0) {
        return {};
    }
    fileExists(pathToFile) {
        return false;
    }
    process() {
        return {
            status: 'Noop adapter - no process object available',
            cwd: () => './'
        };
    }
}
