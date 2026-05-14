import Node from './Node.mjs';
import path from 'node:path';
import fs from 'node:fs';
import Central from '../../Central.mjs';

export default class Bun extends Node{
  constructor() {
    super();
  }

  async registerControllers(controllerDir){
    const controllerExtensions = ['.mjs', '.mts', '.ts', '.js'];

    const registerController = async (filePath: string): Promise<void> => {
      const mod = await import(filePath);
      const controllerName = path.relative(controllerDir, filePath)
        .slice(0, -path.extname(filePath).length)
        .split(path.sep)
        .join('/');

      Central.controllerFiles.set(
        `controller/${controllerName}`,
        mod.default
      );
    };

    const walkControllers = async (dirPath: string): Promise<void> => {
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

  async registerViews(options: { package: string; path: string }): Promise<void> {
    const viewExtensions = ['.liquid', '.json'];
    const { package: packageName, path: viewsDir } = options;

    const registerView = async (filePath: string): Promise<void> => {
      const ext = path.extname(filePath);
      let payload: any;
      if(ext === '.json') {
        payload = await import(filePath, { with: { type: 'json' } });
      }else{
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

      const [rootFolder, ...rest] = viewKey.split('/');
      if ((rootFolder === 'snippets' || rootFolder === 'sections') && rest.length > 0) {
        Central.viewFiles.set(rest.join('/'), view);
      }
    };

    const walkViews = async (dirPath: string): Promise<void> => {
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

  override resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    return super.resolveFetchList(x, store, pathToFile);
  }

  override fileExists(pathToFile: string): boolean {
    //if no extension, check for .ts, .mts, .mjs
    return super.fileExists(pathToFile + '.ts') || super.fileExists(pathToFile + '.mts') || super.fileExists(pathToFile) ;
  }

  override dirname(file: string | null = null): string {
    return super.dirname(file);
  }

  override async import(pathToFile: string, cacheId: number = 0): Promise<any> {
//    let path = (cacheId === 0) ? pathToFile : `${pathToFile}?cache=${cacheId}`;
    const module = await import(pathToFile);
    return module.default || module;
  }

  override process(): any {
    return process;
  }
}