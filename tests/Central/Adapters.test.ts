import { describe, test, expect, spyOn } from "bun:test";
import NodeAdapter from "../../src/adapter/Node.mts";
import BunAdapter from "../../src/adapter/Bun.mts";
import NoopAdapter from "../../src/adapter/Noop.mts";
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Adapters', () => {
    
    test('Noop Adapter', async () => {
        new NoopAdapter(); // Coverage for class definition
        const store = new Map();
        
        expect(NoopAdapter.resolveFetchList("x", store, "y")).toBe(true);
        expect(NoopAdapter.dirname()).toBe("./");
        expect(await NoopAdapter.import("x")).toEqual({});
        expect(NoopAdapter.fileExists("x")).toBe(false);
        expect(NoopAdapter.process()).toEqual({});
    });

    // Node Adapter Tests
    test('Node Adapter resolveFetchList', () => {
        new NodeAdapter(); // Coverage
        const store = new Map();
        expect(NodeAdapter.resolveFetchList(__filename, store, "currentFile")).toBe(true);
        expect(store.get("currentFile")).toBe(__filename);
        expect(NodeAdapter.resolveFetchList("/non/existing/file", store, "other")).toBe(false);
    });

    test('Node Adapter dirname', () => {
        const fileUrl = pathToFileURL(__filename).href;
        expect(NodeAdapter.dirname(fileUrl)).toBe(__dirname);
        expect(NodeAdapter.dirname()).toBeDefined(); 
    });

    test('Node Adapter fileExists', () => {
         expect(NodeAdapter.fileExists(__filename)).toBe(true);
         expect(NodeAdapter.fileExists("/foo/bar")).toBe(false);
    });
    
    test('Node Adapter process', () => {
        expect(NodeAdapter.process()).toBe(process);
    });

    test('Node Adapter import', async () => {
        // Need to import a real file
        const imported = await NodeAdapter.import('../../src/adapter/Noop.mts');
        expect(imported).toBeDefined();
    });

    test('Node Adapter import with cacheId', async () => {
        // Just verify it doesn't crash, difficult to assert cache bust without side effects
        const imported = await NodeAdapter.import('../../src/adapter/Noop.mts', 123);
        expect(imported).toBeDefined();
    });
    
    // Bun Adapter Tests
    test('Bun Adapter resolveFetchList', () => {
        new BunAdapter(); // Coverage
        const store = new Map();
        expect(BunAdapter.resolveFetchList(__filename, store, "currentFile")).toBe(true);
        expect(store.get("currentFile")).toBe(__filename);
    });

    test('Bun Adapter fileExists', () => {
        // Bun checks .ts, .mts, or exact
        expect(BunAdapter.fileExists(__filename)).toBe(true); 
    });

    test('Bun Adapter dirname', () => {
         const fileUrl = pathToFileURL(__filename).href;
         expect(BunAdapter.dirname(fileUrl)).toBe(__dirname);
    });

    test('Bun Adapter import', async () => {
        const imported = await BunAdapter.import('../../src/adapter/Noop.mts');
        expect(imported).toBeDefined();
    });
});
