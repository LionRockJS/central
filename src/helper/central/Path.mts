import Central from '../../Central.mjs';
import { dirname, join, relative, extname } from 'node:path';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

export default class HelperPath {
  loader = new Loader();

  get fileList() { return this.loader.fileList; }
  get templateList() { return this.loader.templateList; }
  get modules() { return this.loader.modules; }

  init(EXE_PATH: string , APP_PATH: string | null = null, VIEW_PATH: string | null = null, modules: any[] = []){
    this.loader.fileList.clear();
    this.loader.modules.clear();
    this.loader.templateList.clear();

    Central.EXE_PATH  = EXE_PATH.replace(/\/$/, '');
    Central.APP_PATH  = (APP_PATH  || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');

    // 1. Modules (Lowest Priority)
    this.addModules(modules);

    // 2. Scan APP_PATH (High Priority)
    if (Central.APP_PATH) {
       this.loader.scanDir(Central.APP_PATH+'/classes');
    }

    // 3. Scan VIEW_PATH (Highest Priority for views)
    if (Central.VIEW_PATH) {
       this.loader.scanViewDir(Central.VIEW_PATH);
    }

    // 4. Scan EXE_PATH/modules
    try {
      const modulesDir = join(Central.EXE_PATH, 'modules');
      const stat = statSync(modulesDir);
      if (stat.isDirectory()) {
        const dirs = readdirSync(modulesDir);
        for (const dir of dirs) {
          if (dir.startsWith('.')) continue;
          const modulePath = join(modulesDir, dir);
          try {
            if (statSync(modulePath).isDirectory()) {
              const initFile = join(modulePath, 'init.mjs');
              if(statSync(initFile).isFile()){
                this.loader.modules.set(modulePath, {
                  filename: pathToFileURL(initFile).href
                });
                
                const classesPath = join(modulePath, 'classes');
                try {
                    if(statSync(classesPath).isDirectory()){
                        this.loader.scanDir(classesPath);
                    } else {
                        this.loader.scanDir(modulePath);
                    }
                } catch(e) {
                    this.loader.scanDir(modulePath);
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  async reloadModuleInit(): Promise<void> {
    const initFiles = [...this.loader.modules.keys()].map(x => `${x}/init.mjs`);

    for(let i=0; i< initFiles.length; i++){
      const file = initFiles[i];
      if(!existsSync(file)) continue;
      try{
        await import(file);
      }catch(e){
        Central.log(e);
      }
    }
  }

  resolve(pathToFile: string): string {
    if(pathToFile.includes('../')) throw new Error('invalid require path');
    let file = this.loader.resolve(pathToFile);

    if(!file && Central.APP_PATH) {
      const extensions = ['.mjs', '.js', '.mts', '.ts'];
      const pathsToCheck = [
        join(Central.APP_PATH, 'classes'),
        Central.APP_PATH
      ];

      for (const basePath of pathsToCheck) {
        for(const ext of extensions) {
          const fullPath = join(basePath, pathToFile + ext);
          try {
            if(statSync(fullPath).isFile()) {
              file = fullPath;
              break;
            }
          } catch(e) {}
        }
        if(file) break;
      }
    }

    if(!file) {
      throw new Error(`Resolve path error: path ${pathToFile} not found. prefixPath: classes , store: {} `);
    }
    return file;
  }

  resolveView(viewName: string) {
    return this.loader.templateList.get(viewName);
  }

  addModules(modules: any[]){
    this.loader.addModules(modules);
  }
}

class Loader {
  modules = new Map<string, any>();
  fileList = new Map<string, string>();
  templateList = new Map<string, string>();

  constructor() {}

  resolve(moduleName: string) {
    const res = this.fileList.get(moduleName);
    return res;
  }

  addModule(module: any) {
    if(!module) return;
    const m = module.default || module;
    if (!m.filename)return;

    const path = dirname(fileURLToPath(m.filename));
    this.modules.set(path, module);

    const classesPath = join(path, 'classes');
    try {
        if(statSync(classesPath).isDirectory()){
            this.scanDir(classesPath);
        } else {
            this.scanDir(path);
        }
    } catch(e) {
        this.scanDir(path);
    }
    this.scanViewDir(join(path, '../views'));
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
          if (file.startsWith('.') || file.startsWith('index.') || file.startsWith('init.')) continue;
          const ext = extname(file);
          const relativePath = relative(basePath, fullPath);
          const normalizedPath = relativePath.split('\\').join('/');
          const key = normalizedPath.slice(0, -ext.length);
          this.fileList.set(key, fullPath);
          this.fileList.set(normalizedPath, fullPath);
        }
      }
    } catch (e) {
      // console.log('scanDir error', basePath, e);
      // ignore
    }
  }

  scanViewDir(basePath: string, currentPath: string = "") {
    if (!currentPath) currentPath = basePath;
    
    try{
      const files = readdirSync(currentPath);
      for (const file of files) {
        const fullPath = join(currentPath, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          this.scanViewDir(basePath, fullPath);
        } else {
          const ext = extname(file);
          const relativePath = relative(basePath, fullPath);
          const normalizedPath = relativePath.split('\\').join('/');
          const key = normalizedPath.slice(0, -ext.length);
          this.templateList.set(key, fullPath);
          this.templateList.set(normalizedPath, fullPath);
        }
      }
    }catch(e){

    }
  }

  addModules(modules: any[]) {
    modules.forEach(m => this.addModule(m));
  }
}