export default abstract class Noop {
  resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    return true;
  }

  dirname(file: string | null = null): string {
    return './'+(file || '');
  }

  async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    return {};
  }

  fileExists(pathToFile: string): boolean {
    return false;
  }

  process(): any {
    return {
      status: 'Noop adapter - no process object available', 
      cwd: () => './'
    };
  }
}
