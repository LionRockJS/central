import { describe, test, expect } from "bun:test";
import HelperPath from "../../src/helper/central/Path.mts";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Central from "../../src/Central.mts";

describe("HelperPath Source", () => {
    test("viewLoader resolves views from module siblings", () => {
        const helper = new HelperPath();
        
        const testBase = path.join(process.cwd(), "tests/Central/test_path_helper");
        const mod1Path = path.join(testBase, "mod1/index.js");
        const viewPath = path.join(testBase, "views/myview.liquid");
        
        const mockModule = {
            filename: pathToFileURL(mod1Path).href
        };
        
        helper.addModules([mockModule]);
        
        const result = helper.resolveView("myview");
        
        expect(result).toBe(viewPath);
    });

    test("init sets Central paths", () => {
         const helper = new HelperPath();
         // Mocking execution path
         const exePath = "/tmp/test-exe";
         helper.init(exePath, "/tmp/test-app", "/tmp/test-views", []);
         
         expect(Central.EXE_PATH).toBe(exePath);
         expect(Central.APP_PATH).toBe("/tmp/test-app");
         expect(Central.VIEW_PATH).toBe("/tmp/test-views");
    });

    test("getters access fileList", () => {
        const helper = new HelperPath();
        expect(helper.fileList).toBeInstanceOf(Map);
        expect(helper.templateList).toBeInstanceOf(Map);
    });
});
