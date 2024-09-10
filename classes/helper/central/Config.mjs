import HelperPath from "./Path.mjs";
import HelperImport from "./Import.mjs";
import HelperCache from "./Cache.mjs";

export default class HelperConfig{
  static config = { classes: {}, view: {} };

  static async init(){
    Object.keys(this.config).forEach(it => this.config[it] = {});

    await this.addConfig(new Map([
      ['classes', await import('../../../config/classes.mjs')],
      ['view', await import('../../../config/view.mjs')],
      ['system', await import('../../../config/system.mjs')],
      ['database', await import('../../../config/database.mjs')],
      ['language', await import('../../../config/language.mjs')],
    ]));
  }

  static async addConfig(configMap) {
    await Promise.all(
      [...configMap.entries()].map(async it =>{
        const key = it[0];
        const v = it[1] || {};
        const config = this.config[key] || {};
        Object.assign(config, v.default || v);
      })
    );
  }
}