import Central from "../../Central.mjs";

export default class HelperPath{
  static nodePackages = new Set();

  static async init(EXE_PATH=null, APP_PATH=null, VIEW_PATH=null){
    this.nodePackages.clear();
    HelperPath.setCentralDefaultPaths(EXE_PATH, APP_PATH, VIEW_PATH);
  }

  static setCentralDefaultPaths(EXE_PATH=null, APP_PATH=null, VIEW_PATH=null, MOD_PATH=null){
    Central.EXE_PATH  = (EXE_PATH  || Central.adapter.dirname()).replace(/\/$/, '');
    Central.APP_PATH  = (APP_PATH  || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');
    Central.MOD_PATH  = (MOD_PATH  || `${Central.APP_PATH}/modules`).replace(/\/$/, '');
  }

  static resolve(pathToFile, prefixPath, store, forceUpdate = false) {
    if (/\.\./.test(pathToFile)) {
      throw new Error('invalid require path');
    }

    if (!store.get(pathToFile) || forceUpdate) {
      // search application, then modules
      const fetchList = [];
      if (prefixPath === 'views')fetchList.push(`${Central.VIEW_PATH}/${pathToFile}`);

      fetchList.push(`${Central.APP_PATH || ''}/${prefixPath}/${pathToFile}`);
      fetchList.push(pathToFile);

      // load from node_modules and modules
      [...this.nodePackages].reverse().forEach(x => fetchList.push(`${x}/${prefixPath}/${pathToFile}`));

      fetchList.some(x => {
        return Central.adapter.resolveFetchList(x, store, pathToFile);
      });

      if (!store.get(pathToFile)) {
        throw new Error(`KohanaJS resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)} `);
      }
    }

    return store.get(pathToFile);
  }

  static addNodeModules(modules){
    modules.forEach(it=>{
      if(!it)return;

      const dirname = it.dirname || it.default?.dirname;
      if(!dirname)return;
      this.nodePackages.add(dirname.replace(/[/\\]+$/, ''));
    });
  }
}