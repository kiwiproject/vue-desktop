# Vue Desktop

[![CI](https://github.com/kiwiproject/vue-desktop/actions/workflows/ci.yml/badge.svg)](https://github.com/kiwiproject/vue-desktop/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@kiwiproject/vue-desktop.svg)](https://www.npmjs.com/package/@kiwiproject/vue-desktop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight Vue 3 + TypeScript desktop-style window manager library with a plugin-based architecture.

**[Documentation](https://kiwiproject.github.io/vue-desktop/)** | **[Live Demo](https://kiwiproject.github.io/vue-desktop/demo/)**

## Features

- **Draggable & Resizable Windows** — Move windows by title bar, resize from any edge or corner
- **Window States** — Minimize, maximize, restore with smooth transitions
- **Focus Management** — Click-to-focus, z-order stacking, Alt+Tab window switching
- **Plugin Architecture** — Extend functionality without bloating core
- **Session Persistence** — Save and restore window state across page reloads
- **Keyboard Shortcuts** — Configurable global shortcuts
- **Window Snapping** — Snap to edges, other windows, and grid
- **Start Menu & Spotlight** — Quick app launching and search

## Installation

```bash
npm install @kiwiproject/vue-desktop
# or
pnpm add @kiwiproject/vue-desktop
```

## Quick Start

```vue
<template>
  <div class="desktop-container">
    <WindowHost />
    <UISlot name="taskbar" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import {
  createDesktop,
  provideDesktop,
  WindowHost,
  UISlot,
  TaskbarPlugin
} from '@kiwiproject/vue-desktop'
import '@kiwiproject/vue-desktop/styles.css'

// Create a simple window component
const MyWindow = defineComponent({
  props: { message: String },
  setup(props) {
    return () => h('div', props.message)
  }
})

// Create desktop instance
const desktop = createDesktop()

// Install plugins
desktop.installPlugin(TaskbarPlugin)

// Provide to child components
provideDesktop(desktop)

// Create a window
desktop.createWindow({
  type: 'my-window',
  title: 'Hello World',
  component: MyWindow,
  props: { message: 'Welcome!' },
  initialBounds: { x: 100, y: 100, width: 400, height: 300 }
})
</script>

<style>
.desktop-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>
```

## Core API

### `createDesktop()`

Creates a new desktop instance that manages windows and plugins.

```ts
import { createDesktop } from '@kiwiproject/vue-desktop'

const desktop = createDesktop()
```

### `provideDesktop(desktop)` / `useDesktop()`

Vue provide/inject pattern for accessing the desktop instance in child components.

```ts
// In parent component
provideDesktop(desktop)

// In child component
const desktop = useDesktop()
```

### Desktop Instance Methods

```ts
// Window management
desktop.createWindow(definition)     // Create a new window
desktop.closeWindow(id)              // Close a window
desktop.getWindow(id)                // Get window by ID
desktop.windows                      // Array of all windows

// Focus management
desktop.focusWindow(id)              // Focus a window
desktop.getFocusedWindowId()         // Get focused window ID
desktop.cycleFocus(reverse?)         // Cycle through windows

// Window modes
desktop.minimizeWindow(id)           // Minimize
desktop.maximizeWindow(id)           // Maximize
desktop.restoreWindow(id)            // Restore from min/max
desktop.getMode(id)                  // Get current mode

// Bounds
desktop.getBounds(id)                // Get window bounds
desktop.updateBounds(id, bounds)     // Update window bounds

// Plugins
desktop.installPlugin(plugin)        // Install a plugin
desktop.uninstallPlugin(name)        // Uninstall a plugin
desktop.hasPlugin(name)              // Check if plugin installed

// UI Registry
desktop.registerUI(registration)     // Register UI component
desktop.unregisterUI(id)             // Unregister UI component
desktop.getUIForSlot(slot)           // Get UIs for a slot

// Events
desktop.on(event, handler)           // Subscribe to events
desktop.off(event, handler)          // Unsubscribe from events
desktop.emit(event, payload)         // Emit an event
```

### Window Definition

```ts
interface WindowDefinition {
  id?: string                        // Auto-generated if not provided
  type: string                       // Window type identifier
  title: string                      // Window title
  component: Component               // Vue component to render
  props?: Record<string, any>        // Props for the component
  icon?: string                      // Icon (emoji or URL)
  singletonKey?: string              // Unique key for singleton windows
  initialBounds?: Partial<Bounds>    // Initial position and size
  constraints?: WindowConstraints    // Min/max size constraints
  behaviors?: WindowBehaviors        // Draggable, resizable, etc.
  meta?: Record<string, any>         // Custom metadata
}

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

interface WindowConstraints {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

interface WindowBehaviors {
  draggable?: boolean    // Default: true
  resizable?: boolean    // Default: true
  closable?: boolean     // Default: true
  minimizable?: boolean  // Default: true
  maximizable?: boolean  // Default: true
}
```

### Components

#### `<WindowHost />`

Renders all windows managed by the desktop instance. Place this inside your desktop container.

```vue
<template>
  <div class="desktop">
    <WindowHost />
  </div>
</template>
```

#### `<UISlot name="slot-name" />`

Renders UI components registered to a specific slot by plugins.

```vue
<template>
  <div class="desktop">
    <WindowHost />
    <UISlot name="taskbar" />
    <UISlot name="overlay" />
  </div>
</template>
```

## Plugins

### TaskbarPlugin

Displays a taskbar showing all open windows with click-to-focus/minimize behavior.

```ts
import { TaskbarPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(TaskbarPlugin)
```

The taskbar automatically appears at the bottom of the desktop. Requires `<UISlot name="taskbar" />`.

### ShortcutsPlugin

Provides global keyboard shortcuts.

```ts
import { createShortcutsPlugin } from '@kiwiproject/vue-desktop'

// With default shortcuts
desktop.installPlugin(createShortcutsPlugin())

// Or customize
desktop.installPlugin(createShortcutsPlugin({
  defaults: false  // Disable default shortcuts
}))

// Register custom shortcuts
desktop.shortcuts.register({
  id: 'my-shortcut',
  keys: 'ctrl+shift+n',
  description: 'Create new window',
  handler: (desktop) => {
    desktop.createWindow({ /* ... */ })
  }
})
```

**Default shortcuts:**
- `Ctrl+W` — Close focused window
- `Ctrl+M` — Minimize focused window
- `Ctrl+Shift+F` — Toggle maximize

**API:**
```ts
desktop.shortcuts.register(definition)   // Register shortcut
desktop.shortcuts.unregister(id)         // Unregister shortcut
desktop.shortcuts.setEnabled(id, bool)   // Enable/disable
desktop.shortcuts.getShortcuts()         // List all shortcuts
```

### SnapPlugin

Enables window snapping to edges, other windows, and grid.

```ts
import { createSnapPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(createSnapPlugin({
  edges: true,           // Snap to viewport edges
  windows: true,         // Snap to other windows
  grid: 20,              // Snap to 20px grid (0 to disable)
  threshold: 10,         // Snap distance in pixels
  getViewport: () => ({  // Custom viewport bounds
    x: 0, y: 0,
    width: window.innerWidth,
    height: window.innerHeight - 48  // Account for taskbar
  })
}))
```

**API:**
```ts
desktop.snap.setEnabled(bool)     // Enable/disable snapping
desktop.snap.isEnabled()          // Check if enabled
desktop.snap.setOptions(options)  // Update options
desktop.snap.getOptions()         // Get current options
```

### PersistencePlugin

Saves and restores window state to localStorage (or custom storage).

```ts
import { createPersistencePlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(createPersistencePlugin({
  storageKey: 'my-app-desktop',
  debounceMs: 500,           // Debounce saves
  persistSession: true,      // Save open windows for restore
  windowFactory: (info) => { // Factory for restoring windows
    return {
      type: info.type,
      title: info.title,
      component: getComponentByType(info.type),
      props: info.props
    }
  }
}))

// Restore session on app start
onMounted(() => {
  desktop.persistence.restoreSession()
})
```

**API:**
```ts
desktop.persistence.save()              // Force save
desktop.persistence.load()              // Load state
desktop.persistence.clear()             // Clear saved state
desktop.persistence.restoreSession()    // Restore windows
desktop.persistence.getWindowState(id)  // Get specific window state
desktop.persistence.setEnabled(bool)    // Enable/disable
desktop.persistence.isEnabled()         // Check if enabled
```

**Custom Storage Adapter:**
```ts
import { createPersistencePlugin, createChainedAdapter } from '@kiwiproject/vue-desktop'

// Chain multiple adapters (first successful load wins, all get saves)
const adapter = createChainedAdapter(
  myServerAdapter,
  createLocalStorageAdapter('fallback-key')
)

desktop.installPlugin(createPersistencePlugin({
  adapter
}))
```

### StartMenuPlugin

Adds a Start menu button to the taskbar for launching apps.

```ts
import { createStartMenuPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(createStartMenuPlugin({
  buttonLabel: 'Start',
  buttonIcon: '🪟',
  apps: [
    {
      id: 'notepad',
      label: 'Notepad',
      icon: '📝',
      category: 'Utilities',
      shortcut: 'Ctrl+N',
      factory: () => ({
        type: 'notepad',
        title: 'Notepad',
        component: NotepadComponent,
        singletonKey: 'notepad'  // Only one instance
      })
    }
  ]
}))
```

**API:**
```ts
desktop.startMenu.registerApp(app)       // Register app
desktop.startMenu.unregisterApp(id)      // Unregister app
desktop.startMenu.getApps()              // Get all apps
desktop.startMenu.getAppsByCategory()    // Get apps grouped by category
desktop.startMenu.open()                 // Open menu
desktop.startMenu.close()                // Close menu
desktop.startMenu.toggle()               // Toggle menu
desktop.startMenu.isOpen()               // Check if open
```

### SpotlightPlugin

Adds a Spotlight-style search dialog (Cmd/Ctrl+K).

```ts
import { createSpotlightPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(createSpotlightPlugin({
  placeholder: 'Search apps and windows...',
  maxResults: 10
}))
```

Requires `<UISlot name="overlay" />` in your template.

**Built-in providers:**
- Apps from StartMenu plugin
- Open windows

**Custom providers:**
```ts
desktop.spotlight.registerProvider({
  id: 'my-provider',
  getItems: () => [
    {
      id: 'action-1',
      label: 'Do Something',
      icon: '⚡',
      category: 'Actions',
      description: 'Performs an action',
      keywords: ['action', 'do'],
      action: () => { /* ... */ }
    }
  ]
})
```

**API:**
```ts
desktop.spotlight.open()                    // Open spotlight
desktop.spotlight.close()                   // Close spotlight
desktop.spotlight.toggle()                  // Toggle spotlight
desktop.spotlight.isOpen()                  // Check if open
desktop.spotlight.search(query)             // Programmatic search
desktop.spotlight.registerProvider(p)       // Add custom provider
desktop.spotlight.unregisterProvider(id)    // Remove provider
desktop.spotlight.getProviders()            // List providers
```

## Creating Custom Plugins

Plugins are objects with a `name` and `install` function:

```ts
import type { Plugin, DesktopInstance } from '@kiwiproject/vue-desktop'

const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop: DesktopInstance) {
    // Subscribe to events
    desktop.on('window:created', (win) => {
      console.log('Window created:', win.title)
    })

    // Register UI components
    const unregisterUI = desktop.registerUI({
      id: 'my-status-bar',
      slot: 'overlay',
      component: MyStatusBar,
      order: 100
    })

    // Attach API to desktop instance
    ;(desktop as any).myPlugin = {
      doSomething() { /* ... */ }
    }

    // Return cleanup function
    return () => {
      unregisterUI()
      delete (desktop as any).myPlugin
    }
  }
}

// Usage
desktop.installPlugin(MyPlugin)
```

**Available events:**
- `window:created` — Window created
- `window:closed` — Window closed
- `window:focused` — Window focused
- `window:blurred` — Window lost focus
- `window:moved` — Window position changed
- `window:resized` — Window size changed
- `window:minimized` — Window minimized
- `window:maximized` — Window maximized
- `window:restored` — Window restored

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Spotlight search |
| `Alt + Tab` | Switch between windows |
| `Ctrl + W` | Close focused window |
| `Ctrl + M` | Minimize focused window |
| `Ctrl + Shift + F` | Toggle maximize |
| `Escape` | Close dialogs |

## Styling

Import the default styles:

```ts
import '@kiwiproject/vue-desktop/styles.css'
```

All classes are prefixed with `vd-` for easy customization:

- `.vd-window-shell` — Window container
- `.vd-window-header` — Title bar
- `.vd-window-body` — Content area
- `.vd-window-focused` — Focused window state
- `.vd-taskbar` — Taskbar container
- `.vd-spotlight-overlay` — Spotlight backdrop

## TypeScript

Full TypeScript support with exported types:

```ts
import type {
  // Core
  Bounds,
  WindowDefinition,
  WindowConstraints,
  WindowBehaviors,
  WindowMode,
  Plugin,
  UIRegistration,

  // Plugins
  ShortcutDefinition,
  SnapOptions,
  StorageAdapter,
  PersistedState,
  StartMenuApp,
  SpotlightItem,
  SpotlightProvider,

  // Extended desktop types
  DesktopInstanceWithShortcuts,
  DesktopInstanceWithSnap,
  DesktopInstanceWithPersistence,
  DesktopInstanceWithStartMenu,
  DesktopInstanceWithSpotlight
} from '@kiwiproject/vue-desktop'
```

## Development

```bash
# Install dependencies
pnpm install

# Run demo
pnpm --filter ./examples/demo dev

# Run tests
pnpm test

# Build library
pnpm build

# Lint
pnpm lint
```

## License

MIT
