import Node from './Node.mjs';
import path from 'node:path';
import fs from 'node:fs';
import Central from '../../Central.mjs';
export default class Bun extends Node {
    constructor() {
        super();
    }
    async registerControllers(controllerDir) {
        const controllerExtensions = ['.mjs', '.mts', '.ts', '.js'];
        const registerController = async (filePath) => {
            const mod = await import(filePath);
            const controllerName = path.relative(controllerDir, filePath)
                .slice(0, -path.extname(filePath).length)
                .split(path.sep)
                .join('/');
            Central.controllerFiles.set(`controller/${controllerName}`, mod.default);
        };
        const walkControllers = async (dirPath) => {
            for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
                const entryPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    await walkControllers(entryPath);
                    continue;
                }
                if (controllerExtensions.includes(path.extname(entry.name))) {
                    await registerController(entryPath);
                }
            }
        };
        await walkControllers(controllerDir);
    }
    async registerViews(options) {
        const viewExtensions = ['.liquid', '.json'];
        const { package: packageName, path: viewsDir } = options;
        const registerView = async (filePath) => {
            const ext = path.extname(filePath);
            let payload;
            if (ext === '.json') {
                payload = await import(filePath, { with: { type: 'json' } });
            }
            else {
                payload = await import(filePath, { with: { type: 'text' } });
            }
            const viewKey = path.relative(viewsDir, filePath)
                .slice(0, -ext.length)
                .split(path.sep)
                .join('/');
            const view = {
                package: packageName,
                payload,
            };
            Central.viewFiles.set(viewKey, view);
        };
        const walkViews = async (dirPath) => {
            for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
                const entryPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    await walkViews(entryPath);
                    continue;
                }
                if (viewExtensions.includes(path.extname(entry.name))) {
                    await registerView(entryPath);
                }
            }
        };
        await walkViews(viewsDir);
    }
    resolveFetchList(x, store, pathToFile) {
        return super.resolveFetchList(x, store, pathToFile);
    }
    fileExists(pathToFile) {
        //if no extension, check for .ts, .mts, .mjs
        return super.fileExists(pathToFile + '.ts') || super.fileExists(pathToFile + '.mts') || super.fileExists(pathToFile);
    }
    dirname(file = null) {
        return super.dirname(file);
    }
    async import(pathToFile, cacheId = 0) {
        //    let path = (cacheId === 0) ? pathToFile : `${pathToFile}?cache=${cacheId}`;
        const module = await import(pathToFile);
        return module.default || module;
    }
    process() {
        return process;
    }
}
