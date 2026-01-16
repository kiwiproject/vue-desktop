# Types

## Core Types

### WindowDefinition

Defines a window's configuration.

```ts
interface WindowDefinition {
  id?: string
  type: string
  title: string
  component: Component
  props?: Record<string, unknown>
  initialBounds?: Bounds
  singletonKey?: string
  meta?: Record<string, unknown>
  menuBar?: MenuBarDefinition
}
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string?` | Unique ID (auto-generated if omitted) |
| `type` | `string` | Window type identifier |
| `title` | `string` | Window title |
| `component` | `Component` | Vue component to render |
| `props` | `object?` | Props passed to component |
| `initialBounds` | `Bounds?` | Initial position and size |
| `singletonKey` | `string?` | Key for singleton windows |
| `meta` | `object?` | Custom metadata |
| `menuBar` | `MenuBarDefinition?` | Window menu bar |

---

### Bounds

Position and size of a window.

```ts
interface Bounds {
  x: number
  y: number
  width: number
  height: number
}
```

---

### WindowMode

Window display mode.

```ts
type WindowMode = 'normal' | 'minimized' | 'maximized'
```

---

### Plugin

Plugin interface for extending the desktop.

```ts
interface Plugin {
  name: string
  install(desktop: DesktopInstance): void | (() => void)
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Unique plugin identifier |
| `install` | `function` | Called when plugin is installed. Can return cleanup function. |

---

### UIRegistration

Registration for UI components in slots.

```ts
interface UIRegistration {
  id: string
  slot: string
  component: Component
  props?: Record<string, unknown>
  order?: number
}
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique registration ID |
| `slot` | `string` | Slot name ('taskbar', 'overlay', etc.) |
| `component` | `Component` | Vue component to render |
| `props` | `object?` | Props passed to component |
| `order` | `number?` | Sort order within slot (lower = first) |

---

## Menu Bar Types

### MenuBarDefinition

Array of menu bar menus.

```ts
type MenuBarDefinition = MenuBarMenu[]
```

---

### MenuBarMenu

A single menu in the menu bar.

```ts
interface MenuBarMenu {
  label: string
  items: MenuBarItem[] | (() => MenuBarItem[])
}
```

---

### MenuBarItem

An item within a menu.

```ts
type MenuBarItem =
  | MenuBarActionItem
  | MenuBarSubmenuItem
  | MenuBarSeparator

interface MenuBarActionItem {
  type?: 'item'
  label: string
  shortcut?: string
  action: () => void
  disabled?: boolean
}

interface MenuBarSubmenuItem {
  type?: 'submenu'
  label: string
  items: MenuBarItem[]
}

interface MenuBarSeparator {
  type: 'separator'
}
```

---

## Shortcut Types

### ShortcutDefinition

Defines a keyboard shortcut.

```ts
interface ShortcutDefinition {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
}
```

---

## Context Menu Types

### ContextMenuItem

An item in a context menu.

```ts
type ContextMenuItem =
  | ContextMenuActionItem
  | ContextMenuSubmenuItem
  | ContextMenuSeparator

interface ContextMenuActionItem {
  type?: 'item'
  label: string
  icon?: string
  shortcut?: string
  action: () => void
  disabled?: boolean
}

interface ContextMenuSubmenuItem {
  type: 'submenu'
  label: string
  icon?: string
  items: ContextMenuItem[]
}

interface ContextMenuSeparator {
  type: 'separator'
}
```

---

## Spotlight Types

### SpotlightProvider

A search provider for Spotlight.

```ts
interface SpotlightProvider {
  id: string
  name: string
  search(query: string): SpotlightResult[] | Promise<SpotlightResult[]>
}

interface SpotlightResult {
  id: string
  label: string
  description?: string
  icon?: string
  category?: string
  action: () => void
}
```

---

## Persistence Types

### PersistencePluginOptions

Options for the persistence plugin.

```ts
interface PersistencePluginOptions {
  storageKey?: string
  debounceMs?: number
  persistBounds?: boolean
  persistMode?: boolean
  persistZOrder?: boolean
  persistSession?: boolean
  storage?: StorageAdapter
  getWindowKey?: (windowId: string, type: string, singletonKey?: string) => string
  windowFactory?: (info: PersistedWindowInfo) => WindowDefinition | null
}
```

### StorageAdapter

Custom storage adapter interface.

```ts
interface StorageAdapter {
  load(): PersistedState | null
  save(state: PersistedState): void
  clear(): void
}
```

---

## Snap Types

### SnapOptions

Options for the snap plugin.

```ts
interface SnapOptions {
  threshold?: number
  edgeSnap?: boolean
  windowSnap?: boolean
  gridSnap?: boolean
  gridSize?: number
}
```

---

## Start Menu Types

### StartMenuApp

An application in the start menu.

```ts
interface StartMenuApp {
  id: string
  label: string
  icon?: string
  category?: string
  shortcut?: string
  action: () => void
}
```
