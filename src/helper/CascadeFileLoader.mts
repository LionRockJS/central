import Central from '../Central.mjs';
import type Noop from '../adapter/runtime/Noop.mjs';

interface LoaderOptions {
  ignoreList?: RegExp[];
  pathHandler?: (path: string) => string;
}

export default class CascadeFileLoader {
  public fileList = new Map<string, string>();
  private ignoreList: RegExp[];
  private pathHandler?: (path: string) => string;

  constructor(options?: LoaderOptions) {
    this.ignoreList = options?.ignoreList || [];
    this.pathHandler = options?.pathHandler || ((path) => path);
  }

  private get runtime(): Noop {
    return Central.runtime;
  }

  scanDir(basePath: string, currentPath: string = "") {
    if (!currentPath) currentPath = basePath;

    try {
      const files = this.runtime.readDir(currentPath);
      for (const file of files) {
        if (this.ignoreList.some(ignore => ignore.test(file))) continue;
        const fullPath = this.runtime.joinPath(currentPath, file);
        if (this.runtime.isDirectory(fullPath)) {
          this.scanDir(basePath, fullPath);
        } else {
          const ext = this.runtime.extname(file);
          const relativePath = this.runtime.relativePath(basePath, fullPath);
          const normalizedPath = relativePath.split('\\').join('/');

          const fileKey = (ext.length > 0) ? normalizedPath.slice(0, -ext.length) : normalizedPath;
          this.fileList.set(fileKey, fullPath);
        }
      }
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        console.log(`Error scanning directory ${currentPath}:`, e);
      }
    }
  }

  resolve(moduleName: string) {
    const ext = this.runtime.extname(moduleName);
    return this.fileList.get((ext.length > 0) ? moduleName.slice(0, -ext.length) : moduleName);
  }

  addModule(module: any) {
    if(!module) return;
    const m = module.default || module;
    if (!m.filename)return;

    const path = this.runtime.dirname(m.filename);
    const targetPath = this.pathHandler ? this.pathHandler(path) : path;
    this.scanDir(targetPath);
  }

  addModules(modules: any[]) {
    modules.forEach(m => this.addModule(m));
  }
}