import Central from '../Central.mjs';
export default class CascadeFileLoader {
    fileList = new Map();
    ignoreList;
    pathHandler;
    constructor(options) {
        this.ignoreList = options?.ignoreList || [];
        this.pathHandler = options?.pathHandler || ((path) => path);
    }
    get runtime() {
        return Central.runtime;
    }
    scanDir(basePath, currentPath = "") {
        if (!currentPath)
            currentPath = basePath;
        try {
            const files = this.runtime.readDir(currentPath);
            for (const file of files) {
                if (this.ignoreList.some(ignore => ignore.test(file)))
                    continue;
                const fullPath = this.runtime.joinPath(currentPath, file);
                if (this.runtime.isDirectory(fullPath)) {
                    this.scanDir(basePath, fullPath);
                }
                else {
                    const ext = this.runtime.extname(file);
                    const relativePath = this.runtime.relativePath(basePath, fullPath);
                    const normalizedPath = relativePath.split('\\').join('/');
                    const fileKey = (ext.length > 0) ? normalizedPath.slice(0, -ext.length) : normalizedPath;
                    this.fileList.set(fileKey, fullPath);
                }
            }
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.log(`Error scanning directory ${currentPath}:`, e);
            }
        }
    }
    resolve(moduleName) {
        const ext = this.runtime.extname(moduleName);
        return this.fileList.get((ext.length > 0) ? moduleName.slice(0, -ext.length) : moduleName);
    }
    addModule(module) {
        if (!module)
            return;
        const m = module.default || module;
        if (!m.filename)
            return;
        const path = this.runtime.dirname(m.filename);
        const targetPath = this.pathHandler ? this.pathHandler(path) : path;
        this.scanDir(targetPath);
    }
    addModules(modules) {
        modules.forEach(m => this.addModule(m));
    }
}
