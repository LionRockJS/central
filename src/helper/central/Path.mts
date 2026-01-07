import Central from '../../Central.mjs';
import { dirname, join, relative, extname } from 'node:path';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import CascadeFileLoader from '../CascadeFileLoader.mjs';

export default class HelperPath {
  modules = new Map<string, any>();

  private loader = new CascadeFileLoader();
  private viewLoader = new CascadeFileLoader({
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
                this.modules.set(modulePath, {
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
    const initFiles = [...this.modules.keys()].map(x => `${x}/init.mjs`);

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

    modules.forEach(m => {
       if(!m) return;
       const module = m.default || m;
       if(!module.filename)return;

       try{
          const dir = dirname(fileURLToPath(module.filename));

          this.modules.set(dir, {
            filename: module.filename
          });

          // For classes loader: prefer 'classes' subdirectory
          const classesPath = join(dir, 'classes');
          let target = dir;
          try {
              if(statSync(classesPath).isDirectory()) {
                target = classesPath;
              }
          } catch(e){}
          this.loader.scanDir(target);
        }catch(e){}
      }
    );
  }
}