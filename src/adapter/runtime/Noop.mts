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

  isDirectory(pathToFile: string): boolean {
    return false;
  }

  readDir(pathToFile: string): string[] {
    return [];
  }

  joinPath(...parts: string[]): string {
    return parts.join('/').replace(/\/+/g, '/');
  }

  relativePath(from: string, to: string): string {
    // simple relative path: strip common prefix
    if (to.startsWith(from)) return to.slice(from.length).replace(/^\//, '');
    return to;
  }

  extname(filePath: string): string {
    const i = filePath.lastIndexOf('.');
    const j = filePath.lastIndexOf('/');
    return i > j ? filePath.slice(i) : '';
  }

  process(): any {
    return {
      status: 'Noop adapter - no process object available', 
      cwd: () => './'
    };
  }
}
