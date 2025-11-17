export default class Noop {
  static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    console.log('running central adapter noop, resolveFetchList');
    return true;
  }

  static dirname(): string {
    console.log('running central adapter noop, dirname');
    return './';
  }

  static async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    console.log('running central adapter noop, import');
    return {};
  }

  static fileExists(pathToFile: string): boolean {
    console.log('running central adapter noop, fileExists');
    return false;
  }

  static process(): any {
    console.log('running central adapter noop, process');
    return {};
  }
}