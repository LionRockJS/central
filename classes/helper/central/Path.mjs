import Central from "../../Central.mjs";
import HelperConfig from "./Config.mjs";
import adapter from "../../adapter/Node.mjs";


export default class HelperPath{
  static nodePackages = new Set();

  static async init(EXE_PATH=null, APP_PATH=null, VIEW_PATH=null, modules=[]){
    this.nodePackages.clear();
    this.setCentralDefaultPaths(EXE_PATH, APP_PATH, VIEW_PATH);
    await this.addModules(modules);
  }

  static async reloadModuleInit() {
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

  static setCentralDefaultPaths(EXE_PATH=null, APP_PATH=null, VIEW_PATH=null){
    Central.EXE_PATH  = (EXE_PATH  || adapter.dirname()).replace(/\/$/, '');
    Central.APP_PATH  = (APP_PATH  || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');
  }

  static resolve(pathToFile, prefixPath, store, forceUpdate = false) {
    if (/\.\./.test(pathToFile)) throw new Error('invalid require path');
    if( store.get(pathToFile) && !forceUpdate )return store.get(pathToFile);

    // search application, then modules
    const fetchPaths = [];
    if (prefixPath === 'views')fetchPaths.push(`${Central.VIEW_PATH}/${pathToFile}`);

    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}`);
    fetchPaths.push(pathToFile);

    // load from node_modules and modules
    [...this.nodePackages].reverse().forEach(x => fetchPaths.push(`${x}/${prefixPath}/${pathToFile}`));

    fetchPaths.some(path => adapter.resolveFetchList(path, store, pathToFile));

    if (!store.get(pathToFile)) throw new Error(`Resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)} `);
    return store.get(pathToFile);
  }

  static async addModules(modules){
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

        const dirname = adapter.dirname(filename);
        this.nodePackages.add(dirname);

        await HelperConfig.addConfigs(dirname, it.configs || it.default?.configs || []);
      })
    );
  }
}