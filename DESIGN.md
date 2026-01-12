# Vue Desktop UI Library — Design & Requirements

This document is the authoritative design specification for a **Vue 3 + TypeScript** desktop-style window manager library with a **plugin-based architecture**.

---

## 0. Overview

### Library goal
Provide a **desktop-like UI abstraction** in the browser:
- Movable, resizable, closable windows
- Focus & z-index management
- Minimize / maximize / restore
- Keyboard and mouse interactions
- Extensibility via a plugin system (taskbar, shortcuts, snap, persistence, etc.)

The consuming application should:
- Only define the **contents** of windows
- Not manage window state, dragging, resizing, or z-order
- Add desktop features via plugins without bloating core

---

## 1. Non-Goals

- OS simulation (filesystem/process manager)
- Multi-user synchronized desktop (future)
- Forced UI framework (Tailwind not required)
- ExtJS-like monolithic widget suite (keep core lean)

---

## 2. Architecture Summary

### Major pieces
- **DesktopRoot** — root container; provides context, installs plugins, tracks viewport
- **DesktopInstance** — state + actions + event bus + hooks + registries
- **WindowHost** — renders windows, applies z-order and modes
- **WindowShell** — window chrome; handles drag/resize and emits actions
- **Plugin system** — add functionality (taskbar, shortcuts, snap, persistence)
- **UI registry** — plugins can mount taskbar and overlays

---

## 3. Core Data Model

### Bounds
```ts
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### WindowDefinition
```ts
export interface WindowDefinition<Props = any> {
  id?: string;
  type: string;
  title: string;
  component: Component;
  props?: Props;
  singletonKey?: string;
  icon?: string;
  initialBounds?: Partial<Bounds>;
  constraints?: WindowConstraints;
  behaviors?: WindowBehaviors;
  meta?: Record<string, any>;
}
```

---

## (Truncated for brevity in generation environment)
