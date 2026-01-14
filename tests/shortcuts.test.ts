import { describe, it, expect, vi } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import {
  createShortcutsPlugin,
  ShortcutsPlugin,
  parseShortcut,
  matchesShortcut,
  type DesktopInstanceWithShortcuts
} from "../src/plugins/shortcuts";

describe("parseShortcut", () => {
  it("parses simple key", () => {
    const result = parseShortcut("escape");
    expect(result).toEqual({
      key: "escape",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false
    });
  });

  it("parses ctrl+key", () => {
    const result = parseShortcut("ctrl+w");
    expect(result).toEqual({
      key: "w",
      ctrl: true,
      alt: false,
      shift: false,
      meta: false
    });
  });

  it("parses multiple modifiers", () => {
    const result = parseShortcut("ctrl+shift+n");
    expect(result).toEqual({
      key: "n",
      ctrl: true,
      alt: false,
      shift: true,
      meta: false
    });
  });

  it("parses alt+key", () => {
    const result = parseShortcut("alt+f4");
    expect(result).toEqual({
      key: "f4",
      ctrl: false,
      alt: true,
      shift: false,
      meta: false
    });
  });

  it("parses meta/cmd key", () => {
    const result = parseShortcut("meta+w");
    expect(result).toEqual({
      key: "w",
      ctrl: false,
      alt: false,
      shift: false,
      meta: true
    });
  });

  it("handles case insensitivity", () => {
    const result = parseShortcut("CTRL+SHIFT+N");
    expect(result).toEqual({
      key: "n",
      ctrl: true,
      alt: false,
      shift: true,
      meta: false
    });
  });
});

describe("matchesShortcut", () => {
  const createKeyboardEvent = (
    key: string,
    modifiers: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean } = {}
  ): KeyboardEvent => {
    return {
      key,
      ctrlKey: modifiers.ctrl ?? false,
      altKey: modifiers.alt ?? false,
      shiftKey: modifiers.shift ?? false,
      metaKey: modifiers.meta ?? false
    } as KeyboardEvent;
  };

  it("matches simple key", () => {
    const shortcut = parseShortcut("escape");
    const event = createKeyboardEvent("Escape");
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("matches ctrl+key", () => {
    const shortcut = parseShortcut("ctrl+w");
    const event = createKeyboardEvent("w", { ctrl: true });
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("does not match when modifier is missing", () => {
    const shortcut = parseShortcut("ctrl+w");
    const event = createKeyboardEvent("w");
    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("does not match when extra modifier is present", () => {
    const shortcut = parseShortcut("ctrl+w");
    const event = createKeyboardEvent("w", { ctrl: true, shift: true });
    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("matches function keys", () => {
    const shortcut = parseShortcut("f4");
    const event = createKeyboardEvent("F4");
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });
});

describe("ShortcutsPlugin", () => {
  describe("installation", () => {
    it("installs successfully", () => {
      const d = createDesktop();
      const plugin = createShortcutsPlugin({ target: undefined });

      const result = d.installPlugin(plugin);

      expect(result).toBe(true);
      expect(d.hasPlugin("shortcuts")).toBe(true);
    });

    it("attaches shortcuts API to desktop", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined });

      d.installPlugin(plugin);

      expect(d.shortcuts).toBeDefined();
      expect(typeof d.shortcuts?.register).toBe("function");
      expect(typeof d.shortcuts?.unregister).toBe("function");
      expect(typeof d.shortcuts?.setEnabled).toBe("function");
      expect(typeof d.shortcuts?.getShortcuts).toBe("function");
    });

    it("registers default shortcuts when defaults=true", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined, defaults: true });

      d.installPlugin(plugin);

      const shortcuts = d.shortcuts?.getShortcuts() ?? [];
      expect(shortcuts.length).toBeGreaterThan(0);
      expect(shortcuts.some((s) => s.id === "close-window")).toBe(true);
      expect(shortcuts.some((s) => s.id === "toggle-maximize")).toBe(true);
      expect(shortcuts.some((s) => s.id === "minimize-window")).toBe(true);
    });

    it("does not register default shortcuts when defaults=false", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined, defaults: false });

      d.installPlugin(plugin);

      const shortcuts = d.shortcuts?.getShortcuts() ?? [];
      expect(shortcuts.length).toBe(0);
    });
  });

  describe("uninstallation", () => {
    it("uninstalls successfully", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined });
      d.installPlugin(plugin);

      const result = d.uninstallPlugin("shortcuts");

      expect(result).toBe(true);
      expect(d.hasPlugin("shortcuts")).toBe(false);
    });

    it("removes shortcuts API on uninstall", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined });
      d.installPlugin(plugin);

      d.uninstallPlugin("shortcuts");

      expect(d.shortcuts).toBeUndefined();
    });
  });

  describe("shortcut registration", () => {
    it("registers custom shortcuts", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined, defaults: false });
      d.installPlugin(plugin);

      const handler = vi.fn();
      d.shortcuts?.register({
        id: "custom",
        keys: "ctrl+k",
        handler
      });

      const shortcuts = d.shortcuts?.getShortcuts() ?? [];
      expect(shortcuts.some((s) => s.id === "custom")).toBe(true);
    });

    it("unregisters shortcuts", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined, defaults: false });
      d.installPlugin(plugin);

      d.shortcuts?.register({
        id: "custom",
        keys: "ctrl+k",
        handler: () => {}
      });

      const result = d.shortcuts?.unregister("custom");

      expect(result).toBe(true);
      const shortcuts = d.shortcuts?.getShortcuts() ?? [];
      expect(shortcuts.some((s) => s.id === "custom")).toBe(false);
    });

    it("returns unregister function from register", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined, defaults: false });
      d.installPlugin(plugin);

      const unregister = d.shortcuts?.register({
        id: "custom",
        keys: "ctrl+k",
        handler: () => {}
      });

      unregister?.();

      const shortcuts = d.shortcuts?.getShortcuts() ?? [];
      expect(shortcuts.some((s) => s.id === "custom")).toBe(false);
    });

    it("enables and disables shortcuts", () => {
      const d = createDesktop() as DesktopInstanceWithShortcuts;
      const plugin = createShortcutsPlugin({ target: undefined, defaults: false });
      d.installPlugin(plugin);

      d.shortcuts?.register({
        id: "custom",
        keys: "ctrl+k",
        handler: () => {}
      });

      d.shortcuts?.setEnabled("custom", false);
      let shortcuts = d.shortcuts?.getShortcuts() ?? [];
      expect(shortcuts.find((s) => s.id === "custom")?.enabled).toBe(false);

      d.shortcuts?.setEnabled("custom", true);
      shortcuts = d.shortcuts?.getShortcuts() ?? [];
      expect(shortcuts.find((s) => s.id === "custom")?.enabled).toBe(true);
    });
  });
});

describe("Default shortcuts behavior", () => {
  it("close-window shortcut closes focused window", () => {
    const d = createDesktop() as DesktopInstanceWithShortcuts;
    const plugin = createShortcutsPlugin({ target: undefined, defaults: true });
    d.installPlugin(plugin);

    const win = d.createWindow({ type: "t", title: "Test", component: {} as never });
    expect(d.windows).toHaveLength(1);

    // Simulate the shortcut handler
    const closeShortcut = d.shortcuts?.getShortcuts().find((s) => s.id === "close-window");
    closeShortcut?.handler(d);

    expect(d.windows).toHaveLength(0);
  });

  it("toggle-maximize shortcut toggles maximize", () => {
    const d = createDesktop() as DesktopInstanceWithShortcuts;
    const plugin = createShortcutsPlugin({ target: undefined, defaults: true });
    d.installPlugin(plugin);

    const win = d.createWindow({ type: "t", title: "Test", component: {} as never });
    expect(d.getMode(win.id!)).toBe("normal");

    const toggleShortcut = d.shortcuts?.getShortcuts().find((s) => s.id === "toggle-maximize");

    // Maximize
    toggleShortcut?.handler(d);
    expect(d.getMode(win.id!)).toBe("maximized");

    // Restore
    toggleShortcut?.handler(d);
    expect(d.getMode(win.id!)).toBe("normal");
  });

  it("minimize-window shortcut minimizes focused window", () => {
    const d = createDesktop() as DesktopInstanceWithShortcuts;
    const plugin = createShortcutsPlugin({ target: undefined, defaults: true });
    d.installPlugin(plugin);

    const win = d.createWindow({ type: "t", title: "Test", component: {} as never });
    expect(d.getMode(win.id!)).toBe("normal");

    const minimizeShortcut = d.shortcuts?.getShortcuts().find((s) => s.id === "minimize-window");
    minimizeShortcut?.handler(d);

    expect(d.getMode(win.id!)).toBe("minimized");
  });

  it("respects window behaviors for close", () => {
    const d = createDesktop() as DesktopInstanceWithShortcuts;
    const plugin = createShortcutsPlugin({ target: undefined, defaults: true });
    d.installPlugin(plugin);

    d.createWindow({
      type: "t",
      title: "Test",
      component: {} as never,
      behaviors: { closable: false }
    });

    const closeShortcut = d.shortcuts?.getShortcuts().find((s) => s.id === "close-window");
    closeShortcut?.handler(d);

    // Window should still exist because closable is false
    expect(d.windows).toHaveLength(1);
  });
});
