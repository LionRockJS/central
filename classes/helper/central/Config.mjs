import adapter from "../../adapter/Node.mjs";

export default class HelperConfig{
  static config = { classes: {}, view: {} };

  static async init(){
    // Clear all config
    Object.keys(this.config).forEach(it => this.config[it] = {});

    await this.addConfig(new Map([
      ['classes', await import('../../../config/classes.mjs')],
      ['view', await import('../../../config/view.mjs')],
      ['system', await import('../../../config/system.mjs')],
      ['database', await import('../../../config/database.mjs')],
      ['language', await import('../../../config/language.mjs')],
    ]));
  }

  static async addConfigs(dirname, configNames=[]){
    const configMap = new Map();

    await Promise.all(
      configNames.map(async configName => {
        const configPath = `${dirname}/config/${configName}.mjs`;
        if(adapter.fileExists(configPath)){
          configMap.set(configName, await adapter.import(configPath));
        }
      })
    );
    await this.addConfig(configMap);
  }

  static async addConfig(configMap) {
    await Promise.all(
      [...configMap.entries()].map(async it =>{
        const key = it[0];
        const v = it[1] || {};
        const config = this.config[key] || {};
        Object.assign(config, v.default || v);
        this.config[key] = config;
      })
    );
  }
}