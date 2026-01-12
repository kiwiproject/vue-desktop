import { shallowRef, provide, inject, type InjectionKey, type ShallowRef } from "vue";
import { WindowDefinition, Bounds } from "./types";

type Listener = (payload?: unknown) => void;

export const DESKTOP_KEY: InjectionKey<DesktopInstance> = Symbol("vue-desktop");

export class DesktopInstance {
  private _windows: ShallowRef<WindowDefinition[]>;
  private _zOrder: ShallowRef<string[]>;
  private _listeners: Map<string, Listener[]> = new Map();

  constructor() {
    this._windows = shallowRef([]);
    this._zOrder = shallowRef([]);
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
    this.emit("window-created", win);
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
    this.emit("window-closed", removed);
    return true;
  }

  focusWindow(id: string) {
    if (!this._zOrder.value.includes(id)) return false;
    // move to top
    this._zOrder.value = [...this._zOrder.value.filter((z) => z !== id), id];
    this.emit("window-focused", { id });
    return true;
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
