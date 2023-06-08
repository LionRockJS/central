import * as url from 'node:url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
import fs from 'node:fs';
import path from 'node:path';

import Central from "../../classes/Central";
import KohanaJSAdapterNode from "../../classes/KohanaJS-adapter/Node";

Central.adapter = KohanaJSAdapterNode;

describe('KohanaJS test', () => {
  const EXE_PATH = `${__dirname.replace(/\/tests$/, '')}/server`;

  test('APP Path', async () => {
    await Central.init({ EXE_PATH });
    expect(Central.APP_PATH).toBe(`${EXE_PATH}/application`);
  });

  test('KohanaJS.init', async () => {
    const packagePath = `${__dirname}/test1/`;
    await Central.init({ EXE_PATH: packagePath, MOD_PATH: `${packagePath}/modules` });

    expect(Central.MOD_PATH).toBe(`${packagePath}/modules`);
  });

  test('KohanaJS.import', async () => {
    const packagePath = `${__dirname}/test1/`;
    await Central.init({ EXE_PATH: packagePath, MOD_PATH: `${packagePath}/modules` });

    const Test = await Central.import('Test');

    const t = new Test();
    expect(t.getFoo()).toBe('bar');
  });

  test('switch package', async () => {
    const testDir = __dirname;
    await Central.init({ EXE_PATH: `${testDir}/test1`, MOD_PATH: `${testDir}/test1/modules` });
    expect(Central.MOD_PATH).toBe(`${testDir}/test1/modules`);

    let T = await Central.import('Test');
    const t1 = new T();
    expect(t1.getFoo()).toBe('bar');

    const Foo1 = await Central.import('Foo');
    const f1 = new Foo1();
    expect(f1.getFoo()).toBe('fooo');

    await Central.init({ EXE_PATH: `${testDir}/test2`, MOD_PATH: `${testDir}/test2/modules` });
    expect(Central.MOD_PATH).toBe(`${testDir}/test2/modules`);

    T = await Central.import('Test');
    const t2 = new T();
    expect(t2.getFoo()).toBe('tar');

    try {
      const Foo2 = await Central.import('Foo');
      // eslint-disable-next-line no-unused-vars
      const f2 = new Foo2();
    } catch (e) {
      expect(e.message.replace(/ {[^}]+}/, '')).toBe('KohanaJS resolve path error: path Foo.mjs not found. classes , {} ');
    }
  });

  test('application folder', async () => {
    const testDir = __dirname;
    await Central.init({ EXE_PATH: `${testDir}/test1` });
    expect(Central.APP_PATH).toBe(`${testDir}/test1/application`);

    const Foo1 = await Central.import('Foo');
    const f1 = new Foo1();
    expect(f1.getFoo()).toBe('fooo');

    await Central.init({ EXE_PATH: `${testDir}/test2` });
    expect(Central.APP_PATH).toBe(`${testDir}/test2/application`);

    try {
      const Foo2 = await Central.import('Foo');
      // eslint-disable-next-line no-unused-vars
      const f2 = new Foo2();
    } catch (e) {
      expect(e.message.replace(/ {[^}]+}/, '')).toBe('KohanaJS resolve path error: path Foo.mjs not found. classes , {} ');
    }
  });

  test('custom module folder', async () => {
    const testDir = __dirname;
    await Central.init({ EXE_PATH: `${testDir}/test1`, APP_PATH: `${testDir}/test3/application`, MOD_PATH: `${testDir}/test1/modules` });
    expect(Central.APP_PATH).toBe(`${testDir}/test3/application`);
    expect(Central.MOD_PATH).toBe(`${testDir}/test1/modules`);

    const Foo1 = await Central.import('Foo');// test3/Foo
    const f1 = new Foo1();
    expect(f1.getFoo()).toBe('waa');

    const Test = await Central.import('Test');
    const t = new Test();
    expect(t.getFoo()).toBe('bar');
  });

  test('path not found', async () => {
    try {
      await Central.import('NotFound');
    } catch (e) {
      expect(e.message.replace(/ {[^}]+}/, '')).toBe('KohanaJS resolve path error: path NotFound.mjs not found. classes , {} ');
    }
  });

  test('inline modules init', async () => {
    const testDir = __dirname;
    expect(global.testInit).toBe(undefined);
    await Central.init({ EXE_PATH: `${testDir}/test4`, MOD_PATH: `${testDir}/test4/modules` });
    expect(global.testInit).toBe(true);
    delete global.testInit;
  });

  test('npm modules init ', async () => {
    const testDir = __dirname;
    expect(global.testInit).toBe(undefined);
    await Central.init({ EXE_PATH: `${testDir}/test5` });
    expect(global.testInit).toBe(true);
    delete global.testInit;
  });

  test('clear cache', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test6` });
    const Foo = await Central.import('Foo');
    expect(Foo.id).toBe(1);

    const Foo2 = await Central.import('Foo');
    expect(Foo2.id).toBe(1);

    Central.configForceUpdate = false;
    Central.config.classes.cache = true;
    await Central.flushCache();

    const Foo3 = await Central.import('Foo');
    expect(Foo3.id).toBe(1);

    Central.config.classes.cache = false;
    Central.config.view.cache = false;
    await Central.flushCache();
    // jest override require, need to use reset modules to invalidate
    jest.resetModules();

    const Foo4 = await Central.import('Foo');
    expect(Foo4.id).toBe(2);

    const ins = new Foo4();
    expect(ins.getFooId()).toBe(2);

    Central.config.classes.cache = true;
    Central.config.view.cache = true;
    await Central.flushCache();
    // change config after validateCache. otherwise the config file will over write it.

    // jest override require, need to use reset modules to invalidate
    jest.resetModules();

    expect(Central.config.view.cache).toBe(true);

    Central.configForceUpdate = true;
  });

  test('resolveView', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test7` });
    const viewFile = Central.resolveView('test.html');
    expect(viewFile).toBe(`${__dirname}/test7/application/views/test.html`);
  });

  test('config path', async() => {
    await Central.init({ EXE_PATH: `${__dirname}/test8` });

    if (fs.existsSync(`${Central.APP_PATH}/config/salt.js`)) {
      fs.unlinkSync(`${Central.APP_PATH}/config/salt.js`);
    }

    Central.configForceUpdate = true;
    Central.initConfig(new Map([['salt', {value:'hello'}]]));

    expect(Central.config.salt.value).toBe('hello');

    fs.copyFileSync(path.normalize(`${Central.APP_PATH}/config/salt.default.js`), path.normalize(`${Central.APP_PATH}/config/salt.js`));
    jest.resetModules();
    await Central.flushCache();
    expect(Central.config.salt.value).toBe('default salt 1');

    fs.unlinkSync(`${Central.APP_PATH}/config/salt.js`);
    jest.resetModules();

    try {
      await Central.flushCache();
    } catch (e) {
      expect(e.message).toBe('KohanaJS resolve path error: path salt.js not found. config , {} ');
    }

    expect(Central.config.salt.value).toBe('hello');
  });

  test('setPath default value', async() => {
    await Central.init();
    expect(path.normalize(`${Central.EXE_PATH}/`)).toBe(path.normalize(`${__dirname}/../../`));
  });

  test('set all init value', async () => {
    await Central.init({
      EXE_PATH: `${__dirname}/test1`,
      APP_PATH: `${__dirname}/test2/application`,
      MOD_PATH: `${__dirname}/test3/modules`,
    });
    expect(Central.EXE_PATH).toBe(`${__dirname}/test1`);
    expect(Central.APP_PATH).toBe(`${__dirname}/test2/application`);
    expect(Central.MOD_PATH).toBe(`${__dirname}/test3/modules`);
  });

  test('test default MODPATH ', async() => {
    await Central.init({
      EXE_PATH: `${__dirname}/test1`,
      APP_PATH: `${__dirname}/test2/application`,
    });
    expect(Central.EXE_PATH).toBe(`${__dirname}/test1`);
    expect(Central.APP_PATH).toBe(`${__dirname}/test2/application`);
    expect(Central.MOD_PATH).toBe(`${__dirname}/test2/application/modules`);
  });

  test('KohanaJS nodePackages without init', async () => {
    const testDir = __dirname;
    await Central.init({ EXE_PATH: `${testDir}/test9` });
    expect(Central.nodePackages.length).toBe(2);
    // KohanaJS will load bootstrap from test9/application/bootstrap.js
    //
  });

  test('KohanaJS require file with extension', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test10` });
    const Foo = await Central.import('Foo.js');
    const ins = new Foo();
    expect(ins.getFoo()).toBe('bar');
  });

  test('should fail if require contain ../ ', async () => {
    try {
      await Central.import('../hello');
      expect('this line should not run').toBe('');
    } catch (e) {
      expect(e.message).toBe('invalid require path');
    }

    try {
      await Central.import('foo/../hello');
      expect('this line should not run').toBe('');
    } catch (e) {
      expect(e.message).toBe('invalid require path');
    }
  });

  test('specific KohanaJS.require file', async () => {
    Central.classPath.set('foo/Bar.js', path.normalize(`${__dirname}/test14/Bar`));
    const Bar = await Central.import('foo/Bar');
    const bar = new Bar();
    expect(bar.greeting()).toBe('Hello from Bar');

    Central.classPath.set('kaa/Tar.js', path.normalize(`${__dirname}/test14/Tar.js`));
    const Tar = await Central.import('kaa/Tar.js');
    const tar = new Tar();
    expect(tar.greeting()).toBe('Hello from Tar');
  });

  test('explict set class to KohanaJS.require', async () => {
    const C = class Collection {};
    Central.classPath.set('model/Collection.js', C);
    const C2 = await Central.import('model/Collection');

    expect(C === C2).toBe(true);
  });
});
