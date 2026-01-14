import { describe, it, expect } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";

describe("Window Switcher", () => {
  describe("getSwitcherWindows", () => {
    it("returns empty array when no windows", () => {
      const d = createDesktop();
      expect(d.getSwitcherWindows()).toEqual([]);
    });

    it("returns non-minimized windows in MRU order", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      const winC = d.createWindow({ type: "t", title: "C", component: {} as never });

      // zOrder = [A, B, C], C is most recent
      const windows = d.getSwitcherWindows();
      expect(windows.map((w) => w.id)).toEqual([winC.id, winB.id, winA.id]);
    });

    it("excludes minimized windows", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      const winC = d.createWindow({ type: "t", title: "C", component: {} as never });

      d.minimizeWindow(winB.id!);

      const windows = d.getSwitcherWindows();
      expect(windows.map((w) => w.id)).toEqual([winC.id, winA.id]);
    });
  });

  describe("openSwitcher", () => {
    it("sets switcherActive to true", () => {
      const d = createDesktop();
      d.createWindow({ type: "t", title: "A", component: {} as never });

      d.openSwitcher();

      expect(d.switcherActive).toBe(true);
    });

    it("selects the second window (previous in MRU) when available", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });

      // MRU order: B (current), A (previous)
      d.openSwitcher();

      expect(d.switcherSelectedId).toBe(winA.id);
    });

    it("selects the only window when just one exists", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });

      d.openSwitcher();

      expect(d.switcherSelectedId).toBe(winA.id);
    });

    it("does nothing when no windows exist", () => {
      const d = createDesktop();

      d.openSwitcher();

      expect(d.switcherActive).toBe(false);
      expect(d.switcherSelectedId).toBe(null);
    });
  });

  describe("closeSwitcher", () => {
    it("sets switcherActive to false", () => {
      const d = createDesktop();
      d.createWindow({ type: "t", title: "A", component: {} as never });
      d.openSwitcher();

      d.closeSwitcher();

      expect(d.switcherActive).toBe(false);
    });

    it("clears switcherSelectedId", () => {
      const d = createDesktop();
      d.createWindow({ type: "t", title: "A", component: {} as never });
      d.openSwitcher();

      d.closeSwitcher();

      expect(d.switcherSelectedId).toBe(null);
    });

    it("focuses selected window when commit=true", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      d.createWindow({ type: "t", title: "B", component: {} as never });

      d.openSwitcher();
      expect(d.switcherSelectedId).toBe(winA.id);

      d.closeSwitcher(true);

      expect(d.getFocusedWindowId()).toBe(winA.id);
    });

    it("does not change focus when commit=false", () => {
      const d = createDesktop();
      d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });

      // B is currently focused
      expect(d.getFocusedWindowId()).toBe(winB.id);

      d.openSwitcher();
      d.closeSwitcher(false);

      // Focus should still be B (wasn't changed)
      expect(d.getFocusedWindowId()).toBe(winB.id);
    });
  });

  describe("cycleSwitcherSelection", () => {
    it("cycles forward through windows", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      const winC = d.createWindow({ type: "t", title: "C", component: {} as never });

      // MRU order: C, B, A
      d.openSwitcher();
      expect(d.switcherSelectedId).toBe(winB.id); // Second in MRU

      d.cycleSwitcherSelection();
      expect(d.switcherSelectedId).toBe(winA.id);

      d.cycleSwitcherSelection();
      expect(d.switcherSelectedId).toBe(winC.id); // Wraps around
    });

    it("cycles backward through windows", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      const winC = d.createWindow({ type: "t", title: "C", component: {} as never });

      // MRU order: C, B, A
      d.openSwitcher();
      expect(d.switcherSelectedId).toBe(winB.id); // Second in MRU

      d.cycleSwitcherSelection(true); // reverse
      expect(d.switcherSelectedId).toBe(winC.id);

      d.cycleSwitcherSelection(true);
      expect(d.switcherSelectedId).toBe(winA.id); // Wraps around
    });

    it("does nothing when switcher is not active", () => {
      const d = createDesktop();
      d.createWindow({ type: "t", title: "A", component: {} as never });

      d.cycleSwitcherSelection();

      expect(d.switcherSelectedId).toBe(null);
    });
  });
});
