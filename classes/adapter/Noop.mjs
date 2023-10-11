export default class Noop {
  static resolveFetchList(x, store, pathToFile){
    store.set(pathToFile, x);
    return true;
  }

  static dirname(){
    return './';
  }
}