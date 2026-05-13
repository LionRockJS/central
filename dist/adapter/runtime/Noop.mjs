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
    isDirectory(pathToFile) {
        return false;
    }
    readDir(pathToFile) {
        return [];
    }
    joinPath(...parts) {
        return parts.join('/').replace(/\/+/g, '/');
    }
    relativePath(from, to) {
        // simple relative path: strip common prefix
        if (to.startsWith(from))
            return to.slice(from.length).replace(/^\//, '');
        return to;
    }
    extname(filePath) {
        const i = filePath.lastIndexOf('.');
        const j = filePath.lastIndexOf('/');
        return i > j ? filePath.slice(i) : '';
    }
    process() {
        return {
            status: 'Noop adapter - no process object available',
            cwd: () => './'
        };
    }
}
