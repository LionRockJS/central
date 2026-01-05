import url from "node:url";
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');

import Central from "../../src/Central.mts";
import CentralAdapterBun from "../../src/adapter/Bun.mts";
import CentralAdapterNode from "../../src/adapter/Node.mts";
const runtime = (typeof process !== 'undefined') ? ( (process.env._ || '').split('/').pop() ) : "browser";
/*
switch (runtime) {
  case 'node':
    Central.adapter = CentralAdapterNode;
    break;
  case 'bun':
    Central.adapter = CentralAdapterBun;
    break;
}*/
console.log(runtime, CentralAdapterNode, CentralAdapterBun, Central.adapter);

//import HelperCentralBootstrap from "../../classes/helper/central/Bootstrap.mjs";
import HelperCentralCache from "../../src/helper/central/Cache.mts";
import HelperCentralConfig from "../../src/helper/central/Config.mts";
import HelperCentralPath from "../../src/helper/central/Path.mts";
//import HelperCentralImport from "../../classes/helper/central/Import.mjs";


describe('LionRockJS Helper test', () => {
  test('Central init', async () => {
    try{
      await Central.init();
    }catch(e){
      expect(e.message).toBe('Central.init requires EXE_PATH option');
    }
  });

  test('default APP Path', async () => {
    await Central.init({ EXE_PATH : __dirname });
    expect(Central.APP_PATH).toBe(`${__dirname}/application`);
    expect(Central.VIEW_PATH).toBe(`${__dirname}/views`);
  });

  test('Central init test 1', async () => {
    await Central.init({ EXE_PATH: `${__dirname}/test1/`});
    expect(Central.APP_PATH).toBe(`${__dirname}/test1/application`);
    expect(Central.VIEW_PATH).toBe(`${__dirname}/test1/views`);
  });

  test('helperPath.modules should be same', async () => {
    expect(typeof Central.config).toBe('object');
    expect(Central.classPath).toBe(HelperCentralCache.classPath);
    expect(Central.viewPath).toBe(HelperCentralCache.viewPath);
  });
});
