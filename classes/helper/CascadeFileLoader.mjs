import { fileURLToPath } from 'node:url';
import { dirname, join, relative, extname } from 'node:path';
import { readdirSync, statSync } from 'node:fs';
export default class CascadeFileLoader {
    fileList = new Map();
    ignoreList;
    pathHandler;
    keepExtension;
    constructor(options) {
        this.ignoreList = options?.ignoreList || [];
        this.pathHandler = options?.pathHandler || ((path) => path);
        this.keepExtension = options?.keepExtension || false;
    }
    scanDir(basePath, currentPath = "") {
        if (!currentPath)
            currentPath = basePath;
        try {
            const files = readdirSync(currentPath);
            for (const file of files) {
                const fullPath = join(currentPath, file);
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    this.scanDir(basePath, fullPath);
                }
                else {
                    if (this.ignoreList.some(ignore => ignore.test(file)))
                        continue;
                    const ext = extname(file);
                    const relativePath = relative(basePath, fullPath);
                    const normalizedPath = relativePath.split('\\').join('/');
                    let key = normalizedPath;
                    if (!this.keepExtension) {
                        key = normalizedPath.slice(0, -ext.length);
                    }
                    this.fileList.set(key, fullPath);
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
        return this.fileList.get(moduleName);
    }
    addModule(module) {
        if (!module)
            return;
        const m = module.default || module;
        if (!m.filename)
            return;
        const path = dirname(fileURLToPath(m.filename));
        const targetPath = this.pathHandler ? this.pathHandler(path) : path;
        this.scanDir(targetPath);
    }
    addModules(modules) {
        modules.forEach(m => this.addModule(m));
    }
}
