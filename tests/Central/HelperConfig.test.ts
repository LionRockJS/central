import { describe, test, expect, beforeEach } from "bun:test";
import HelperConfig from "../../src/helper/central/Config.mts";

describe('HelperConfig', () => {
  let helperConfig: HelperConfig;

  beforeEach(() => {
    helperConfig = new HelperConfig();
  });

  test('init should load default configs', async () => {
    await helperConfig.init();
    
    expect(helperConfig.config.classes).toBeDefined();
    expect(helperConfig.config.view).toBeDefined();
    expect(helperConfig.config.system).toBeDefined();
    expect(helperConfig.config.database).toBeDefined();
    expect(helperConfig.config.language).toBeDefined();
    
    // Check specific values from the default configs
    expect(helperConfig.config.language.default).toBe('en');
  });

  test('addConfig should merge configurations', async () => {
    const newConfig = new Map([
      ['testConfig', { foo: 'bar' }],
      ['classes', { newClass: 'MyClass' }]
    ]);

    await helperConfig.addConfig(newConfig);

    expect(helperConfig.config.testConfig).toEqual({ foo: 'bar' });
    expect(helperConfig.config.classes.newClass).toBe('MyClass');
  });

  test('addConfig should handle default export in config', async () => {
    const newConfig = new Map([
      ['testConfigDefault', { default: { foo: 'bar' } }]
    ]);

    await helperConfig.addConfig(newConfig);

    expect(helperConfig.config.testConfigDefault).toEqual({ foo: 'bar' });
  });
});
