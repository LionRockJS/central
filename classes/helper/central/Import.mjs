import Central from "../../Central.mjs";
import HelperConfig from "./Config.mjs";
import HelperCache from "./Cache.mjs";

export default class HelperImport{
  static async importAbsolute(path) {
    return Central.adapter.import(path, HelperCache.cacheId);
  }
}