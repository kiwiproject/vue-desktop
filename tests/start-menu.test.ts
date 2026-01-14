import { describe, it, expect, beforeEach } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import {
  createStartMenuPlugin,
  type DesktopInstanceWithStartMenu,
  type StartMenuApp
} from "../src/plugins/start-menu";

describe("StartMenuPlugin", () => {
  const createMockApp = (id: string, category?: string): StartMenuApp => ({
    id,
    label: `App ${id}`,
    icon: "📄",
    category,
    factory: () => ({
      type: "test",
      title: `Test ${id}`,
      component: {} as never
    })
  });

  describe("installation", () => {
    it("installs successfully", () => {
      const d = createDesktop();
      const plugin = createStartMenuPlugin();

      const result = d.installPlugin(plugin);

      expect(result).toBe(true);
      expect(d.hasPlugin("start-menu")).toBe(true);
    });

    it("attaches startMenu API to desktop", () => {
      const d = createDesktop() as DesktopInstanceWithStartMenu;
      d.installPlugin(createStartMenuPlugin());

      expect(d.startMenu).toBeDefined();
      expect(typeof d.startMenu?.registerApp).toBe("function");
      expect(typeof d.startMenu?.unregisterApp).toBe("function");
      expect(typeof d.startMenu?.getApps).toBe("function");
      expect(typeof d.startMenu?.getAppsByCategory).toBe("function");
      expect(typeof d.startMenu?.open).toBe("function");
      expect(typeof d.startMenu?.close).toBe("function");
      expect(typeof d.startMenu?.toggle).toBe("function");
      expect(typeof d.startMenu?.isOpen).toBe("function");
    });

    it("registers initial apps from options", () => {
      const d = createDesktop() as DesktopInstanceWithStartMenu;
      const app1 = createMockApp("app1");
      const app2 = createMockApp("app2");

      d.installPlugin(createStartMenuPlugin({ apps: [app1, app2] }));

      expect(d.startMenu?.getApps()).toHaveLength(2);
      expect(d.startMenu?.getApps()[0].id).toBe("app1");
      expect(d.startMenu?.getApps()[1].id).toBe("app2");
    });
  });

  describe("uninstallation", () => {
    it("uninstalls successfully", () => {
      const d = createDesktop() as DesktopInstanceWithStartMenu;
      d.installPlugin(createStartMenuPlugin());

      const result = d.uninstallPlugin("start-menu");

      expect(result).toBe(true);
      expect(d.hasPlugin("start-menu")).toBe(false);
    });

    it("removes startMenu API on uninstall", () => {
      const d = createDesktop() as DesktopInstanceWithStartMenu;
      d.installPlugin(createStartMenuPlugin());

      d.uninstallPlugin("start-menu");

      expect(d.startMenu).toBeUndefined();
    });
  });

  describe("app registration", () => {
    let d: DesktopInstanceWithStartMenu;

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithStartMenu;
      d.installPlugin(createStartMenuPlugin());
    });

    it("registers an app", () => {
      const app = createMockApp("test-app");

      d.startMenu?.registerApp(app);

      expect(d.startMenu?.getApps()).toHaveLength(1);
      expect(d.startMenu?.getApps()[0].id).toBe("test-app");
    });

    it("returns unregister function", () => {
      const app = createMockApp("test-app");

      const unregister = d.startMenu?.registerApp(app);
      expect(d.startMenu?.getApps()).toHaveLength(1);

      unregister?.();
      expect(d.startMenu?.getApps()).toHaveLength(0);
    });

    it("prevents duplicate app registration", () => {
      const app1 = createMockApp("same-id");
      const app2 = createMockApp("same-id");

      d.startMenu?.registerApp(app1);
      d.startMenu?.registerApp(app2);

      expect(d.startMenu?.getApps()).toHaveLength(1);
    });

    it("unregisters app by id", () => {
      d.startMenu?.registerApp(createMockApp("app1"));
      d.startMenu?.registerApp(createMockApp("app2"));

      const result = d.startMenu?.unregisterApp("app1");

      expect(result).toBe(true);
      expect(d.startMenu?.getApps()).toHaveLength(1);
      expect(d.startMenu?.getApps()[0].id).toBe("app2");
    });

    it("returns false when unregistering non-existent app", () => {
      const result = d.startMenu?.unregisterApp("non-existent");

      expect(result).toBe(false);
    });
  });

  describe("getAppsByCategory", () => {
    let d: DesktopInstanceWithStartMenu;

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithStartMenu;
      d.installPlugin(createStartMenuPlugin());
    });

    it("groups apps by category", () => {
      d.startMenu?.registerApp(createMockApp("app1", "Games"));
      d.startMenu?.registerApp(createMockApp("app2", "Utilities"));
      d.startMenu?.registerApp(createMockApp("app3", "Games"));

      const byCategory = d.startMenu?.getAppsByCategory();

      expect(byCategory?.size).toBe(2);
      expect(byCategory?.get("Games")).toHaveLength(2);
      expect(byCategory?.get("Utilities")).toHaveLength(1);
    });

    it("puts uncategorized apps under undefined key", () => {
      d.startMenu?.registerApp(createMockApp("app1"));
      d.startMenu?.registerApp(createMockApp("app2", "Games"));

      const byCategory = d.startMenu?.getAppsByCategory();

      expect(byCategory?.get(undefined)).toHaveLength(1);
      expect(byCategory?.get("Games")).toHaveLength(1);
    });

    it("sorts categories alphabetically", () => {
      d.startMenu?.registerApp(createMockApp("app1", "Zebra"));
      d.startMenu?.registerApp(createMockApp("app2", "Alpha"));
      d.startMenu?.registerApp(createMockApp("app3", "Beta"));

      const byCategory = d.startMenu?.getAppsByCategory();
      const categories = Array.from(byCategory?.keys() ?? []);

      expect(categories).toEqual(["Alpha", "Beta", "Zebra"]);
    });

    it("puts categorized apps before uncategorized", () => {
      d.startMenu?.registerApp(createMockApp("app1")); // No category
      d.startMenu?.registerApp(createMockApp("app2", "Games"));

      const byCategory = d.startMenu?.getAppsByCategory();
      const categories = Array.from(byCategory?.keys() ?? []);

      expect(categories[0]).toBe("Games");
      expect(categories[1]).toBeUndefined();
    });
  });

  describe("menu state", () => {
    let d: DesktopInstanceWithStartMenu;

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithStartMenu;
      d.installPlugin(createStartMenuPlugin());
    });

    it("starts closed", () => {
      expect(d.startMenu?.isOpen()).toBe(false);
    });

    it("opens the menu", () => {
      d.startMenu?.open();

      expect(d.startMenu?.isOpen()).toBe(true);
    });

    it("closes the menu", () => {
      d.startMenu?.open();
      d.startMenu?.close();

      expect(d.startMenu?.isOpen()).toBe(false);
    });

    it("toggles the menu", () => {
      expect(d.startMenu?.isOpen()).toBe(false);

      d.startMenu?.toggle();
      expect(d.startMenu?.isOpen()).toBe(true);

      d.startMenu?.toggle();
      expect(d.startMenu?.isOpen()).toBe(false);
    });
  });

  describe("window creation", () => {
    it("app factory creates windows correctly", () => {
      const d = createDesktop() as DesktopInstanceWithStartMenu;
      d.installPlugin(createStartMenuPlugin());

      let factoryCalled = false;
      const app: StartMenuApp = {
        id: "test",
        label: "Test App",
        factory: () => {
          factoryCalled = true;
          return {
            type: "test",
            title: "Test Window",
            component: {} as never
          };
        }
      };

      d.startMenu?.registerApp(app);
      const apps = d.startMenu?.getApps();
      const windowDef = apps?.[0].factory();

      expect(factoryCalled).toBe(true);
      expect(windowDef?.type).toBe("test");
      expect(windowDef?.title).toBe("Test Window");
    });
  });
});
