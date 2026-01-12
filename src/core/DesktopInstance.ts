import { WindowDefinition } from "./types";

type Listener = (payload?: unknown) => void;

export class DesktopInstance {
  private _windows: WindowDefinition[] = []
  private _zOrder: string[] = []
  private _listeners: Map<string, Listener[]> = new Map()

  get windows() {
    return this._windows.slice()
  }

  createWindow(def: WindowDefinition) {
    const id = def.id ?? cryptoRandomId()
    const win = { ...def, id }
    this._windows.push(win)
    this._zOrder.push(id)
    this.emit('window-created', win)
    return win
  }

  getWindow(id: string) {
    return this._windows.find((w) => w.id === id)
  }

  listWindows() {
    return this.windows
  }

  closeWindow(id: string) {
    const idx = this._windows.findIndex((w) => w.id === id)
    if (idx === -1) return false
    const [removed] = this._windows.splice(idx, 1)
    this._zOrder = this._zOrder.filter((z) => z !== id)
    this.emit('window-closed', removed)
    return true
  }

  focusWindow(id: string) {
    if (!this._zOrder.includes(id)) return false
    // move to top
    this._zOrder = this._zOrder.filter((z) => z !== id)
    this._zOrder.push(id)
    this.emit('window-focused', { id })
    return true
  }

  on(event: string, fn: Listener) {
    const arr = this._listeners.get(event) ?? []
    arr.push(fn)
    this._listeners.set(event, arr)
    return () => this.off(event, fn)
  }

  off(event: string, fn: Listener) {
    const arr = this._listeners.get(event) ?? []
    this._listeners.set(event, arr.filter((f) => f !== fn))
  }

  private emit(event: string, payload?: unknown) {
    const arr = this._listeners.get(event) ?? []
    for (const fn of arr) fn(payload)
  }
}

export const createDesktop = () => new DesktopInstance()

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 9)
}
