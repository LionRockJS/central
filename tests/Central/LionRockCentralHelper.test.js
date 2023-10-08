import Central from "../../classes/Central.mjs";
import KohanaJSAdapterNode from "../../classes/adapter/Node.mjs";
Central.adapter = KohanaJSAdapterNode;

//import HelperCentralBootstrap from "../../classes/helper/central/Bootstrap.mjs";
import HelperCentralCache from "../../classes/helper/central/Cache.mjs";
import HelperCentralConfig from "../../classes/helper/central/Config.mjs";
import HelperCentralPath from "../../classes/helper/central/Path.mjs";
//import HelperCentralImport from "../../classes/helper/central/Import.mjs";


describe('LionRockJS Helper test', () => {
  test('Central init', async () => {
    await Central.init();
  });

  test('nodePackages should be same', async () => {
    expect(Central.nodePackages).toBe(HelperCentralPath.nodePackages);
    expect(Central.config).toBe(HelperCentralConfig.config);
    expect(Central.classPath).toBe(HelperCentralCache.classPath);
    expect(Central.viewPath).toBe(HelperCentralCache.viewPath);
  });
});
