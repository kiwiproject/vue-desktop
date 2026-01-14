import { describe, it, expect } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import { TaskbarPlugin } from "../src/plugins/taskbar";

describe("TaskbarPlugin", () => {
  describe("installation", () => {
    it("installs successfully", () => {
      const d = createDesktop();

      const result = d.installPlugin(TaskbarPlugin);

      expect(result).toBe(true);
      expect(d.hasPlugin("taskbar")).toBe(true);
    });

    it("registers UI in taskbar slot", () => {
      const d = createDesktop();

      d.installPlugin(TaskbarPlugin);

      const registrations = d.getUIForSlot("taskbar");
      expect(registrations).toHaveLength(1);
      expect(registrations[0].id).toBe("taskbar-main");
    });

    it("prevents duplicate installation", () => {
      const d = createDesktop();

      d.installPlugin(TaskbarPlugin);
      const result = d.installPlugin(TaskbarPlugin);

      expect(result).toBe(false);
    });
  });

  describe("uninstallation", () => {
    it("uninstalls successfully", () => {
      const d = createDesktop();
      d.installPlugin(TaskbarPlugin);

      const result = d.uninstallPlugin("taskbar");

      expect(result).toBe(true);
      expect(d.hasPlugin("taskbar")).toBe(false);
    });

    it("removes UI registration on uninstall", () => {
      const d = createDesktop();
      d.installPlugin(TaskbarPlugin);

      d.uninstallPlugin("taskbar");

      const registrations = d.getUIForSlot("taskbar");
      expect(registrations).toHaveLength(0);
    });
  });
});

describe("Taskbar behavior", () => {
  describe("window list", () => {
    it("desktop tracks windows that can be displayed in taskbar", () => {
      const d = createDesktop();
      d.installPlugin(TaskbarPlugin);

      d.createWindow({ type: "t", title: "Window A", component: {} as never });
      d.createWindow({ type: "t", title: "Window B", component: {} as never });

      expect(d.windows).toHaveLength(2);
    });
  });

  describe("focus behavior", () => {
    it("focusing a window makes it the focused window", () => {
      const d = createDesktop();
      d.installPlugin(TaskbarPlugin);

      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      d.createWindow({ type: "t", title: "B", component: {} as never });

      d.focusWindow(winA.id!);

      expect(d.getFocusedWindowId()).toBe(winA.id);
    });
  });

  describe("minimize/restore behavior", () => {
    it("minimizing a focused window minimizes it", () => {
      const d = createDesktop();
      d.installPlugin(TaskbarPlugin);

      const win = d.createWindow({ type: "t", title: "A", component: {} as never });
      expect(d.getFocusedWindowId()).toBe(win.id);

      d.minimizeWindow(win.id!);

      expect(d.getMode(win.id!)).toBe("minimized");
    });

    it("restoring a minimized window restores it", () => {
      const d = createDesktop();
      d.installPlugin(TaskbarPlugin);

      const win = d.createWindow({ type: "t", title: "A", component: {} as never });
      d.minimizeWindow(win.id!);

      d.restoreWindow(win.id!);

      expect(d.getMode(win.id!)).toBe("normal");
    });
  });

  describe("window icons", () => {
    it("windows can have custom icons", () => {
      const d = createDesktop();

      const win = d.createWindow({
        type: "t",
        title: "A",
        component: {} as never,
        icon: "📄"
      });

      expect(d.getWindow(win.id!)?.icon).toBe("📄");
    });
  });
});
