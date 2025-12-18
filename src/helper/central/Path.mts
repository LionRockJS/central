import Central from '../../Central.mjs';
import HelperConfig from './Config.mjs';


export default class HelperPath{
  static nodePackages: Set<string> = new Set();

  static async init(EXE_PATH: string | null = null, APP_PATH: string | null = null, VIEW_PATH: string | null = null, modules: any[] = []): Promise<void> {
    this.nodePackages.clear();
    this.setCentralDefaultPaths(EXE_PATH, APP_PATH, VIEW_PATH);
    await this.addModules(modules);
  }

  static async reloadModuleInit(): Promise<void> {
    const initFiles = [...this.nodePackages.keys()].map(x => `${x}/init.mjs`);

    for(let i=0; i< initFiles.length; i++){
      const file = initFiles[i];
      try{
        await Central.import(file);
      }catch(e){
        Central.log(e);
      }
    }
  }

  static setCentralDefaultPaths(EXE_PATH: string | null = null, APP_PATH: string | null = null, VIEW_PATH: string | null = null): void {
    Central.EXE_PATH  = (EXE_PATH  || Central.adapter.dirname()).replace(/\/$/, '');
    Central.APP_PATH  = (APP_PATH  || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');
  }

  static resolve(pathToFile: string, prefixPath: string, store: Map<string, any>, forceUpdate: boolean = false): string {
    if (/\.\./.test(pathToFile)) throw new Error('invalid require path');
    if( store.get(pathToFile) && !forceUpdate )return store.get(pathToFile);

    // search application, then modules
    const fetchPaths = [];
    if (prefixPath === 'views')fetchPaths.push(`${Central.VIEW_PATH}/${pathToFile}`);

    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}.ts`);
    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}.mjs`);
    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}.js`);
    fetchPaths.push(pathToFile);

    // load from node_modules and modules
    [...this.nodePackages].reverse().forEach(x => fetchPaths.push(`${x}/${prefixPath}/${pathToFile}`));

    fetchPaths.some(path => Central.adapter.resolveFetchList(path, store, pathToFile));

    if (!store.get(pathToFile)) throw new Error(`Resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)} `);
    return store.get(pathToFile);
  }

  static async addModules(modules: any[]): Promise<void> {
    await Promise.all(
      modules.map(async (it, idx)=>{
        if(!it){
          Central.log(`Module ${idx} is not defined.`);
          return;
        }

        const filename = it.filename || it.default?.filename;
        if(!filename){
          Central.log(`Module ${idx} does not have filename property`);
          return;
        }

        this.nodePackages.add(Central.adapter.dirname(filename));
      })
    );
  }
}