import { describe, test, expect } from "bun:test";
import JSONView from "../../src/view/JSONView.mts";

describe("JSONView Source", () => {
    test("constructor sets placeholder and data", () => {
        const view = new JSONView("content", { foo: "bar" });
        expect(view.file).toBe("content");
        expect(view.data).toEqual({ foo: "bar" });
    });

    test("render stringifies data value at placeholder key", async () => {
        const data = { 
            main: { status: "ok" },
            other: "ignore"
        };
        const view = new JSONView("main", data);
        const result = await view.render();
        
        expect(result).toBe(JSON.stringify({ status: "ok" }));
    });

    test("render handles missing data gracefully (undefined)", async () => {
        const view = new JSONView("missing", {});
        const result = await view.render();
        expect(result).toBeUndefined(); // JSON.stringify(undefined) is undefined
    });
});
