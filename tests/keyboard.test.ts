import { describe, it, expect } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";

describe("Keyboard and focus management", () => {
  describe("getFocusedWindowId", () => {
    it("returns undefined when no windows exist", () => {
      const d = createDesktop();
      expect(d.getFocusedWindowId()).toBeUndefined();
    });

    it("returns the last window in zOrder (topmost)", () => {
      const d = createDesktop();
      d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      expect(d.getFocusedWindowId()).toBe(winB.id);
    });

    it("returns focused window after focusWindow call", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      d.createWindow({ type: "t", title: "B", component: {} as never });
      d.focusWindow(winA.id!);
      expect(d.getFocusedWindowId()).toBe(winA.id);
    });
  });

  describe("cycleFocus (MRU order)", () => {
    it("returns false when no windows exist", () => {
      const d = createDesktop();
      expect(d.cycleFocus()).toBe(false);
    });

    it("Alt+Tab goes to previous window (second most recent)", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      // zOrder = [A, B], B is focused (most recent)
      expect(d.getFocusedWindowId()).toBe(winB.id);
      // Alt+Tab should go to A (second most recent)
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winA.id);
    });

    it("Alt+Tab swaps between two most recent windows", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      // zOrder = [A, B], B focused
      expect(d.getFocusedWindowId()).toBe(winB.id);
      // Alt+Tab -> A, zOrder = [B, A]
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winA.id);
      // Alt+Tab -> B, zOrder = [A, B]
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winB.id);
    });

    it("Alt+Tab with three windows goes to second most recent", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      const winC = d.createWindow({ type: "t", title: "C", component: {} as never });
      // zOrder = [A, B, C], C is focused
      expect(d.getFocusedWindowId()).toBe(winC.id);
      // Alt+Tab should go to B (second most recent)
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winB.id);
      // zOrder is now [A, C, B]
      // Alt+Tab should go to C (second most recent)
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winC.id);
    });

    it("Alt+Shift+Tab goes to less recently used (forward in zOrder)", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      const winC = d.createWindow({ type: "t", title: "C", component: {} as never });
      // zOrder = [A, B, C], C focused
      // Alt+Shift+Tab should wrap to A (least recent)
      d.cycleFocus(true);
      expect(d.getFocusedWindowId()).toBe(winA.id);
    });

    it("Alt+Shift+Tab cycles through in reverse MRU", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      // zOrder = [A, B], B focused
      // Alt+Shift+Tab wraps to A (since B is last, going forward wraps to first)
      d.cycleFocus(true);
      expect(d.getFocusedWindowId()).toBe(winA.id);
      // zOrder = [B, A], A focused
      // Alt+Shift+Tab wraps to B
      d.cycleFocus(true);
      expect(d.getFocusedWindowId()).toBe(winB.id);
    });

    it("skips minimized windows", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      const winC = d.createWindow({ type: "t", title: "C", component: {} as never });
      // zOrder = [A, B, C], C focused
      // Minimize B
      d.minimizeWindow(winB.id!);
      // nonMinimized = [A, C]
      // Alt+Tab should skip B and go to A
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winA.id);
    });

    it("returns false when all windows are minimized", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      d.minimizeWindow(winA.id!);
      d.minimizeWindow(winB.id!);
      expect(d.cycleFocus()).toBe(false);
    });

    it("wraps around when at the oldest window", () => {
      const d = createDesktop();
      const winA = d.createWindow({ type: "t", title: "A", component: {} as never });
      const winB = d.createWindow({ type: "t", title: "B", component: {} as never });
      // Focus A so it's most recent: zOrder = [B, A]
      d.focusWindow(winA.id!);
      expect(d.getFocusedWindowId()).toBe(winA.id);
      // Alt+Tab goes to B: zOrder = [A, B]
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winB.id);
      // Alt+Tab goes back to A: zOrder = [B, A]
      d.cycleFocus();
      expect(d.getFocusedWindowId()).toBe(winA.id);
    });
  });
});
