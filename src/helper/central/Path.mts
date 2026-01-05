import Central from '../../Central.mjs';
import { dirname, join, relative, extname } from 'node:path';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export default class HelperPath {
  loader = new Loader();

  get fileList() { return this.loader.fileList; }
  get modules() { return this.loader.modules; }

  async init(nodePackages:Set<string>, EXE_PATH: string | null = null, APP_PATH: string | null = null, VIEW_PATH: string | null = null, modules: any[] = []): Promise<void> {
    console.log('Path Helper Init');
    nodePackages.clear();
    this.loader.fileList.clear();
    this.loader.modules = [];

    Central.EXE_PATH  = (EXE_PATH  || Central.adapter.dirname()).replace(/\/$/, '');
    Central.APP_PATH  = (APP_PATH  || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');

    // 1. Modules (Lowest Priority)
    await this.addModules(nodePackages, modules);

    // 2. Scan APP_PATH (High Priority)
    if (Central.APP_PATH) {
       this.loader.scanDir(Central.APP_PATH, Central.APP_PATH, '');
    }

    // 3. Scan VIEW_PATH (Highest Priority for views)
    if (Central.VIEW_PATH) {
       this.loader.scanDir(Central.VIEW_PATH, Central.VIEW_PATH, 'views');
    }
  }

  async reloadModuleInit(nodePackages:Set<string>): Promise<void> {
    const initFiles = [...nodePackages.keys()].map(x => `${x}/init.mjs`);

    for(let i=0; i< initFiles.length; i++){
      const file = initFiles[i];
      try{
        await Central.import(file);
      }catch(e){
        Central.log(e);
      }
    }
  }

  resolve(nodePackages:Set<string>, pathToFile: string, prefixPath: string, store: Map<string, any>, forceUpdate: boolean = false): string {
    if (/\.\./.test(pathToFile)) throw new Error('invalid require path');
    
    // Handle absolute paths
    if (pathToFile.startsWith('/')) {
        if(Central.adapter.fileExists(pathToFile)) return pathToFile;
    }

    const key = prefixPath ? `${prefixPath}/${pathToFile}` : pathToFile;
    
    if(this.loader.fileList.has(key)) {
        const path = this.loader.fileList.get(key)!;
        store.set(pathToFile, path); 
        return path;
    }

    if( store.get(pathToFile) && !forceUpdate ) return store.get(pathToFile);

    throw new Error(`Resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)}`);
  }

  async resolveView(viewName: string) {
    return this.loader.resolveView(viewName);
  }

  async addModules(nodePackages:Set<string>, modules: any[]): Promise<void> {
    for (let i = 0; i < modules.length; i++) {
        const it = modules[i];
        if(!it){
          Central.log(`Module ${i} is not defined.`);
          continue;
        }
        const filename = it.filename || it.default?.filename;
        if(!filename){
          Central.log(`Module ${i} does not have filename property`);
          continue;
        }
        
        this.loader.addModule(it);

        const dir = Central.adapter.dirname(filename);
        nodePackages.add(dir);
    }
  }
}

class Loader {
  modules: any[] = [];
  fileList = new Map<string, string>();

  constructor() {

  }

  async resolveView(viewName: string) {
    return this.fileList.get(`view/${viewName}`);
  }

  async resolve(moduleName: string) {
    const path = this.fileList.get(moduleName);
    return await import(path!);
  }

  addModule(module: any) {
    let path;
    if (module.filename) {
      path = dirname(fileURLToPath(module.filename));
    }
    this.modules.push({
      ...module,
      path
    });

    if (path) {
      this.scanDir(path, path);
    }
  }

  scanDir(basePath: string, currentPath: string, prefix: string = '') {
    try {
      const files = readdirSync(currentPath);
      for (const file of files) {
        const fullPath = join(currentPath, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          this.scanDir(basePath, fullPath, prefix);
        } else {
          if (file.startsWith('.') || file.startsWith('index.')) continue;
          const ext = extname(file);
          const relativePath = relative(basePath, fullPath);
          const normalizedPath = relativePath.split('\\').join('/');
          
          let key = normalizedPath.slice(0, -ext.length);
          if(prefix) key = `${prefix}/${key}`;
          this.fileList.set(key, fullPath);

          let keyWithExt = normalizedPath;
          if(prefix) keyWithExt = `${prefix}/${keyWithExt}`;
          this.fileList.set(keyWithExt, fullPath);
        }
      }
    } catch (e) {
      // Directory might not exist, ignore
    }
  }

  addModules(modules: any[]) {
    modules.forEach(m => this.addModule(m));
  }
}