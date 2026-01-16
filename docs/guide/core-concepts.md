# Core Concepts

## Desktop Instance

The `DesktopInstance` is the central manager for all windows. It handles:

- **Window Registry**: Creating, tracking, and closing windows
- **Z-Order**: Managing which windows are on top
- **Focus**: Tracking and changing the focused window
- **Modes**: Window states (normal, minimized, maximized)
- **Events**: Emitting lifecycle events for windows
- **Plugins**: Installing and managing extensions

```ts
import { createDesktop } from '@kiwiproject/vue-desktop'

const desktop = createDesktop()
```

## Windows

Windows are defined by a `WindowDefinition` object and rendered by `WindowShell` inside `WindowHost`.

```ts
const win = desktop.createWindow({
  type: 'my-app',           // Identifier for this window type
  title: 'My Window',       // Title shown in the header
  component: MyComponent,   // Vue component to render
  props: { data: 'hello' }, // Props passed to component
  initialBounds: { x: 100, y: 100, width: 400, height: 300 }
})

console.log(win.id) // Auto-generated unique ID
```

## Provide/Inject Pattern

vue-desktop uses Vue's provide/inject for dependency injection:

```vue
<!-- App.vue (root) -->
<script setup>
import { createDesktop, provideDesktop } from '@kiwiproject/vue-desktop'

const desktop = createDesktop()
provideDesktop(desktop) // Makes desktop available to all children
</script>
```

```vue
<!-- AnyChild.vue -->
<script setup>
import { useDesktop } from '@kiwiproject/vue-desktop'

const desktop = useDesktop() // Get the desktop instance
desktop.createWindow({ ... })
</script>
```

## Events

The desktop emits events for window lifecycle changes:

```ts
// Subscribe to events
const unsubscribe = desktop.on('window:created', (window) => {
  console.log('Window created:', window.id)
})

// Unsubscribe when done
unsubscribe()
```

Available events:
- `window:created` - Window was created
- `window:closed` - Window was closed
- `window:focused` - Window gained focus
- `window:blurred` - Window lost focus
- `window:minimized` - Window was minimized
- `window:maximized` - Window was maximized
- `window:restored` - Window was restored
- `window:bounds` - Window position/size changed

## Plugins

Plugins extend the desktop with additional features:

```ts
import type { Plugin } from '@kiwiproject/vue-desktop'

const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop) {
    // Subscribe to events
    const unsub = desktop.on('window:created', (w) => {
      console.log('Window created!', w)
    })

    // Return cleanup function
    return () => {
      unsub()
    }
  }
}

desktop.installPlugin(MyPlugin)
```

Plugins can:
- Subscribe to events
- Create windows
- Register UI components (taskbar, overlays)
- Extend the desktop instance with custom APIs

## UI Slots

Plugins can register UI components to be rendered in specific slots:

```ts
// In a plugin
desktop.registerUI({
  id: 'my-overlay',
  slot: 'overlay',        // 'overlay' | 'taskbar' | custom
  component: MyOverlay,
  order: 100              // Ordering within the slot
})
```

```vue
<!-- Render all components registered for a slot -->
<UISlot slot="taskbar" />
<UISlot slot="overlay" />
```

## Singleton Windows

Some windows should only have one instance (like Settings):

```ts
desktop.createWindow({
  type: 'settings',
  title: 'Settings',
  component: SettingsPanel,
  singletonKey: 'settings' // Only one window with this key
})

// Creating another with the same singletonKey focuses the existing one
desktop.createWindow({
  type: 'settings',
  title: 'Settings',
  component: SettingsPanel,
  singletonKey: 'settings' // Focuses existing, doesn't create new
})
```
