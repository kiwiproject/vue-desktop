# Plugin Examples

This directory contains example plugins demonstrating different patterns for extending vue-desktop.

## Overview

| Plugin | Difficulty | Demonstrates |
|--------|------------|--------------|
| [clock-plugin](./clock-plugin/) | Beginner | UI overlay with `registerUI()` |
| [window-logger-plugin](./window-logger-plugin/) | Beginner | Event subscription pattern |
| [window-counter-plugin](./window-counter-plugin/) | Intermediate | Desktop API extension |
| [always-on-top-plugin](./always-on-top-plugin/) | Advanced | Method wrapping |

## Quick Start

```typescript
import { createDesktop, provideDesktop } from '@kiwiproject/vue-desktop'

// Import example plugins
import { ClockPlugin } from './examples/plugins/clock-plugin'
import { WindowLoggerPlugin } from './examples/plugins/window-logger-plugin'
import { createWindowCounterPlugin, DesktopWithCounter } from './examples/plugins/window-counter-plugin'
import { createAlwaysOnTopPlugin, DesktopWithAlwaysOnTop } from './examples/plugins/always-on-top-plugin'

// Create desktop with extended types
type ExtendedDesktop = DesktopWithCounter & DesktopWithAlwaysOnTop
const desktop = createDesktop() as ExtendedDesktop

// Install plugins
desktop.installPlugin(ClockPlugin)
desktop.installPlugin(WindowLoggerPlugin)
desktop.installPlugin(createWindowCounterPlugin())
desktop.installPlugin(createAlwaysOnTopPlugin())

// Use in your Vue app
provideDesktop(desktop)

// Access plugin APIs
console.log(desktop.counter?.getStats())
desktop.alwaysOnTop?.pin('my-window')
```

## Plugin Patterns

### 1. UI Overlay (clock-plugin)

Register a Vue component to render in a UI slot:

```typescript
const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop) {
    const unregister = desktop.registerUI({
      id: 'my-ui',
      slot: 'overlay',  // or 'taskbar'
      component: MyComponent,
      order: 100
    })
    return unregister
  }
}
```

### 2. Event Subscription (window-logger-plugin)

React to desktop events:

```typescript
const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop) {
    const unsub = desktop.on('window:created', (win) => {
      console.log('Window created:', win)
    })
    return unsub
  }
}
```

### 3. API Extension (window-counter-plugin)

Add custom methods to the desktop instance:

```typescript
interface MyAPI { doSomething(): void }
interface DesktopWithMyAPI extends DesktopInstance { myApi?: MyAPI }

const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop) {
    (desktop as DesktopWithMyAPI).myApi = {
      doSomething() { /* ... */ }
    }
    return () => {
      delete (desktop as DesktopWithMyAPI).myApi
    }
  }
}
```

### 4. Method Wrapping (always-on-top-plugin)

Override core methods to add behavior:

```typescript
const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop) {
    const original = desktop.focusWindow.bind(desktop)
    desktop.focusWindow = (id) => {
      console.log('Focusing:', id)
      original(id)
    }
    return () => {
      desktop.focusWindow = original
    }
  }
}
```

## Plugin Lifecycle

```typescript
const MyPlugin: Plugin = {
  name: 'my-plugin',

  install(desktop) {
    // 1. Setup: Called when plugin is installed
    const resources = setupResources()

    // 2. Return cleanup function (optional)
    return () => {
      // Called when plugin is uninstalled
      cleanupResources(resources)
    }
  }
}

// Install
desktop.installPlugin(MyPlugin)

// Check if installed
desktop.hasPlugin('my-plugin')  // true

// Uninstall
desktop.uninstallPlugin('my-plugin')
```

## Available APIs

Plugins have access to the full `DesktopInstance` API:

### Window Management
- `createWindow(def)` - Create a window
- `closeWindow(id)` - Close a window
- `getWindow(id)` - Get window definition
- `windows` - Array of all windows

### Window State
- `focusWindow(id)` - Focus a window
- `getFocusedWindowId()` - Get focused window ID
- `minimizeWindow(id)` - Minimize
- `maximizeWindow(id)` - Maximize
- `restoreWindow(id)` - Restore

### Bounds
- `getBounds(id)` - Get window bounds
- `updateBounds(id, bounds)` - Update bounds

### Events
- `on(event, handler)` - Subscribe to event
- `off(event, handler)` - Unsubscribe
- `emit(event, data)` - Emit event

### UI Registration
- `registerUI(options)` - Register UI component
- `unregisterUI(id)` - Unregister
- `getUIForSlot(slot)` - Get UIs for slot

## Best Practices

1. **Always clean up** - Return a cleanup function from `install()`
2. **Use TypeScript** - Define interfaces for your APIs
3. **Use factory functions** - Allow configuration via options
4. **Handle missing APIs** - Use optional chaining (`?.`)
5. **Don't break core behavior** - When wrapping methods, always call the original
6. **Test uninstall** - Ensure your plugin can be cleanly removed

## Creating Your Own Plugin

1. Start with the [clock-plugin](./clock-plugin/) as a template
2. Define your plugin's purpose and API
3. Implement the `install()` function
4. Add proper cleanup
5. Export types for consumers
6. Write documentation

For more details, see the main [README](../../README.md#custom-plugins) plugin documentation.
