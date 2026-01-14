import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import {
  createPersistencePlugin,
  createMemoryStorageAdapter,
  createChainedAdapter,
  type DesktopInstanceWithPersistence
} from "../src/plugins/persistence";

describe("createMemoryStorageAdapter", () => {
  it("starts with null data", () => {
    const adapter = createMemoryStorageAdapter();
    expect(adapter.load()).toBe(null);
  });

  it("saves and loads data", () => {
    const adapter = createMemoryStorageAdapter();
    const state = { windows: { "win-1": { bounds: { x: 10, y: 20, width: 100, height: 100 } } } };

    adapter.save(state);

    expect(adapter.load()).toEqual(state);
  });

  it("clears data", () => {
    const adapter = createMemoryStorageAdapter();
    adapter.save({ windows: {} });

    adapter.clear();

    expect(adapter.load()).toBe(null);
  });

  it("deep clones data on save", () => {
    const adapter = createMemoryStorageAdapter();
    const state = { windows: { "win-1": { bounds: { x: 10, y: 20, width: 100, height: 100 } } } };

    adapter.save(state);
    state.windows["win-1"].bounds!.x = 999;

    expect(adapter.load()?.windows["win-1"].bounds?.x).toBe(10);
  });
});

describe("createChainedAdapter", () => {
  it("load returns first non-null result", () => {
    const adapter1 = createMemoryStorageAdapter();
    const adapter2 = createMemoryStorageAdapter();
    const chained = createChainedAdapter(adapter1, adapter2);

    // Both empty
    expect(chained.load()).toBe(null);

    // Second has data
    adapter2.save({ windows: { "win-2": {} } });
    expect(chained.load()?.windows["win-2"]).toBeDefined();

    // First has data - should return first
    adapter1.save({ windows: { "win-1": {} } });
    expect(chained.load()?.windows["win-1"]).toBeDefined();
    expect(chained.load()?.windows["win-2"]).toBeUndefined();
  });

  it("save writes to all adapters", () => {
    const adapter1 = createMemoryStorageAdapter();
    const adapter2 = createMemoryStorageAdapter();
    const chained = createChainedAdapter(adapter1, adapter2);

    chained.save({ windows: { "win-1": { bounds: { x: 10, y: 20, width: 100, height: 100 } } } });

    expect(adapter1.load()?.windows["win-1"]).toBeDefined();
    expect(adapter2.load()?.windows["win-1"]).toBeDefined();
  });

  it("clear clears all adapters", () => {
    const adapter1 = createMemoryStorageAdapter();
    const adapter2 = createMemoryStorageAdapter();
    const chained = createChainedAdapter(adapter1, adapter2);

    adapter1.save({ windows: { "win-1": {} } });
    adapter2.save({ windows: { "win-2": {} } });

    chained.clear();

    expect(adapter1.load()).toBe(null);
    expect(adapter2.load()).toBe(null);
  });

  it("works with single adapter", () => {
    const adapter = createMemoryStorageAdapter();
    const chained = createChainedAdapter(adapter);

    chained.save({ windows: { "win-1": {} } });
    expect(chained.load()?.windows["win-1"]).toBeDefined();

    chained.clear();
    expect(chained.load()).toBe(null);
  });

  it("works with no adapters", () => {
    const chained = createChainedAdapter();

    expect(chained.load()).toBe(null);
    chained.save({ windows: {} }); // Should not throw
    chained.clear(); // Should not throw
  });
});

describe("PersistencePlugin", () => {
  let storage: ReturnType<typeof createMemoryStorageAdapter>;

  beforeEach(() => {
    storage = createMemoryStorageAdapter();
  });

  describe("installation", () => {
    it("installs successfully", () => {
      const d = createDesktop();
      const plugin = createPersistencePlugin({ storage, debounceMs: 0 });

      const result = d.installPlugin(plugin);

      expect(result).toBe(true);
      expect(d.hasPlugin("persistence")).toBe(true);
    });

    it("attaches persistence API to desktop", () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      expect(d.persistence).toBeDefined();
      expect(typeof d.persistence?.save).toBe("function");
      expect(typeof d.persistence?.load).toBe("function");
      expect(typeof d.persistence?.clear).toBe("function");
      expect(typeof d.persistence?.getWindowState).toBe("function");
      expect(typeof d.persistence?.isEnabled).toBe("function");
      expect(typeof d.persistence?.setEnabled).toBe("function");
    });
  });

  describe("uninstallation", () => {
    it("uninstalls successfully", () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      const result = d.uninstallPlugin("persistence");

      expect(result).toBe(true);
      expect(d.hasPlugin("persistence")).toBe(false);
    });

    it("removes persistence API on uninstall", () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      d.uninstallPlugin("persistence");

      expect(d.persistence).toBeUndefined();
    });
  });

  describe("bounds persistence", () => {
    it("persists window bounds on update", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never,
        initialBounds: { x: 0, y: 0, width: 200, height: 150 }
      });

      d.updateBounds(win.id!, { x: 100, y: 50, width: 300, height: 200 });

      // Wait for debounce
      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save(); // Force immediate save

      const state = d.persistence?.getWindowState(win.id!);
      expect(state?.bounds).toEqual({ x: 100, y: 50, width: 300, height: 200 });
    });

    it("restores window bounds from persisted state", async () => {
      // Pre-populate storage with persisted state
      storage.save({
        windows: {
          "persisted-win": { bounds: { x: 200, y: 100, width: 400, height: 300 } }
        }
      });

      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          getWindowKey: (id) => "persisted-win" // Always use same key
        })
      );

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never,
        initialBounds: { x: 0, y: 0, width: 200, height: 150 }
      });

      // Wait for async restoration
      await new Promise((r) => setTimeout(r, 10));

      const bounds = d.getBounds(win.id!);
      expect(bounds).toEqual({ x: 200, y: 100, width: 400, height: 300 });
    });
  });

  describe("mode persistence", () => {
    it("persists maximized mode", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      d.maximizeWindow(win.id!);

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const state = d.persistence?.getWindowState(win.id!);
      expect(state?.mode).toBe("maximized");
    });

    it("persists minimized mode", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      d.minimizeWindow(win.id!);

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const state = d.persistence?.getWindowState(win.id!);
      expect(state?.mode).toBe("minimized");
    });

    it("persists restored mode", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      d.maximizeWindow(win.id!);
      d.restoreWindow(win.id!);

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const state = d.persistence?.getWindowState(win.id!);
      expect(state?.mode).toBe("normal");
    });
  });

  describe("persistence API", () => {
    it("can enable and disable persistence", () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      expect(d.persistence?.isEnabled()).toBe(true);

      d.persistence?.setEnabled(false);
      expect(d.persistence?.isEnabled()).toBe(false);

      d.persistence?.setEnabled(true);
      expect(d.persistence?.isEnabled()).toBe(true);
    });

    it("does not persist when disabled", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      // Create window first
      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      // Clear any initial state, then disable
      d.persistence?.clear();
      d.persistence?.setEnabled(false);

      // Now update bounds - should not be persisted
      d.updateBounds(win.id!, { x: 100, y: 50, width: 300, height: 200 });

      await new Promise((r) => setTimeout(r, 10));

      // State should not have been updated since persistence was disabled
      const state = storage.getData();
      expect(state).toBe(null);
    });

    it("can manually clear state", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(createPersistencePlugin({ storage, debounceMs: 0 }));

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      d.updateBounds(win.id!, { x: 100, y: 50, width: 300, height: 200 });
      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      d.persistence?.clear();

      expect(storage.getData()).toBe(null);
    });
  });

  describe("custom window key", () => {
    it("uses singletonKey when provided", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          getWindowKey: (_id, _type, singletonKey) => singletonKey ?? null
        })
      );

      const win = d.createWindow({
        type: "settings",
        title: "Settings",
        component: {} as never,
        singletonKey: "settings-window"
      });

      d.updateBounds(win.id!, { x: 100, y: 50, width: 300, height: 200 });

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const data = storage.getData();
      expect(data?.windows["settings-window"]).toBeDefined();
      expect(data?.windows[win.id!]).toBeUndefined();
    });

    it("skips persistence when getWindowKey returns null", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          getWindowKey: () => null // Never persist
        })
      );

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      d.updateBounds(win.id!, { x: 100, y: 50, width: 300, height: 200 });

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const data = storage.getData();
      expect(Object.keys(data?.windows ?? {})).toHaveLength(0);
    });
  });

  describe("selective persistence", () => {
    it("can disable bounds persistence", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistBounds: false,
          persistMode: true
        })
      );

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      d.updateBounds(win.id!, { x: 100, y: 50, width: 300, height: 200 });
      d.maximizeWindow(win.id!);

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const state = d.persistence?.getWindowState(win.id!);
      expect(state?.bounds).toBeUndefined();
      expect(state?.mode).toBe("maximized");
    });

    it("can disable mode persistence", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistBounds: true,
          persistMode: false
        })
      );

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never
      });

      d.updateBounds(win.id!, { x: 100, y: 50, width: 300, height: 200 });
      d.maximizeWindow(win.id!);

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const state = d.persistence?.getWindowState(win.id!);
      expect(state?.bounds).toBeDefined();
      expect(state?.mode).toBeUndefined();
    });
  });

  describe("session restoration", () => {
    it("tracks open windows when persistSession is true", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: true,
          windowFactory: () => null
        })
      );

      d.createWindow({
        type: "editor",
        title: "Editor 1",
        component: {} as never
      });

      d.createWindow({
        type: "browser",
        title: "Browser",
        component: {} as never
      });

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const data = storage.getData();
      expect(data?.openWindows).toHaveLength(2);
      expect(data?.openWindows?.[0].type).toBe("editor");
      expect(data?.openWindows?.[0].title).toBe("Editor 1");
      expect(data?.openWindows?.[1].type).toBe("browser");
    });

    it("removes windows from list on close", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: true,
          windowFactory: () => null
        })
      );

      const win1 = d.createWindow({
        type: "editor",
        title: "Editor 1",
        component: {} as never
      });

      d.createWindow({
        type: "browser",
        title: "Browser",
        component: {} as never
      });

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      // Close first window
      d.closeWindow(win1.id!);

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const data = storage.getData();
      expect(data?.openWindows).toHaveLength(1);
      expect(data?.openWindows?.[0].type).toBe("browser");
    });

    it("restores session with windowFactory", async () => {
      // Pre-populate storage with persisted session
      storage.save({
        windows: {
          "win-1": { bounds: { x: 100, y: 50, width: 400, height: 300 } },
          "win-2": { bounds: { x: 200, y: 100, width: 300, height: 200 } }
        },
        openWindows: [
          { key: "win-1", type: "editor", title: "Editor 1" },
          { key: "win-2", type: "browser", title: "Browser" }
        ]
      });

      const d = createDesktop() as DesktopInstanceWithPersistence;
      const mockComponent = {} as never;

      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: true,
          windowFactory: (info) => ({
            type: info.type,
            title: info.title,
            component: mockComponent,
            props: info.props
          })
        })
      );

      // Restore session
      d.persistence?.restoreSession();

      // Wait for async operations
      await new Promise((r) => setTimeout(r, 50));

      expect(d.windows).toHaveLength(2);
      expect(d.windows[0].type).toBe("editor");
      expect(d.windows[0].title).toBe("Editor 1");
      expect(d.windows[1].type).toBe("browser");
      expect(d.windows[1].title).toBe("Browser");

      // Check bounds were restored
      const bounds1 = d.getBounds(d.windows[0].id!);
      expect(bounds1).toEqual({ x: 100, y: 50, width: 400, height: 300 });
    });

    it("does not restore if persistSession is false", () => {
      storage.save({
        windows: {},
        openWindows: [{ key: "win-1", type: "editor", title: "Editor 1" }]
      });

      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: false,
          windowFactory: () => ({ type: "test", title: "Test", component: {} as never })
        })
      );

      d.persistence?.restoreSession();

      expect(d.windows).toHaveLength(0);
    });

    it("does not restore if windowFactory is not provided", () => {
      storage.save({
        windows: {},
        openWindows: [{ key: "win-1", type: "editor", title: "Editor 1" }]
      });

      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: true
          // No windowFactory
        })
      );

      d.persistence?.restoreSession();

      expect(d.windows).toHaveLength(0);
    });

    it("skips windows that factory returns null for", async () => {
      storage.save({
        windows: {},
        openWindows: [
          { key: "win-1", type: "supported", title: "Supported" },
          { key: "win-2", type: "unsupported", title: "Unsupported" }
        ]
      });

      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: true,
          windowFactory: (info) => {
            if (info.type === "supported") {
              return { type: info.type, title: info.title, component: {} as never };
            }
            return null; // Unsupported type
          }
        })
      );

      d.persistence?.restoreSession();

      await new Promise((r) => setTimeout(r, 10));

      expect(d.windows).toHaveLength(1);
      expect(d.windows[0].type).toBe("supported");
    });

    it("skips windows that already exist", async () => {
      storage.save({
        windows: {},
        openWindows: [{ key: "singleton-settings", type: "settings", title: "Settings", singletonKey: "settings" }]
      });

      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: true,
          getWindowKey: (_id, _type, singletonKey) => (singletonKey ? `singleton-${singletonKey}` : _id),
          windowFactory: (info) => ({
            type: info.type,
            title: info.title,
            component: {} as never,
            singletonKey: info.singletonKey
          })
        })
      );

      // Create window before restore
      d.createWindow({
        type: "settings",
        title: "Settings",
        component: {} as never,
        singletonKey: "settings"
      });

      await new Promise((r) => setTimeout(r, 10));

      d.persistence?.restoreSession();

      await new Promise((r) => setTimeout(r, 10));

      // Should still only have 1 window (not duplicated)
      expect(d.windows).toHaveLength(1);
    });

    it("persists window props and meta", async () => {
      const d = createDesktop() as DesktopInstanceWithPersistence;
      d.installPlugin(
        createPersistencePlugin({
          storage,
          debounceMs: 0,
          persistSession: true,
          windowFactory: () => null
        })
      );

      d.createWindow({
        type: "editor",
        title: "Editor",
        component: {} as never,
        props: { filePath: "/path/to/file.txt", readOnly: true },
        meta: { lastSaved: "2024-01-01" }
      });

      await new Promise((r) => setTimeout(r, 10));
      d.persistence?.save();

      const data = storage.getData();
      expect(data?.openWindows?.[0].props).toEqual({ filePath: "/path/to/file.txt", readOnly: true });
      expect(data?.openWindows?.[0].meta).toEqual({ lastSaved: "2024-01-01" });
    });
  });
});
