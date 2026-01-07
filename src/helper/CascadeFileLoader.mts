import { fileURLToPath } from 'node:url';
import { dirname, join, relative, extname } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

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

  scanDir(basePath: string, currentPath: string = "") {
    if (!currentPath) currentPath = basePath;

    try {
      const files = readdirSync(currentPath);
      for (const file of files) {
        const fullPath = join(currentPath, file);
        const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            this.scanDir(basePath, fullPath);
          } else {
          if (this.ignoreList.some(ignore => ignore.test(file))) continue;

          const ext = extname(file);
          const relativePath = relative(basePath, fullPath);
          const normalizedPath = relativePath.split('\\').join('/');
          const key = normalizedPath.slice(0, -ext.length);
          this.fileList.set(key, fullPath);
        }
      }
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        console.log(`Error scanning directory ${currentPath}:`, e);
      }
    }
  }

  resolve(moduleName: string) {
    return this.fileList.get(moduleName);
  }

  addModule(module: any) {
    if(!module) return;
    const m = module.default || module;
    if (!m.filename)return;

    const path = dirname(fileURLToPath(m.filename));
    const targetPath = this.pathHandler ? this.pathHandler(path) : path;
    this.scanDir(targetPath);
  }

  addModules(modules: any[]) {
    modules.forEach(m => this.addModule(m));
  }
}