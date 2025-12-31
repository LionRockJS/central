import Central from '../../Central.mjs';
import { join, relative, extname } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

interface FileEntry {
    path: string;
    priority: number;
}

export default class HelperPath{
  static fileList = new Map<string, FileEntry>();

  static async init(nodePackages:Set<string>, EXE_PATH: string | null = null, APP_PATH: string | null = null, VIEW_PATH: string | null = null, modules: any[] = []): Promise<void> {
    console.log('Path Helper Init');
    nodePackages.clear();
    this.fileList.clear();

    Central.EXE_PATH  = (EXE_PATH  || Central.adapter.dirname()).replace(/\/$/, '');
    Central.APP_PATH  = (APP_PATH  || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');

    // Scan VIEW_PATH (Highest Priority for views)
    if (Central.VIEW_PATH) {
       this.scanDir(Central.VIEW_PATH, Central.VIEW_PATH, 'views', Infinity);
    }

    // Scan APP_PATH (High Priority)
    if (Central.APP_PATH) {
       this.scanDir(Central.APP_PATH, Central.APP_PATH, '', Infinity);
    }

    await HelperPath.addModules(nodePackages, modules);
  }

  static scanDir(basePath: string, currentPath: string, prefix: string = '', priority: number = 0) {
    // console.log(`Scanning ${currentPath} with prefix '${prefix}' and priority ${priority}`);
    try {
      const files = readdirSync(currentPath);
      for (const file of files) {
        const fullPath = join(currentPath, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          this.scanDir(basePath, fullPath, prefix, priority);
        } else {
          if (file.startsWith('.') || file.startsWith('index.')) continue;
          const ext = extname(file);
          const relativePath = relative(basePath, fullPath);
          const normalizedPath = relativePath.split('\\').join('/');
          
          // Key without extension
          let key = normalizedPath.slice(0, -ext.length);
          if(prefix) key = `${prefix}/${key}`;
          
          this.updateFile(key, fullPath, priority);

          // Key with extension
          let keyWithExt = normalizedPath;
          if(prefix) keyWithExt = `${prefix}/${keyWithExt}`;
          this.updateFile(keyWithExt, fullPath, priority);
        }
      }
    } catch (e) {
      // Directory might not exist, ignore
      // console.log('scanDir error', e);
    }
  }

  static updateFile(key: string, path: string, priority: number) {
      // console.log(`Updating ${key} -> ${path} (priority: ${priority})`);
      const existing = this.fileList.get(key);
      if (!existing || priority > existing.priority) {
          this.fileList.set(key, { path, priority });
      }
  }

  static async reloadModuleInit(nodePackages:Set<string>): Promise<void> {
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

  static resolve(nodePackages:Set<string>, pathToFile: string, prefixPath: string, store: Map<string, any>, forceUpdate: boolean = false): string {
    if (/\.\./.test(pathToFile)) throw new Error('invalid require path');
    
    // Handle absolute paths
    if (pathToFile.startsWith('/')) {
        if(Central.adapter.fileExists(pathToFile)) return pathToFile;
    }

    const key = prefixPath ? `${prefixPath}/${pathToFile}` : pathToFile;
    
    if(this.fileList.has(key)) {
        const entry = this.fileList.get(key)!;
        store.set(pathToFile, entry.path); 
        return entry.path;
    }

    if( store.get(pathToFile) && !forceUpdate ) return store.get(pathToFile);

    throw new Error(`Resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)}`);
  }

  static async addModules(nodePackages:Set<string>, modules: any[]): Promise<void> {
    let currentPriority = nodePackages.size;
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
        const dir = Central.adapter.dirname(filename);
        nodePackages.add(dir);
        
        this.scanDir(dir, dir, '', currentPriority);
        currentPriority++;
    }
  }
}