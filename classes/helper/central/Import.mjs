import Os from "node:os";

export default class HelperImport{
  static async importAbsolute(path) {
    const fixWindowsImport = (Os.type() === 'Windows_NT') ? "file://": "";
    const module = await import(fixWindowsImport + path);
    return module.default || module;
  }
}