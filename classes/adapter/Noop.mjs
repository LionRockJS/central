export default class Noop {
  static normalize(source){
    return source;
  }

  static resolveFetchList(x, store, pathToFile){
    store.set(pathToFile, x); return true;
  }

  static dirname(){
    return '';
  }
}