import { describe, it, expect } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";

describe("Window mode management", () => {
  it("defaults to normal mode", () => {
    const d = createDesktop();
    const win = d.createWindow({ type: "t", title: "A", component: {} as never });
    expect(d.getMode(win.id!)).toBe("normal");
  });

  it("minimizes a window", () => {
    const d = createDesktop();
    const win = d.createWindow({ type: "t", title: "A", component: {} as never });
    const result = d.minimizeWindow(win.id!);
    expect(result).toBe(true);
    expect(d.getMode(win.id!)).toBe("minimized");
  });

  it("maximizes a window", () => {
    const d = createDesktop();
    const win = d.createWindow({ type: "t", title: "A", component: {} as never });
    const result = d.maximizeWindow(win.id!);
    expect(result).toBe(true);
    expect(d.getMode(win.id!)).toBe("maximized");
  });

  it("restores a minimized window", () => {
    const d = createDesktop();
    const win = d.createWindow({ type: "t", title: "A", component: {} as never });
    d.minimizeWindow(win.id!);
    const result = d.restoreWindow(win.id!);
    expect(result).toBe(true);
    expect(d.getMode(win.id!)).toBe("normal");
  });

  it("restores a maximized window to previous bounds", () => {
    const d = createDesktop();
    const win = d.createWindow({
      type: "t",
      title: "A",
      component: {} as never,
      initialBounds: { x: 50, y: 50, width: 300, height: 200 }
    });

    const originalBounds = d.getBounds(win.id!);
    expect(originalBounds).toEqual({ x: 50, y: 50, width: 300, height: 200 });

    d.maximizeWindow(win.id!);
    expect(d.getMode(win.id!)).toBe("maximized");

    d.restoreWindow(win.id!);
    expect(d.getMode(win.id!)).toBe("normal");

    const restoredBounds = d.getBounds(win.id!);
    expect(restoredBounds).toEqual({ x: 50, y: 50, width: 300, height: 200 });
  });

  it("emits window:minimized event", () => {
    const d = createDesktop();
    const win = d.createWindow({ type: "t", title: "A", component: {} as never });
    let emitted: unknown = null;
    d.on("window:minimized", (payload) => {
      emitted = payload;
    });
    d.minimizeWindow(win.id!);
    expect(emitted).toEqual({ windowId: win.id });
  });

  it("emits window:maximized event", () => {
    const d = createDesktop();
    const win = d.createWindow({ type: "t", title: "A", component: {} as never });
    let emitted: unknown = null;
    d.on("window:maximized", (payload) => {
      emitted = payload;
    });
    d.maximizeWindow(win.id!);
    expect(emitted).toEqual({ windowId: win.id });
  });

  it("emits window:restored event", () => {
    const d = createDesktop();
    const win = d.createWindow({ type: "t", title: "A", component: {} as never });
    d.minimizeWindow(win.id!);
    let emitted: unknown = null;
    d.on("window:restored", (payload) => {
      emitted = payload;
    });
    d.restoreWindow(win.id!);
    expect(emitted).toEqual({ windowId: win.id });
  });

  it("returns false for non-existent window", () => {
    const d = createDesktop();
    expect(d.minimizeWindow("non-existent")).toBe(false);
    expect(d.maximizeWindow("non-existent")).toBe(false);
    expect(d.restoreWindow("non-existent")).toBe(false);
    expect(d.getMode("non-existent")).toBe("normal");
  });
});
