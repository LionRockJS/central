import Central from '../../Central.mjs';

export default class HelperPath{
  static async init(nodePackages:Set<string>, EXE_PATH: string | null = null, APP_PATH: string | null = null, VIEW_PATH: string | null = null, modules: any[] = []): Promise<void> {
    nodePackages.clear();

    Central.EXE_PATH  = (EXE_PATH  || Central.adapter.dirname()).replace(/\/$/, '');
    Central.APP_PATH  = (APP_PATH  || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');

    await HelperPath.addModules(nodePackages, modules);
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
    if( store.get(pathToFile) && !forceUpdate )return store.get(pathToFile);

    // search application, then modules
    const fetchPaths = [];
    if (prefixPath === 'views')fetchPaths.push(`${Central.VIEW_PATH}/${pathToFile}`);

    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}`);
    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}.ts`);
    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}.mjs`);
    fetchPaths.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}.js`);
    fetchPaths.push(pathToFile);

    // load from node_modules and modules
    [...nodePackages].reverse().forEach(x => {
      fetchPaths.push(`${x}/${prefixPath}/${pathToFile}`)
      fetchPaths.push(`${x}/${prefixPath}/${pathToFile}.ts`)
      fetchPaths.push(`${x}/${prefixPath}/${pathToFile}.mjs`)
      fetchPaths.push(`${x}/${prefixPath}/${pathToFile}.js`)
    });

    fetchPaths.some(path => Central.adapter.resolveFetchList(path, store, pathToFile));

    if (!store.get(pathToFile)) throw new Error(`Resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)}, searched paths: \n${fetchPaths.join('\n')}`);
    return store.get(pathToFile);
  }

  static async addModules(nodePackages:Set<string>, modules: any[]): Promise<void> {
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

        nodePackages.add(Central.adapter.dirname(filename));
      })
    );
  }
}