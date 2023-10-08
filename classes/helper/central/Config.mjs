import Central from "../../Central.mjs";
import HelperPath from "./Path.mjs";

export default class HelperConfig{
  static configs = new Set();
  static configSources = new Map();
  static config = { classes: {}, view: {} };
  static configPath = new Map(); // {'site.mjs       => 'APP_PATH/config/site.mjs'}

  static async init(){
    this.configs = new Set();

    await this.addConfig(new Map([
      ['classes', (await import('../../../config/classes.mjs')).default],
      ['view', (await import('../../../config/view.mjs')).default],
    ]));
  }

  static async update() {
    // search all config files
    await Promise.all([...this.configs.keys()].map(async key => {
      this.config[key] = {...this.configSources.get(key)}
      const fileName = `${key}.mjs`;

      try{
        this.configPath.set(fileName, null); // never cache config file path.
        const file = HelperPath.resolve(fileName, 'config', this.configPath, true);
        Object.assign(this.config[key], await Central.import(file ));
      }catch(e){
        //config file not found;
      }
    }));
  }

  static async addConfig(configMap) {
    configMap.forEach((v, k) => {
      this.configs.add(k);
      if(!v)return;

      const existConfigSource = this.configSources.get(k);
      this.configSources.set(k, { ...existConfigSource, ...v });
    });

    await this.update();
  }
}