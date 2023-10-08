import Os from "node:os";

export default class HelperImport{
  static async importAbsolute(path) {
    const fixWindowsImport = (Os.type() === 'Windows_NT') ? "file://": "";
    return import(fixWindowsImport + path);
  }
}