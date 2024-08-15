import url from "node:url";
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');

import Central from "../../classes/Central.mjs";
import CentralAdapterBun from "../../classes/adapter/Bun.mjs";
import CentralAdapterNode from "../../classes/adapter/Node.mjs";
const runtime = (typeof process !== 'undefined') ? ( (process.env._ || '').split('/').pop() ) : "browser";

switch (runtime) {
  case 'node':
    Central.adapter = CentralAdapterNode;
    break;
  case 'bun':
    Central.adapter = CentralAdapterBun;
    break;
}
console.log(runtime, CentralAdapterNode, CentralAdapterBun, Central.adapter);

//import HelperCentralBootstrap from "../../classes/helper/central/Bootstrap.mjs";
import HelperCentralCache from "../../classes/helper/central/Cache.mjs";
import HelperCentralConfig from "../../classes/helper/central/Config.mjs";
import HelperCentralPath from "../../classes/helper/central/Path.mjs";
//import HelperCentralImport from "../../classes/helper/central/Import.mjs";


describe('LionRockJS Helper test', () => {
  test('Central init', async () => {
    await Central.init();
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

  test('nodePackages should be same', async () => {
    expect(Central.nodePackages).toBe(HelperCentralPath.nodePackages);
    expect(Central.config).toBe(HelperCentralConfig.config);
    expect(Central.classPath).toBe(HelperCentralCache.classPath);
    expect(Central.viewPath).toBe(HelperCentralCache.viewPath);
  });
});
