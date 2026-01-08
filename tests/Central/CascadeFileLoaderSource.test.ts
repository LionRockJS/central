import { describe, test, expect } from "bun:test";
import CascadeFileLoader from "../../src/helper/CascadeFileLoader.mts";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CascadeFileLoader Source', () => {
    test('instantiation', () => {
        new CascadeFileLoader();
    });

    test('default path handler', () => {
        const loader = new CascadeFileLoader();
        const module = {
            filename: pathToFileURL(path.join(__dirname, 'test.js')).href
        };
        loader.addModule(module);
        loader.resolve('test.js');
        loader.addModules([module]);
    });

    test('custom path handler', () => {
        let called = false;
        const loader = new CascadeFileLoader({
            pathHandler: (p) => {
                called = true;
                return p;
            }
        });
        const module = {
             filename: pathToFileURL(path.join(__dirname, 'test.js')).href
        };
        loader.addModule(module);
        expect(called).toBe(true);
    });

    test('ignore list', () => {
        const loader = new CascadeFileLoader({
            ignoreList: [/test.js/]
        });
        const module = {
             filename: pathToFileURL(path.join(__dirname, 'test.js')).href
        };
        loader.addModule(module);
    });
});
