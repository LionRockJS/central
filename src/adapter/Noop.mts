export default abstract class Noop {
  static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    return true;
  }

  static dirname(): string {
    return './';
  }

  static async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    return {};
  }

  static fileExists(pathToFile: string): boolean {
    return false;
  }

  static process(): any {
    return {};
  }
}
