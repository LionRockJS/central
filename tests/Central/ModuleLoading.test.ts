import {describe, test, expect} from "bun:test";
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import Central, {CentralEnv} from "../../src/Central.mjs";
import CentralAdapterBun from "../../src/adapter/Bun.mts";
import CentralAdapterNode from "../../src/adapter/Node.mts";

const runtime = (typeof process !== 'undefined') ? ( (process.env._ || '').split('/').pop() ) : "browser";

switch (runtime) {
  case 'node':
    Central.adapter = CentralAdapterNode;
    break;
  case 'bun':
    Central.adapter = CentralAdapterBun;
    break;
}
Central.ENV = CentralEnv.TEST;

describe('Central Module Loading', () => {
  test('should load module config', async () => {
    const testDir = path.join(__dirname, 'test_module_loading');
    await Central.init({ EXE_PATH: testDir });

    const modulePath = path.join(testDir, 'modules/my-plugin/index.mjs');
    const module = await import(modulePath);

    await Central.addModules([module]);

    // Check if module path is added to nodePackages
    const expectedPackagePath = path.dirname(modulePath);
    expect([...Central.nodePackages]).toContain(expectedPackagePath);

    // Check if config is loaded
    // The config name is 'plugin_config', so it should be in Central.config.plugin_config
    expect(Central.config.plugin_config).toBeDefined();
    // expect(Central.config.plugin_config.foo).toBe('bar'); // Before app override

    // Since we added an application config that overrides it, it should be 'baz'
    // However, Central.init() loads application configs. 
    // Central.addModules() calls applyApplicationConfigs() at the end.
    // So the override should happen.
    expect(Central.config.plugin_config.foo).toBe('baz');

    // Check if another_config is loaded
    expect(Central.config.another_config).toBeDefined();
    expect(Central.config.another_config.hello).toBe('world');
  });

  test('should load module without configs and resolve files from it', async () => {
    const testDir = path.join(__dirname, 'test_module_loading');
    await Central.init({ EXE_PATH: testDir });

    const modulePath = path.join(testDir, 'modules/simple-plugin/index.mjs');
    const module = await import(modulePath);

    await Central.addModules([module]);

    // Check if module path is added to nodePackages
    const expectedPackagePath = path.dirname(modulePath);
    expect([...Central.nodePackages]).toContain(expectedPackagePath);

    // Try to resolve a class from the module
    // Central.import uses HelperPath.resolve which searches in nodePackages
    const simpleClass = await Central.import('Simple');
    expect(simpleClass).toBeDefined();
    expect(simpleClass.name).toBe('Simple');
  });

  test('should handle module with missing config file gracefully', async () => {
    const testDir = path.join(__dirname, 'test_module_loading');
    await Central.init({ EXE_PATH: testDir });

    const modulePath = path.join(testDir, 'modules/broken-config-plugin/index.mjs');
    const module = await import(modulePath);

    // This should not throw
    await Central.addModules([module]);

    // Check if module path is added to nodePackages
    const expectedPackagePath = path.dirname(modulePath);
    expect([...Central.nodePackages]).toContain(expectedPackagePath);

    // Verify that non_existent config is NOT in Central.config
    expect(Central.config.non_existent).toBeUndefined();
  });

  test('should reset config after re-init', async () => {
    const testDir = path.join(__dirname, 'test_module_loading');
    await Central.init({ EXE_PATH: testDir });

    const modulePath = path.join(testDir, 'modules/my-plugin/index.mjs');
    const module = await import(modulePath);

    await Central.addModules([module]);
    expect(Central.config.plugin_config).toBeDefined();

    // Re-init Central
    await Central.init({ EXE_PATH: testDir });

    // Config should be reset (plugin_config should be gone)
    expect(Central.config.plugin_config).toBeUndefined();
    
    // Default configs should still be there
    expect(Central.config.system).toBeDefined();
  });
});
