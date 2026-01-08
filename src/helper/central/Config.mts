export default class HelperConfig{
  constructor() {}
  static async init(config:object): Promise<void> {
    // Clear all config
    Object.keys(config).forEach(it => config[it] = {});

    await this.addConfig(config, new Map([
      ['classes', await import('../../config/classes.mjs')],
      ['view', await import('../../config/view.mjs')],
      ['system', await import('../../config/system.mjs')],
      ['database', await import('../../config/database.mjs')],
      ['language', await import('../../config/language.mjs')],
    ]));
  }

  static async addConfig(config:object, configMap: Map<string, any>): Promise<void> {
    await Promise.all(
      [...configMap.entries()].map(async it =>{
        const key = it[0];
        const v = it[1] || {};
        const configValue = config[key] || {};
        Object.assign(configValue, v.default || v);
        config[key] = configValue;
      })
    );
  }
}