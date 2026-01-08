import { describe, test, expect, beforeEach, mock } from "bun:test";
import ControllerMixinViewData from "../../src/controller-mixin/ViewData.mts";
import { ControllerState } from "@lionrockjs/mvc";
import { ControllerMixinViewState } from "../../src/controller-mixin/View.mts";
import Central from "../../src/Central.mts";

describe("ControllerMixinViewData Source", () => {
    test('instantiation', () => {
        new ControllerMixinViewData();
    });

    let state;
    
    beforeEach(() => {
        state = new Map();
        
        // Mock ControllerState values required
        state.set(ControllerState.REQUEST, {
            headers: { host: "example.com" },
            url: "/test/path",
            params: { controller: "TestController", action: "index" },
            query: { foo: "bar" }
        });
        
        state.set(ControllerState.CLIENT, {
            model: "TestModel",
            name: "TestClient"
        });
        
        state.set(ControllerState.REQUEST_COOKIES, { session: "123" });
        state.set(ControllerState.LANGUAGE, "en");
        state.set(ControllerState.HOSTNAME, "http://example.com");
        
        // Initialize ViewState maps that are expected to exist
        state.set(ControllerMixinViewState.LAYOUT_DEFAULT_DATA, {});
        state.set(ControllerMixinViewState.VIEW_DEFAULT_DATA, {});

        // Mock Central Config
        const mockLanguageNames = new Map();
        mockLanguageNames.set("en", "English");
        
        // We need to properly mock Central.config
        // Since Central.config is likely a getter or property, checking if we can write to it
        // If not, we might need a workaround. But usually static props are writable in JS.
        // Assuming Central.config is accessible.
        Central.config = {
            language: {
                names: mockLanguageNames
            }
        };
    });

    test("init populates layout and view default data", () => {
        ControllerMixinViewData.init(state);

        const layoutData = state.get(ControllerMixinViewState.LAYOUT_DEFAULT_DATA);
        const viewData = state.get(ControllerMixinViewState.VIEW_DEFAULT_DATA);

        expect(layoutData).toHaveProperty("request");
        expect(viewData).toHaveProperty("request");

        const requestData = layoutData.request;
        expect(requestData.host).toBe("example.com");
        expect(requestData.locale).toBe("en");
        expect(requestData.origin).toBe("http://example.com");
        expect(requestData.page_type).toBe("TestModel");
        expect(requestData.path).toBe("/test/path");
        expect(requestData.language_name).toBe("English");
        expect(requestData.controller).toBe("TestController");
        expect(requestData.action).toBe("index");
        expect(requestData.query).toEqual({ foo: "bar" });
        expect(requestData.cookies).toEqual({ session: "123" });
        
        // Ensure same object ref (optimization check) or just deep equal
        expect(viewData.request).toEqual(requestData);
    });

    test("init uses client name if model is missing", () => {
        state.set(ControllerState.CLIENT, {
            name: "FallbackClient"
        });
        
        ControllerMixinViewData.init(state);
        
        const layoutData = state.get(ControllerMixinViewState.LAYOUT_DEFAULT_DATA);
        expect(layoutData.request.page_type).toBe("FallbackClient");
    });

    test("init uses orm_model if present", () => {
        state.set("orm_model", "ORMModelName");
         state.set(ControllerState.CLIENT, {
            name: "FallbackClient"
        });

        ControllerMixinViewData.init(state);
        
        const layoutData = state.get(ControllerMixinViewState.LAYOUT_DEFAULT_DATA);
        expect(layoutData.request.page_type).toBe("ORMModelName");
    });
});
