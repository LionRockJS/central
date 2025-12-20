import { describe, test, expect, beforeEach } from "bun:test";
import HelperConfig from "../../src/helper/central/Config.mts";

describe('HelperConfig', () => {

  beforeEach(() => {
  });

  test('init should load default configs', async () => {
    const config:any = {};
    await HelperConfig.init(config);
    
    expect(config.classes).toBeDefined();
    expect(config.view).toBeDefined();
    expect(config.system).toBeDefined();
    expect(config.database).toBeDefined();
    expect(config.language).toBeDefined();
    
    // Check specific values from the default configs
    expect(config.language.default).toBe('en');
  });

  test('addConfig should merge configurations', async () => {
    const config:any = {};
    const newConfig = new Map([
      ['testConfig', { foo: 'bar' }],
      ['classes', { newClass: 'MyClass' }]
    ]);

    await HelperConfig.addConfig(config, newConfig);

    expect(config.testConfig).toEqual({ foo: 'bar' });
    expect(config.classes.newClass).toBe('MyClass');
  });

  test('addConfig should handle default export in config', async () => {
    const config:any = {};
    const newConfig = new Map([
      ['testConfigDefault', { default: { foo: 'bar' } }]
    ]);

    await HelperConfig.addConfig(config, newConfig);
    expect(config.testConfigDefault).toEqual({ foo: 'bar' });
  });
});
