import { describe, it, expect, vi } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import type { Plugin } from "../src/core/types";

describe("Plugin system", () => {
  describe("installPlugin", () => {
    it("installs a plugin and calls install()", () => {
      const d = createDesktop();
      const installFn = vi.fn();
      const plugin: Plugin = {
        name: "test-plugin",
        install: installFn
      };

      const result = d.installPlugin(plugin);

      expect(result).toBe(true);
      expect(installFn).toHaveBeenCalledWith(d);
      expect(installFn).toHaveBeenCalledTimes(1);
    });

    it("returns false when installing duplicate plugin", () => {
      const d = createDesktop();
      const plugin: Plugin = {
        name: "test-plugin",
        install: vi.fn()
      };

      d.installPlugin(plugin);
      const result = d.installPlugin(plugin);

      expect(result).toBe(false);
    });

    it("does not call install() for duplicate plugin", () => {
      const d = createDesktop();
      const installFn = vi.fn();
      const plugin: Plugin = {
        name: "test-plugin",
        install: installFn
      };

      d.installPlugin(plugin);
      d.installPlugin(plugin);

      expect(installFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("uninstallPlugin", () => {
    it("uninstalls a plugin and calls cleanup", () => {
      const d = createDesktop();
      const cleanupFn = vi.fn();
      const plugin: Plugin = {
        name: "test-plugin",
        install: () => cleanupFn
      };

      d.installPlugin(plugin);
      const result = d.uninstallPlugin("test-plugin");

      expect(result).toBe(true);
      expect(cleanupFn).toHaveBeenCalledTimes(1);
    });

    it("returns false for non-existent plugin", () => {
      const d = createDesktop();
      const result = d.uninstallPlugin("non-existent");
      expect(result).toBe(false);
    });

    it("works when plugin has no cleanup function", () => {
      const d = createDesktop();
      const plugin: Plugin = {
        name: "test-plugin",
        install: () => {} // no return
      };

      d.installPlugin(plugin);
      const result = d.uninstallPlugin("test-plugin");

      expect(result).toBe(true);
      expect(d.hasPlugin("test-plugin")).toBe(false);
    });
  });

  describe("hasPlugin", () => {
    it("returns true for installed plugin", () => {
      const d = createDesktop();
      const plugin: Plugin = {
        name: "test-plugin",
        install: () => {}
      };

      d.installPlugin(plugin);

      expect(d.hasPlugin("test-plugin")).toBe(true);
    });

    it("returns false for non-installed plugin", () => {
      const d = createDesktop();
      expect(d.hasPlugin("test-plugin")).toBe(false);
    });

    it("returns false after uninstall", () => {
      const d = createDesktop();
      const plugin: Plugin = {
        name: "test-plugin",
        install: () => {}
      };

      d.installPlugin(plugin);
      d.uninstallPlugin("test-plugin");

      expect(d.hasPlugin("test-plugin")).toBe(false);
    });
  });

  describe("plugin event integration", () => {
    it("plugin can subscribe to window events", () => {
      const d = createDesktop();
      const eventHandler = vi.fn();

      const plugin: Plugin = {
        name: "event-plugin",
        install: (desktop) => {
          return desktop.on("window:created", eventHandler);
        }
      };

      d.installPlugin(plugin);
      d.createWindow({ type: "t", title: "Test", component: {} as never });

      expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    it("plugin cleanup unsubscribes from events", () => {
      const d = createDesktop();
      const eventHandler = vi.fn();

      const plugin: Plugin = {
        name: "event-plugin",
        install: (desktop) => {
          return desktop.on("window:created", eventHandler);
        }
      };

      d.installPlugin(plugin);
      d.createWindow({ type: "t", title: "Test1", component: {} as never });
      expect(eventHandler).toHaveBeenCalledTimes(1);

      d.uninstallPlugin("event-plugin");
      d.createWindow({ type: "t", title: "Test2", component: {} as never });
      expect(eventHandler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it("plugin can access desktop API", () => {
      const d = createDesktop();
      let capturedDesktop: typeof d | null = null;

      const plugin: Plugin = {
        name: "api-plugin",
        install: (desktop) => {
          capturedDesktop = desktop;
          desktop.createWindow({ type: "t", title: "Plugin Window", component: {} as never });
        }
      };

      d.installPlugin(plugin);

      expect(capturedDesktop).toBe(d);
      expect(d.windows.length).toBe(1);
      expect(d.windows[0].title).toBe("Plugin Window");
    });
  });
});
