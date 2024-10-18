export default class Noop {
  static resolveFetchList(x, store, pathToFile){
    console.log('running central adapter noop, resolveFetchList');
    return true;
  }

  static dirname(){
    console.log('running central adapter noop, dirname');
    return './';
  }

  static async import(pathToFile, cacheId=0){
    console.log('running central adapter noop, import');
    return {};
  }

  static fileExists(pathToFile){
    console.log('running central adapter noop, fileExists');
    return false;
  }

  static process(){
    console.log('running central adapter noop, process');
    return {};
  }
}