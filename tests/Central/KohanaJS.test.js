import * as url from 'node:url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
import fs from 'node:fs';
import path from 'node:path';

import Central from "../../classes/Central";
import KohanaJSAdapterNode from "../../classes/adapter/Node";

Central.adapter = KohanaJSAdapterNode;

describe('KohanaJS test', () => {
  test('default APP Path', async () => {
    await Central.init({ EXE_PATH : __dirname });
    expect(Central.APP_PATH).toBe(`${__dirname}/application`);
    expect(Central.VIEW_PATH).toBe(`${__dirname}/views`);
  });

  test('nodePackages after re-init', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test1/`});
    expect(JSON.stringify([...Central.nodePackages.keys()])).toBe(JSON.stringify([path.normalize(`${__dirname}/test1/modules/test`)]));

    await Central.init({ EXE_PATH: `${__dirname}/test1/`});
    expect(JSON.stringify([...Central.nodePackages.keys()])).toBe(JSON.stringify([path.normalize(`${__dirname}/test1/modules/test`)]));
  });

  test('KohanaJS.import', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test1/`});
    expect(JSON.stringify([...Central.nodePackages.keys()])).toBe(JSON.stringify([path.normalize(`${__dirname}/test1/modules/test`)]));

    const Test = await Central.import('Test');
    const t = new Test();
    expect(t.getFoo()).toBe('bar');
  });

  test('KohanaJS.import again', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test1/`});
    expect(JSON.stringify([...Central.nodePackages.keys()])).toBe(JSON.stringify([path.normalize(`${__dirname}/test1/modules/test`)]));

    const Test = await Central.import('Test');
    const t = new Test();
    expect(t.getFoo()).toBe('bar');
  });

  test('switch package', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test1`});
    expect(JSON.stringify([...Central.nodePackages.keys()]))
      .toBe(JSON.stringify([path.normalize(`${__dirname}/test1/modules/test`)]));

    const Test = await Central.import('Test');
    const t = new Test();
    expect(t.getFoo()).toBe('bar');

    const Foo1 = await Central.import('Foo');
    const f1 = new Foo1();
    expect(f1.getFoo()).toBe('fooo');

    await Central.init({ EXE_PATH: `${__dirname}/test2`});
    expect(JSON.stringify([...Central.nodePackages.keys()]))
      .toBe(JSON.stringify([path.normalize(`${__dirname}/test2/modules/test`)]));
    const T = await Central.import('Test');
    const t2 = new T();
    expect(t2.getFoo()).toBe('tar');

    try {
      const Foo2 = await Central.import('Foo');
      // eslint-disable-next-line no-unused-vars
      const f2 = new Foo2();
    } catch (e) {
      expect(e.message.replace(/ {[^}]+}/, '')).toBe('KohanaJS resolve path error: path Foo.mjs not found. prefixPath: classes , store: {} ');
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
      expect(e.message.replace(/ {[^}]+}/, '')).toBe('KohanaJS resolve path error: path Foo.mjs not found. prefixPath: classes , store: {} ');
    }
  });

  test('custom module folder', async () => {
    const testDir = __dirname;
    await Central.init({ EXE_PATH: `${testDir}/test1`, APP_PATH: `${testDir}/test3/application`});
    expect(Central.APP_PATH).toBe(`${testDir}/test3/application`);

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
      expect(e.message.replace(/ {[^}]+}/, '')).toBe('KohanaJS resolve path error: path NotFound.mjs not found. prefixPath: classes , store: {} ');
    }
  });

  test('npm modules init ', async () => {
    expect(global.testInit).toBe(undefined);
    await Central.init({ EXE_PATH: `${__dirname}/test5` });
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

    const Foo4 = await Central.import('Foo');
    expect(Foo4.id).toBe(2);

    const ins = new Foo4();
    expect(ins.getFooId()).toBe(2);

    Central.config.classes.cache = true;
    Central.config.view.cache = true;
    await Central.flushCache();
    // change config after validateCache. otherwise the config file will over write it.

    // jest override require, need to use reset modules to invalidate

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

    fs.copyFileSync(path.normalize(`${Central.APP_PATH}/config/salt.default.mjs`), path.normalize(`${Central.APP_PATH}/config/salt.mjs`));
    await Central.flushCache();
    expect(Central.config.salt.value).toBe('default salt 1');

    fs.unlinkSync(`${Central.APP_PATH}/config/salt.mjs`);

    try {
      await Central.flushCache();
    } catch (e) {
      expect(e.message).toBe('KohanaJS resolve path error: path salt.js not found. config , {} ');
    }

    expect(Central.config.salt.value).toBe('hello');
  });

  test('config path, init config with null value', async ()=>{
    await Central.init({ EXE_PATH: `${__dirname}/test8` });

    if (fs.existsSync(`${Central.APP_PATH}/config/salt.js`)) {
      fs.unlinkSync(`${Central.APP_PATH}/config/salt.js`);
    }

    Central.configForceUpdate = true;
    Central.initConfig(new Map([['salt', {value:'hello'}], ['test', null]]));

    expect(Central.config.salt.value).toBe('hello');
    expect(JSON.stringify(Central.config.test)).toBe("{}");
  })

  test('setPath default value', async() => {
    await Central.init();
    expect(path.normalize(`${Central.EXE_PATH}/`)).toBe(path.normalize(`${__dirname}/../../classes/adapter/`));
  });

  test('set all init value', async () => {
    await Central.init({
      EXE_PATH: `${__dirname}/test1`,
      APP_PATH: `${__dirname}/test2/application`,
    });
    expect(Central.EXE_PATH).toBe(`${__dirname}/test1`);
    expect(Central.APP_PATH).toBe(`${__dirname}/test2/application`);
  });

  test('KohanaJS nodePackages without init', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test9` });
    expect(Central.nodePackages.size).toBe(2);
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

  test('specific Central.import file', async () => {
    Central.classPath.set('foo/Bar.mjs', path.normalize(`${__dirname}/test14/Bar`));
    const Bar = await Central.import('foo/Bar');
    const bar = new Bar();
    expect(bar.greeting()).toBe('Hello from Bar');

    Central.classPath.set('kaa/Tar.mjs', path.normalize(`${__dirname}/test14/Tar.mjs`));
    const Tar = await Central.import('kaa/Tar.mjs');
    const tar = new Tar();
    expect(tar.greeting()).toBe('Hello from Tar');
  });

  test('explict set class to Central.import', async () => {
    const C = class Collection {};
    Central.classPath.set('model/Collection.mjs', C);
    const C2 = await Central.import('model/Collection');

    expect(C === C2).toBe(true);

    //clear cache should not clear explict set class
    await Central.flushCache();
    const C3 = await Central.import('model/Collection');
    expect(C === C3).toBe(true);

  });

  test('Central default adapter', async () =>{
    Central.adapter = KohanaJSAdapterNode;
  })

  test('add node module', async () => {
    await Central.init({ EXE_PATH: __dirname });
    const Test = await import('./test1/modules/test/index');
    Central.addNodeModules([Test])
    expect(Central.nodePackages.size).toBe(1);

    expect([...Central.nodePackages.keys()][0]).toBe(path.normalize(__dirname + '/test1/modules/test'));
  });

  test('add node module with empty value', async () => {
    await Central.init({ EXE_PATH: __dirname });
    const Test = await import('./test1/modules/test/index');
    Central.addNodeModules([Test, null, Test])
    expect(Central.nodePackages.size).toBe(1);

    expect([...Central.nodePackages.keys()][0]).toBe(path.normalize(__dirname + '/test1/modules/test'));
  });

  test('add node module without default dirname', async () => {
    await Central.init({ EXE_PATH: __dirname });
    const Test = await import('./test1/modules/test2/index');
    Central.addNodeModules([Test])
    expect(Central.nodePackages.size).toBe(0);
  });

  test('error when import bootstrap', async () => {
    try{
      await Central.init({ EXE_PATH: __dirname+ '/test16/' });
      expect('this line should not run').toBe('');
    }catch(e){
      expect(e.message).toBe('Test Error when import bootstrap');
    }
  });

  test('coverage central.mjs', async () => {
    await Central.init({ EXE_PATH: __dirname });

  });

  test('render pdf', async()=>{

  });

  test('exit render json', async()=>{
    
  })
});
