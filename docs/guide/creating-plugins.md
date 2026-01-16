# Creating Plugins

Plugins extend vue-desktop with custom functionality. This guide covers different patterns for building plugins.

## Plugin Interface

```ts
interface Plugin {
  name: string
  install(desktop: DesktopInstance): void | (() => void)
}
```

- `name`: Unique identifier for the plugin
- `install`: Called when the plugin is installed. Can return a cleanup function.

## Basic Plugin

The simplest plugin just subscribes to events:

```ts
import type { Plugin } from '@anthropic/vue-desktop'

export const LoggerPlugin: Plugin = {
  name: 'logger',
  install(desktop) {
    const events = [
      'window:created',
      'window:closed',
      'window:focused'
    ]

    const unsubscribers = events.map(event =>
      desktop.on(event, (data) => {
        console.log(`[${event}]`, data)
      })
    )

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }
}
```

## Plugin with Options

Use a factory function for configurable plugins:

```ts
import type { Plugin } from '@anthropic/vue-desktop'

interface AutoSaveOptions {
  interval: number  // ms between saves
  onSave: () => void
}

export function createAutoSavePlugin(options: AutoSaveOptions): Plugin {
  return {
    name: 'auto-save',
    install(desktop) {
      const timer = setInterval(() => {
        if (desktop.windows.length > 0) {
          options.onSave()
        }
      }, options.interval)

      return () => clearInterval(timer)
    }
  }
}

// Usage
desktop.installPlugin(createAutoSavePlugin({
  interval: 30000,
  onSave: () => saveAllDocuments()
}))
```

## Plugin with UI

Register UI components to render in slots:

```ts
import { defineComponent, h, ref } from 'vue'
import type { Plugin } from '@anthropic/vue-desktop'

const ClockWidget = defineComponent({
  setup() {
    const time = ref(new Date().toLocaleTimeString())

    setInterval(() => {
      time.value = new Date().toLocaleTimeString()
    }, 1000)

    return () => h('div', { class: 'clock-widget' }, time.value)
  }
})

export const ClockPlugin: Plugin = {
  name: 'clock',
  install(desktop) {
    const unregister = desktop.registerUI({
      id: 'clock-widget',
      slot: 'overlay',
      component: ClockWidget,
      order: 1000
    })

    return unregister
  }
}
```

## Extending Desktop API

Add custom methods to the desktop instance:

```ts
import type { Plugin, DesktopInstance } from '@anthropic/vue-desktop'

interface CounterAPI {
  getCount(): number
  getStats(): { created: number; closed: number }
}

export interface DesktopWithCounter extends DesktopInstance {
  counter?: CounterAPI
}

export const CounterPlugin: Plugin = {
  name: 'counter',
  install(desktop) {
    let created = 0
    let closed = 0

    const unsub1 = desktop.on('window:created', () => created++)
    const unsub2 = desktop.on('window:closed', () => closed++)

    // Extend desktop with custom API
    ;(desktop as DesktopWithCounter).counter = {
      getCount: () => desktop.windows.length,
      getStats: () => ({ created, closed })
    }

    return () => {
      unsub1()
      unsub2()
      delete (desktop as DesktopWithCounter).counter
    }
  }
}

// Usage
const desktop = useDesktop() as DesktopWithCounter
console.log(desktop.counter?.getStats())
```

## Method Wrapping

Wrap existing methods to add behavior:

```ts
import type { Plugin } from '@anthropic/vue-desktop'

export function createAlwaysOnTopPlugin(): Plugin {
  return {
    name: 'always-on-top',
    install(desktop) {
      const pinnedWindows = new Set<string>()
      const originalFocusWindow = desktop.focusWindow.bind(desktop)

      // Wrap focusWindow
      desktop.focusWindow = (id: string) => {
        const result = originalFocusWindow(id)

        // Re-focus pinned windows to keep them on top
        pinnedWindows.forEach(pinnedId => {
          if (pinnedId !== id && desktop.getWindow(pinnedId)) {
            originalFocusWindow(pinnedId)
          }
        })

        return result
      }

      // Expose API
      ;(desktop as any).alwaysOnTop = {
        pin: (id: string) => {
          pinnedWindows.add(id)
          originalFocusWindow(id)
        },
        unpin: (id: string) => pinnedWindows.delete(id),
        isPinned: (id: string) => pinnedWindows.has(id)
      }

      return () => {
        desktop.focusWindow = originalFocusWindow
        delete (desktop as any).alwaysOnTop
      }
    }
  }
}
```

## Plugin Dependencies

Check for other plugins:

```ts
export const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop) {
    // Check for required plugin
    if (!desktop.hasPlugin('taskbar')) {
      console.warn('my-plugin requires taskbar plugin')
      return
    }

    // Use taskbar API
    const { taskbar } = desktop as DesktopWithTaskbar
    // ...
  }
}
```

## Best Practices

### 1. Always Return Cleanup

```ts
install(desktop) {
  const timer = setInterval(...)
  const unsub = desktop.on(...)

  return () => {
    clearInterval(timer)
    unsub()
  }
}
```

### 2. Use TypeScript

Define interfaces for your plugin's API:

```ts
interface MyPluginAPI {
  doSomething(): void
  getValue(): number
}

export interface DesktopWithMyPlugin extends DesktopInstance {
  myPlugin?: MyPluginAPI
}
```

### 3. Namespace Your API

Add your API under a named property:

```ts
// Good
(desktop as any).myPlugin = { ... }

// Avoid polluting the root
(desktop as any).myMethod = () => {} // Bad
```

### 4. Handle Edge Cases

```ts
install(desktop) {
  const unsub = desktop.on('window:closed', ({ windowId }) => {
    // Clean up window-specific state
    myWindowState.delete(windowId)
  })

  return unsub
}
```

### 5. Document Your Plugin

```ts
/**
 * Analytics plugin for vue-desktop
 *
 * Tracks window usage and reports to analytics service.
 *
 * @example
 * ```ts
 * import { createAnalyticsPlugin } from './analytics-plugin'
 *
 * desktop.installPlugin(createAnalyticsPlugin({
 *   trackingId: 'UA-XXXXX'
 * }))
 * ```
 */
export function createAnalyticsPlugin(options: AnalyticsOptions): Plugin
```
