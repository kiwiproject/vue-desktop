import { describe, it, expect, beforeEach } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import {
  createSpotlightPlugin,
  createAppsProvider,
  createWindowsProvider,
  type DesktopInstanceWithSpotlight,
  type SpotlightProvider,
  type SpotlightItem
} from "../src/plugins/spotlight";
import {
  createStartMenuPlugin,
  type DesktopInstanceWithStartMenu
} from "../src/plugins/start-menu";

describe("SpotlightPlugin", () => {
  const createMockProvider = (id: string, items: SpotlightItem[]): SpotlightProvider => ({
    id,
    getItems: () => items
  });

  const createMockItem = (id: string, label: string, category: string): SpotlightItem => ({
    id,
    label,
    category,
    action: () => {}
  });

  describe("installation", () => {
    it("installs successfully", () => {
      const d = createDesktop();
      const plugin = createSpotlightPlugin();

      const result = d.installPlugin(plugin);

      expect(result).toBe(true);
      expect(d.hasPlugin("spotlight")).toBe(true);
    });

    it("attaches spotlight API to desktop", () => {
      const d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());

      expect(d.spotlight).toBeDefined();
      expect(typeof d.spotlight?.open).toBe("function");
      expect(typeof d.spotlight?.close).toBe("function");
      expect(typeof d.spotlight?.toggle).toBe("function");
      expect(typeof d.spotlight?.isOpen).toBe("function");
      expect(typeof d.spotlight?.registerProvider).toBe("function");
      expect(typeof d.spotlight?.unregisterProvider).toBe("function");
      expect(typeof d.spotlight?.getProviders).toBe("function");
      expect(typeof d.spotlight?.search).toBe("function");
    });

    it("registers built-in providers", () => {
      const d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());

      const providers = d.spotlight?.getProviders();
      expect(providers?.some((p) => p.id === "apps")).toBe(true);
      expect(providers?.some((p) => p.id === "windows")).toBe(true);
    });

    it("registers custom providers from options", () => {
      const d = createDesktop() as DesktopInstanceWithSpotlight;
      const customProvider = createMockProvider("custom", []);

      d.installPlugin(createSpotlightPlugin({ providers: [customProvider] }));

      const providers = d.spotlight?.getProviders();
      expect(providers?.some((p) => p.id === "custom")).toBe(true);
    });
  });

  describe("uninstallation", () => {
    it("uninstalls successfully", () => {
      const d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());

      const result = d.uninstallPlugin("spotlight");

      expect(result).toBe(true);
      expect(d.hasPlugin("spotlight")).toBe(false);
    });

    it("removes spotlight API on uninstall", () => {
      const d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());

      d.uninstallPlugin("spotlight");

      expect(d.spotlight).toBeUndefined();
    });
  });

  describe("provider registration", () => {
    let d: DesktopInstanceWithSpotlight;

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());
    });

    it("registers a provider", () => {
      const provider = createMockProvider("test-provider", []);

      d.spotlight?.registerProvider(provider);

      expect(d.spotlight?.getProviders().some((p) => p.id === "test-provider")).toBe(true);
    });

    it("returns unregister function", () => {
      const provider = createMockProvider("test-provider", []);

      const unregister = d.spotlight?.registerProvider(provider);
      expect(d.spotlight?.getProviders().some((p) => p.id === "test-provider")).toBe(true);

      unregister?.();
      expect(d.spotlight?.getProviders().some((p) => p.id === "test-provider")).toBe(false);
    });

    it("prevents duplicate provider registration", () => {
      const provider1 = createMockProvider("same-id", []);
      const provider2 = createMockProvider("same-id", []);

      d.spotlight?.registerProvider(provider1);
      d.spotlight?.registerProvider(provider2);

      const matching = d.spotlight?.getProviders().filter((p) => p.id === "same-id");
      expect(matching).toHaveLength(1);
    });

    it("unregisters provider by id", () => {
      d.spotlight?.registerProvider(createMockProvider("provider1", []));
      d.spotlight?.registerProvider(createMockProvider("provider2", []));

      const result = d.spotlight?.unregisterProvider("provider1");

      expect(result).toBe(true);
      expect(d.spotlight?.getProviders().some((p) => p.id === "provider1")).toBe(false);
      expect(d.spotlight?.getProviders().some((p) => p.id === "provider2")).toBe(true);
    });

    it("returns false when unregistering non-existent provider", () => {
      const result = d.spotlight?.unregisterProvider("non-existent");

      expect(result).toBe(false);
    });
  });

  describe("spotlight state", () => {
    let d: DesktopInstanceWithSpotlight;

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());
    });

    it("starts closed", () => {
      expect(d.spotlight?.isOpen()).toBe(false);
    });

    it("opens the spotlight", () => {
      d.spotlight?.open();

      expect(d.spotlight?.isOpen()).toBe(true);
    });

    it("closes the spotlight", () => {
      d.spotlight?.open();
      d.spotlight?.close();

      expect(d.spotlight?.isOpen()).toBe(false);
    });

    it("toggles the spotlight", () => {
      expect(d.spotlight?.isOpen()).toBe(false);

      d.spotlight?.toggle();
      expect(d.spotlight?.isOpen()).toBe(true);

      d.spotlight?.toggle();
      expect(d.spotlight?.isOpen()).toBe(false);
    });
  });

  describe("search", () => {
    let d: DesktopInstanceWithSpotlight;

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());
    });

    it("returns items matching label", () => {
      const provider = createMockProvider("test", [
        createMockItem("1", "Calculator", "Apps"),
        createMockItem("2", "Calendar", "Apps"),
        createMockItem("3", "Notes", "Apps")
      ]);
      d.spotlight?.registerProvider(provider);

      const results = d.spotlight?.search("calc");

      expect(results).toHaveLength(1);
      expect(results?.[0].label).toBe("Calculator");
    });

    it("returns items matching description", () => {
      const item: SpotlightItem = {
        id: "1",
        label: "MyApp",
        category: "Apps",
        description: "A calculator app",
        action: () => {}
      };
      d.spotlight?.registerProvider(createMockProvider("test", [item]));

      const results = d.spotlight?.search("calculator");

      expect(results).toHaveLength(1);
      expect(results?.[0].id).toBe("1");
    });

    it("returns items matching keywords", () => {
      const item: SpotlightItem = {
        id: "1",
        label: "MyApp",
        category: "Apps",
        keywords: ["math", "numbers", "calc"],
        action: () => {}
      };
      d.spotlight?.registerProvider(createMockProvider("test", [item]));

      const results = d.spotlight?.search("math");

      expect(results).toHaveLength(1);
      expect(results?.[0].id).toBe("1");
    });

    it("search is case insensitive", () => {
      const provider = createMockProvider("test", [
        createMockItem("1", "Calculator", "Apps")
      ]);
      d.spotlight?.registerProvider(provider);

      expect(d.spotlight?.search("CALC")).toHaveLength(1);
      expect(d.spotlight?.search("Calc")).toHaveLength(1);
      expect(d.spotlight?.search("calc")).toHaveLength(1);
    });

    it("returns all items when query is empty", () => {
      const provider = createMockProvider("test", [
        createMockItem("1", "App1", "Apps"),
        createMockItem("2", "App2", "Apps"),
        createMockItem("3", "App3", "Apps")
      ]);
      d.spotlight?.registerProvider(provider);

      const results = d.spotlight?.search("");

      expect(results?.length).toBeGreaterThanOrEqual(3);
    });

    it("respects maxResults option", () => {
      const d2 = createDesktop() as DesktopInstanceWithSpotlight;
      d2.installPlugin(createSpotlightPlugin({ maxResults: 2 }));

      const provider = createMockProvider("test", [
        createMockItem("1", "App1", "Apps"),
        createMockItem("2", "App2", "Apps"),
        createMockItem("3", "App3", "Apps"),
        createMockItem("4", "App4", "Apps")
      ]);
      d2.spotlight?.registerProvider(provider);

      const results = d2.spotlight?.search("");

      expect(results).toHaveLength(2);
    });

    it("sorts exact matches first", () => {
      const provider = createMockProvider("test", [
        createMockItem("1", "Calculator Pro", "Apps"),
        createMockItem("2", "Calc", "Apps"),
        createMockItem("3", "Super Calculator", "Apps")
      ]);
      d.spotlight?.registerProvider(provider);

      const results = d.spotlight?.search("calc");

      expect(results?.[0].label).toBe("Calc");
    });

    it("sorts Apps category before Windows category", () => {
      const provider = createMockProvider("test", [
        createMockItem("1", "Alpha", "Windows"),
        createMockItem("2", "Beta", "Apps")
      ]);
      d.spotlight?.registerProvider(provider);

      const results = d.spotlight?.search("");

      const appIndex = results?.findIndex((r) => r.category === "Apps") ?? -1;
      const windowIndex = results?.findIndex((r) => r.category === "Windows") ?? -1;
      expect(appIndex).toBeLessThan(windowIndex);
    });
  });

  describe("built-in providers", () => {
    describe("apps provider", () => {
      it("returns empty when StartMenu not installed", () => {
        const d = createDesktop();
        const provider = createAppsProvider(d);

        const items = provider.getItems();

        expect(items).toHaveLength(0);
      });

      it("returns apps from StartMenu", () => {
        const d = createDesktop() as DesktopInstanceWithStartMenu;
        d.installPlugin(createStartMenuPlugin({
          apps: [
            {
              id: "app1",
              label: "Test App",
              icon: "📱",
              category: "Tools",
              factory: () => ({ type: "test", title: "Test", component: {} as never })
            }
          ]
        }));

        const provider = createAppsProvider(d);
        const items = provider.getItems();

        expect(items).toHaveLength(1);
        expect(items[0].id).toBe("app:app1");
        expect(items[0].label).toBe("Test App");
        expect(items[0].icon).toBe("📱");
        expect(items[0].category).toBe("Apps");
        expect(items[0].description).toBe("Tools");
      });
    });

    describe("windows provider", () => {
      it("returns open windows", () => {
        const d = createDesktop();
        d.createWindow({
          type: "test",
          title: "Test Window",
          icon: "📄",
          component: {} as never
        });

        const provider = createWindowsProvider(d);
        const items = provider.getItems();

        expect(items).toHaveLength(1);
        expect(items[0].label).toBe("Test Window");
        expect(items[0].icon).toBe("📄");
        expect(items[0].category).toBe("Windows");
      });

      it("returns empty when no windows open", () => {
        const d = createDesktop();
        const provider = createWindowsProvider(d);

        const items = provider.getItems();

        expect(items).toHaveLength(0);
      });

      it("includes minimized indicator in description", () => {
        const d = createDesktop();
        const win = d.createWindow({
          type: "test",
          title: "Test Window",
          component: {} as never
        });
        d.minimizeWindow(win.id!);

        const provider = createWindowsProvider(d);
        const items = provider.getItems();

        expect(items[0].description).toBe("Minimized");
      });
    });
  });

  describe("action execution", () => {
    it("apps provider action creates window", () => {
      const d = createDesktop() as DesktopInstanceWithStartMenu & DesktopInstanceWithSpotlight;
      let factoryCalled = false;

      d.installPlugin(createStartMenuPlugin({
        apps: [
          {
            id: "app1",
            label: "Test App",
            factory: () => {
              factoryCalled = true;
              return { type: "test", title: "New Window", component: {} as never };
            }
          }
        ]
      }));
      d.installPlugin(createSpotlightPlugin());

      const results = d.spotlight?.search("Test App");
      results?.[0].action();

      expect(factoryCalled).toBe(true);
      expect(d.windows).toHaveLength(1);
    });

    it("windows provider action focuses window", () => {
      const d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());

      const win1 = d.createWindow({ type: "test", title: "Window 1", component: {} as never });
      const win2 = d.createWindow({ type: "test", title: "Window 2", component: {} as never });

      expect(d.getFocusedWindowId()).toBe(win2.id);

      const results = d.spotlight?.search("Window 1");
      results?.[0].action();

      expect(d.getFocusedWindowId()).toBe(win1.id);
    });

    it("windows provider action restores minimized window", () => {
      const d = createDesktop() as DesktopInstanceWithSpotlight;
      d.installPlugin(createSpotlightPlugin());

      const win = d.createWindow({ type: "test", title: "Test Window", component: {} as never });
      d.minimizeWindow(win.id!);

      expect(d.getMode(win.id!)).toBe("minimized");

      const results = d.spotlight?.search("Test Window");
      results?.[0].action();

      expect(d.getMode(win.id!)).toBe("normal");
      expect(d.getFocusedWindowId()).toBe(win.id);
    });

    it("apps provider focuses existing singleton window", () => {
      const d = createDesktop() as DesktopInstanceWithStartMenu & DesktopInstanceWithSpotlight;
      let factoryCallCount = 0;

      d.installPlugin(createStartMenuPlugin({
        apps: [
          {
            id: "singleton-app",
            label: "Singleton App",
            factory: () => {
              factoryCallCount++;
              return {
                type: "test",
                title: "Singleton Window",
                singletonKey: "singleton",
                component: {} as never
              };
            }
          }
        ]
      }));
      d.installPlugin(createSpotlightPlugin());

      // First action creates window
      const results1 = d.spotlight?.search("Singleton");
      results1?.[0].action();
      expect(factoryCallCount).toBe(1);
      expect(d.windows).toHaveLength(1);
      const winId = d.windows[0].id;

      // Create another window to change focus
      d.createWindow({ type: "other", title: "Other", component: {} as never });
      expect(d.getFocusedWindowId()).not.toBe(winId);

      // Second action should focus existing, not create new
      const results2 = d.spotlight?.search("Singleton");
      results2?.[0].action();
      expect(factoryCallCount).toBe(2); // Factory called to check singletonKey
      expect(d.windows).toHaveLength(2); // Still only 2 windows
      expect(d.getFocusedWindowId()).toBe(winId); // Focused the singleton
    });
  });
});
