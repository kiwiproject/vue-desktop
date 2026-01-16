import { shallowRef, provide, inject, triggerRef, type InjectionKey, type ShallowRef } from "vue";
import { WindowDefinition, Bounds, WindowMode, Plugin, UIRegistration } from "./types";

type Listener = (payload?: unknown) => void;

export const DESKTOP_KEY: InjectionKey<DesktopInstance> = Symbol("vue-desktop");

export class DesktopInstance {
  private _windows: ShallowRef<WindowDefinition[]>;
  private _zOrder: ShallowRef<string[]>;
  private _bounds: ShallowRef<Map<string, Bounds>>;
  private _modes: ShallowRef<Map<string, WindowMode>>;
  private _restoreBounds: Map<string, Bounds> = new Map();
  private _listeners: Map<string, Listener[]> = new Map();
  private _plugins: Map<string, (() => void) | undefined> = new Map();
  private _uiRegistry: ShallowRef<UIRegistration[]>;
  private _switcherActive: ShallowRef<boolean>;
  private _switcherSelectedId: ShallowRef<string | null>;

  constructor() {
    this._windows = shallowRef([]);
    this._zOrder = shallowRef([]);
    this._bounds = shallowRef(new Map());
    this._modes = shallowRef(new Map());
    this._uiRegistry = shallowRef([]);
    this._switcherActive = shallowRef(false);
    this._switcherSelectedId = shallowRef(null);
  }

  get windows(): WindowDefinition[] {
    return this._windows.value;
  }

  get zOrder(): string[] {
    return this._zOrder.value;
  }

  createWindow(def: WindowDefinition) {
    const id = def.id ?? cryptoRandomId();
    const bounds: Bounds = {
      x: def.initialBounds?.x ?? 100,
      y: def.initialBounds?.y ?? 100,
      width: def.initialBounds?.width ?? 400,
      height: def.initialBounds?.height ?? 300
    };
    const win: WindowDefinition = { ...def, id, initialBounds: bounds };
    this._windows.value = [...this._windows.value, win];
    this._zOrder.value = [...this._zOrder.value, id];
    this.emit("window:created", win);
    return win;
  }

  getWindow(id: string) {
    return this._windows.value.find((w) => w.id === id);
  }

  listWindows() {
    return this.windows;
  }

  closeWindow(id: string) {
    const idx = this._windows.value.findIndex((w) => w.id === id);
    if (idx === -1) return false;
    const removed = this._windows.value[idx];
    this._windows.value = this._windows.value.filter((w) => w.id !== id);
    this._zOrder.value = this._zOrder.value.filter((z) => z !== id);
    this.emit("window:closed", { windowId: id, window: removed });
    return true;
  }

  focusWindow(id: string) {
    if (!this._zOrder.value.includes(id)) return false;
    // Emit blur event for previously focused window
    const previouslyFocused = this.getFocusedWindowId();
    if (previouslyFocused && previouslyFocused !== id) {
      this.emit("window:blurred", { windowId: previouslyFocused });
    }
    // move to top
    this._zOrder.value = [...this._zOrder.value.filter((z) => z !== id), id];
    this.emit("window:focused", { windowId: id });
    return true;
  }

  getBounds(id: string): Bounds | undefined {
    const win = this.getWindow(id);
    if (!win) return undefined;
    return this._bounds.value.get(id) ?? (win.initialBounds as Bounds);
  }

  updateBounds(id: string, bounds: Bounds) {
    const win = this.getWindow(id);
    if (!win) return false;
    const oldBounds = this.getBounds(id);
    this._bounds.value.set(id, bounds);
    triggerRef(this._bounds);
    this.emit("window:bounds", { windowId: id, bounds, oldBounds });
    return true;
  }

  getMode(id: string): WindowMode {
    return this._modes.value.get(id) ?? "normal";
  }

  minimizeWindow(id: string) {
    const win = this.getWindow(id);
    if (!win) return false;
    this._modes.value.set(id, "minimized");
    triggerRef(this._modes);
    this.emit("window:minimized", { windowId: id });
    return true;
  }

  maximizeWindow(id: string) {
    const win = this.getWindow(id);
    if (!win) return false;
    const currentMode = this.getMode(id);
    if (currentMode === "normal") {
      const currentBounds = this.getBounds(id);
      if (currentBounds) {
        this._restoreBounds.set(id, currentBounds);
      }
    }
    this._modes.value.set(id, "maximized");
    triggerRef(this._modes);
    this.emit("window:maximized", { windowId: id });
    return true;
  }

  restoreWindow(id: string) {
    const win = this.getWindow(id);
    if (!win) return false;
    const restoreBounds = this._restoreBounds.get(id);
    if (restoreBounds) {
      this._bounds.value.set(id, restoreBounds);
      triggerRef(this._bounds);
    }
    this._modes.value.set(id, "normal");
    triggerRef(this._modes);
    this.emit("window:restored", { windowId: id });
    return true;
  }

  getFocusedWindowId(): string | undefined {
    const zOrder = this._zOrder.value;
    if (zOrder.length === 0) return undefined;
    return zOrder[zOrder.length - 1];
  }

  cycleFocus(reverse = false) {
    // zOrder is [oldest...newest], so we traverse backwards for MRU order
    const nonMinimized = this._zOrder.value.filter(
      (id) => this.getMode(id) !== "minimized"
    );
    if (nonMinimized.length === 0) return false;

    const currentId = this.getFocusedWindowId();
    const currentIndex = currentId ? nonMinimized.indexOf(currentId) : -1;

    let nextIndex: number;
    if (currentIndex === -1) {
      // No current focus, select most recent (last) or oldest (first)
      nextIndex = reverse ? 0 : nonMinimized.length - 1;
    } else if (reverse) {
      // Alt+Shift+Tab: go to less recently used (forward in array)
      nextIndex = currentIndex === nonMinimized.length - 1 ? 0 : currentIndex + 1;
    } else {
      // Alt+Tab: go to more recently used (backward in array)
      nextIndex = currentIndex === 0 ? nonMinimized.length - 1 : currentIndex - 1;
    }

    const nextId = nonMinimized[nextIndex];
    return this.focusWindow(nextId);
  }

  // Window Switcher
  get switcherActive(): boolean {
    return this._switcherActive.value;
  }

  get switcherSelectedId(): string | null {
    return this._switcherSelectedId.value;
  }

  getSwitcherWindows(): WindowDefinition[] {
    // Return non-minimized windows in MRU order (most recent last)
    const nonMinimizedIds = this._zOrder.value.filter(
      (id) => this.getMode(id) !== "minimized"
    );
    // Reverse to get MRU first
    return nonMinimizedIds
      .slice()
      .reverse()
      .map((id) => this.getWindow(id)!)
      .filter(Boolean);
  }

  openSwitcher(): void {
    const windows = this.getSwitcherWindows();
    if (windows.length === 0) return;

    this._switcherActive.value = true;
    // Select the second window (first in MRU after current) if available, else first
    this._switcherSelectedId.value = windows.length > 1 ? windows[1].id! : windows[0].id!;
    triggerRef(this._switcherActive);
    triggerRef(this._switcherSelectedId);
  }

  closeSwitcher(commit = true): void {
    if (!this._switcherActive.value) return;

    const selectedId = this._switcherSelectedId.value;
    this._switcherActive.value = false;
    this._switcherSelectedId.value = null;
    triggerRef(this._switcherActive);
    triggerRef(this._switcherSelectedId);

    if (commit && selectedId) {
      this.focusWindow(selectedId);
    }
  }

  cycleSwitcherSelection(reverse = false): void {
    if (!this._switcherActive.value) return;

    const windows = this.getSwitcherWindows();
    if (windows.length === 0) return;

    const currentIndex = windows.findIndex((w) => w.id === this._switcherSelectedId.value);
    let nextIndex: number;

    if (currentIndex === -1) {
      nextIndex = 0;
    } else if (reverse) {
      nextIndex = currentIndex === 0 ? windows.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === windows.length - 1 ? 0 : currentIndex + 1;
    }

    this._switcherSelectedId.value = windows[nextIndex].id!;
    triggerRef(this._switcherSelectedId);
  }

  // Plugin management
  installPlugin(plugin: Plugin): boolean {
    if (this._plugins.has(plugin.name)) {
      return false;
    }
    const cleanup = plugin.install(this);
    this._plugins.set(plugin.name, cleanup ?? undefined);
    return true;
  }

  uninstallPlugin(name: string): boolean {
    if (!this._plugins.has(name)) {
      return false;
    }
    const cleanup = this._plugins.get(name);
    if (cleanup) {
      cleanup();
    }
    this._plugins.delete(name);
    return true;
  }

  hasPlugin(name: string): boolean {
    return this._plugins.has(name);
  }

  // UI Registry
  registerUI(registration: UIRegistration): () => void {
    this._uiRegistry.value = [...this._uiRegistry.value, registration];
    triggerRef(this._uiRegistry);
    return () => this.unregisterUI(registration.id);
  }

  unregisterUI(id: string): boolean {
    const idx = this._uiRegistry.value.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this._uiRegistry.value = this._uiRegistry.value.filter((r) => r.id !== id);
    triggerRef(this._uiRegistry);
    return true;
  }

  getUIForSlot(slot: string): UIRegistration[] {
    return this._uiRegistry.value
      .filter((r) => r.slot === slot)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  on(event: string, fn: Listener) {
    const arr = this._listeners.get(event) ?? [];
    arr.push(fn);
    this._listeners.set(event, arr);
    return () => this.off(event, fn);
  }

  off(event: string, fn: Listener) {
    const arr = this._listeners.get(event) ?? [];
    this._listeners.set(
      event,
      arr.filter((f) => f !== fn)
    );
  }

  private emit(event: string, payload?: unknown) {
    const arr = this._listeners.get(event) ?? [];
    for (const fn of arr) fn(payload);
  }
}

export const createDesktop = () => new DesktopInstance();

export function provideDesktop(instance: DesktopInstance) {
  provide(DESKTOP_KEY, instance);
}

export function useDesktop(): DesktopInstance {
  const instance = inject(DESKTOP_KEY);
  if (!instance) {
    throw new Error(
      "useDesktop() called without a DesktopInstance provided. Make sure to call provideDesktop() in a parent component."
    );
  }
  return instance;
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 9);
}
