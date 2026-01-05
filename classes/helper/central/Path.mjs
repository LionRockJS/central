import Central from '../../Central.mjs';
import { dirname, join, relative, extname } from 'node:path';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export default class HelperPath {
    loader = new Loader();
    get fileList() { return this.loader.fileList; }
    get templateList() { return this.loader.templateList; }
    get modules() { return this.loader.modules; }
    init(EXE_PATH = null, APP_PATH = null, VIEW_PATH = null, modules = []) {
        this.loader.fileList.clear();
        this.loader.modules.clear();
        this.loader.templateList.clear();
        Central.EXE_PATH = (EXE_PATH || Central.adapter.dirname()).replace(/\/$/, '');
        Central.APP_PATH = (APP_PATH || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
        Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');
        // 1. Modules (Lowest Priority)
        this.addModules(modules);
        // 2. Scan APP_PATH (High Priority)
        if (Central.APP_PATH) {
            this.loader.scanDir(Central.APP_PATH + '/classes');
        }
        // 3. Scan VIEW_PATH (Highest Priority for views)
        if (Central.VIEW_PATH) {
            this.loader.scanViewDir(Central.VIEW_PATH);
        }
    }
    async reloadModuleInit() {
        const initFiles = [...this.loader.modules.keys()].map(x => `${x}/init.mjs`);
        for (let i = 0; i < initFiles.length; i++) {
            const file = initFiles[i];
            try {
                await import(file);
            }
            catch (e) {
                Central.log(e);
            }
        }
    }
    resolve(pathToFile) {
        return this.loader.resolve(pathToFile);
    }
    async resolveView(viewName) {
        console.log(viewName);
        return null;
    }
    addModules(modules) {
        this.loader.addModules(modules);
    }
}
class Loader {
    modules = new Map();
    fileList = new Map();
    templateList = new Map();
    constructor() { }
    resolve(moduleName) {
        return this.fileList.get(moduleName);
    }
    addModule(module) {
        const m = module.default || module;
        if (!m.filename)
            return;
        const path = dirname(fileURLToPath(m.filename));
        this.modules.set(path, module);
        this.scanDir(path);
        this.scanViewDir(path + '/../views');
    }
    scanDir(basePath, currentPath = "") {
        if (!currentPath)
            currentPath = basePath;
        const files = readdirSync(currentPath);
        for (const file of files) {
            const fullPath = join(currentPath, file);
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
                this.scanDir(basePath, fullPath);
            }
            else {
                if (file.startsWith('.') || file.startsWith('index.') || file.startsWith('init.'))
                    continue;
                const ext = extname(file);
                const relativePath = relative(basePath, fullPath);
                const normalizedPath = relativePath.split('\\').join('/');
                const key = normalizedPath.slice(0, -ext.length);
                this.fileList.set(key, fullPath);
            }
        }
    }
    scanViewDir(basePath, currentPath = "") {
        if (!currentPath)
            currentPath = basePath;
        try {
            const files = readdirSync(currentPath);
            for (const file of files) {
                const fullPath = join(currentPath, file);
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    this.scanViewDir(basePath, fullPath);
                }
                else {
                    const ext = extname(file);
                    const relativePath = relative(basePath, fullPath);
                    const normalizedPath = relativePath.split('\\').join('/');
                    const key = normalizedPath.slice(0, -ext.length);
                    this.templateList.set(key, fullPath);
                }
            }
        }
        catch (e) {
        }
    }
    addModules(modules) {
        modules.forEach(m => this.addModule(m));
    }
}
