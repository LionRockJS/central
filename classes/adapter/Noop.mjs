export default class Noop {
  static resolveFetchList(x, store, pathToFile){
    store.set(pathToFile, x);
    return true;
  }

  static dirname(){
    return './';
  }

  static async import(pathToFile, cacheId=0){
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '';
    const module = await import(pathToFile + qs);
    return module.default || module;
  }
}