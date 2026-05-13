import Central from '../../Central.mjs';
import CascadeFileLoader from '../CascadeFileLoader.mjs';

export default class HelperPath {
  constructor() {}
  modules = new Map<string, any>();

  private loader = new CascadeFileLoader({
    ignoreList: [ /^\./, /^index/, /^init/, /^readme/ ], 
    pathHandler: (path) => {
      const classesPath = Central.runtime.joinPath(path, 'classes');
      if(Central.runtime.isDirectory(classesPath)) {
        return classesPath;
      }
      return path;
    }
  });
  private viewLoader = new CascadeFileLoader({
    ignoreList: [ /^\./, /^readme/ ], 
    pathHandler: (path) => path+'/../views'
  });


  get fileList() { return this.loader.fileList; }
  get templateList() { return this.viewLoader.fileList; }

  init(EXE_PATH: string , APP_PATH: string | null = null, VIEW_PATH: string | null = null, modules: any[] = []){
    this.loader.fileList.clear();
    this.modules.clear();
    this.viewLoader.fileList.clear();

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
       this.viewLoader.scanDir(Central.VIEW_PATH);
    }

    // 4. Scan EXE_PATH/modules
    const modulesDir = Central.runtime.joinPath(Central.EXE_PATH, 'modules');
    if (Central.runtime.isDirectory(modulesDir)) {
      const dirs = Central.runtime.readDir(modulesDir);
      for (const dir of dirs) {
        if (dir.startsWith('.')) continue;
        const modulePath = Central.runtime.joinPath(modulesDir, dir);
        if (Central.runtime.isDirectory(modulePath)) {
          const initFile = Central.runtime.joinPath(modulePath, 'init.mjs');
          if(Central.runtime.fileExists(initFile)){
            this.modules.set(modulePath, {
              filename: initFile
            });
            
            const classesPath = Central.runtime.joinPath(modulePath, 'classes');
            if(Central.runtime.isDirectory(classesPath)){
              this.loader.scanDir(classesPath);
            } else {
              this.loader.scanDir(modulePath);
            }
          }
        }
      }
    }
  }

  async reloadModuleInit(): Promise<void> {
    const initFiles = [...this.modules.keys()].map(x => `${x}/init.mjs`);

    for(let i=0; i< initFiles.length; i++){
      const file = initFiles[i];
      if(!Central.runtime.fileExists(file)) continue;
      try{
        await import(file);
      }catch(e){
        Central.log(e);
      }
    }
  }

  resolve(pathToFile: string): string {
    if(pathToFile.includes('../')) throw new Error('invalid require path');
    const file = this.loader.resolve(pathToFile);

    if(!file) {
      throw new Error(`Resolve path error: path ${pathToFile} not found.`);
    }
    return file;
  }

  resolveView(viewName: string) {
    return this.viewLoader.resolve(viewName);
  }

  addModules(modules: any[]){
    this.viewLoader.addModules(modules);
    this.loader.addModules(modules);

    modules.forEach(m => {
      if(!m) return;
      const module = m.default || m;
      if(!module.filename)return;

      const dir = Central.runtime.dirname(module.filename);
      this.modules.set(dir, module);
    });
  }
}