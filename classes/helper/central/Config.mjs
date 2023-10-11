import HelperPath from "./Path.mjs";
import HelperImport from "./Import.mjs";
import HelperCache from "./Cache.mjs";

export default class HelperConfig{
  static configs = new Set();
  static configSources = new Map();
  static config = { classes: {}, view: {} };
  static configPath = new Map(); // {'site.mjs       => 'APP_PATH/config/site.mjs'}

  static async init(){
    this.configs.clear();
    this.configSources.clear();

    await this.addConfig(new Map([
      ['classes', await import('../../../config/classes.mjs')],
      ['view', await import('../../../config/view.mjs')],
      ['system', await import('../../../config/system.mjs')],
    ]));
  }

  static async update(key) {
    if(!key)return;

    this.config[key] = {...this.configSources.get(key)}
    const fileName = `${key}.mjs`;

    try{
      const file = HelperPath.resolve(fileName, 'config', this.configPath, true);

      Object.assign(this.config[key], await HelperImport.importAbsolute( file + '?r=' + HelperCache.cacheId ));
    }catch(e){
      //config file not found;
    }
  }

  static async updateAll(){
    // search all config files
    await Promise.all([...this.configs.keys()].map(async key => this.update(key)));
  }

  static async addConfig(configMap) {
    await Promise.all(
      [...configMap.entries()].map(async it =>{
        const k = it[0];
        const v = it[1] || {};
        this.configs.add(k);

        const existConfigSource = this.configSources.get(k);
        const module = v.default || v;
        this.configSources.set(k, { ...existConfigSource, ...module });
        await this.update(k);
      })
    );
  }
}