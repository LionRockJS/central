import { fileURLToPath } from 'node:url';
import { dirname, join, relative, extname } from 'node:path';
import { readdirSync, statSync } from 'node:fs';
export default class CascadeFileLoader {
    fileList = new Map();
    ignoreList;
    pathHandler;
    constructor(options) {
        this.ignoreList = options?.ignoreList || [];
        this.pathHandler = options?.pathHandler || ((path) => path);
    }
    scanDir(basePath, currentPath = "") {
        if (!currentPath)
            currentPath = basePath;
        try {
            const files = readdirSync(currentPath);
            for (const file of files) {
                if (this.ignoreList.some(ignore => ignore.test(file)))
                    continue;
                const fullPath = join(currentPath, file);
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    this.scanDir(basePath, fullPath);
                }
                else {
                    const ext = extname(file);
                    const relativePath = relative(basePath, fullPath);
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
        const ext = extname(moduleName);
        return this.fileList.get((ext.length > 0) ? moduleName.slice(0, -ext.length) : moduleName);
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
