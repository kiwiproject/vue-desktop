# Components

## WindowHost

Container component that renders all windows.

### Usage

```vue
<script setup>
import { WindowHost } from '@anthropic/vue-desktop'
</script>

<template>
  <WindowHost />
</template>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| — | — | — | No props |

### Features

- Renders all windows from the desktop instance
- Handles z-order (stacking)
- Manages focus via click handling
- Processes keyboard events (Alt+Tab, Alt+F4, Escape)
- Tracks viewport size for maximized windows
- Hides minimized windows

### Emits

None. All events are handled through the `DesktopInstance`.

### Example

```vue
<template>
  <div class="desktop-container">
    <WindowHost />
  </div>
</template>

<style>
.desktop-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
</style>
```

---

## WindowShell

Internal component that renders individual window chrome. Usually not used directly.

### Features

- Window header with title and controls
- Minimize, maximize, close buttons
- Drag handling (via header)
- Resize handles (8 edges/corners)
- Menu bar support
- Double-click header to toggle maximize

---

## UISlot

Renders UI components registered for a specific slot.

### Usage

```vue
<script setup>
import { UISlot } from '@anthropic/vue-desktop'
</script>

<template>
  <UISlot slot="taskbar" />
  <UISlot slot="overlay" />
</template>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `slot` | `string` | Yes | The slot name to render |

### Common Slots

| Slot | Description |
|------|-------------|
| `taskbar` | Taskbar plugin renders here |
| `overlay` | Overlays like spotlight, context menus |
| `start-menu` | Start menu dropdown |
| Custom | Any custom slot name |

### Example with Taskbar

```vue
<script setup>
import { WindowHost, UISlot, TaskbarPlugin } from '@anthropic/vue-desktop'

// Install taskbar plugin (registers to 'taskbar' slot)
desktop.installPlugin(TaskbarPlugin)
</script>

<template>
  <div class="desktop">
    <WindowHost />
    <UISlot slot="taskbar" />
  </div>
</template>
```

---

## Vue Integration Functions

### createDesktop()

Creates a new desktop instance.

```ts
import { createDesktop } from '@anthropic/vue-desktop'

const desktop = createDesktop()
```

**Returns:** `DesktopInstance`

---

### provideDesktop(instance)

Provides the desktop instance to child components via Vue's provide/inject.

```ts
import { createDesktop, provideDesktop } from '@anthropic/vue-desktop'

const desktop = createDesktop()
provideDesktop(desktop)
```

**Parameters:**
- `instance: DesktopInstance` - The desktop to provide

---

### useDesktop()

Injects the desktop instance in a child component.

```ts
import { useDesktop } from '@anthropic/vue-desktop'

const desktop = useDesktop()
desktop.createWindow({ ... })
```

**Returns:** `DesktopInstance`

**Throws:** Error if called without a provided desktop instance.

---

## Complete Example

```vue
<script setup lang="ts">
import {
  createDesktop,
  provideDesktop,
  WindowHost,
  UISlot,
  TaskbarPlugin,
  SpotlightPlugin
} from '@anthropic/vue-desktop'
import '@anthropic/vue-desktop/styles.css'
import MyApp from './MyApp.vue'

// Create and configure desktop
const desktop = createDesktop()
desktop.installPlugin(TaskbarPlugin)
desktop.installPlugin(SpotlightPlugin)
provideDesktop(desktop)

// Create initial window
desktop.createWindow({
  type: 'app',
  title: 'My Application',
  component: MyApp
})
</script>

<template>
  <div class="desktop">
    <!-- Render all windows -->
    <WindowHost />

    <!-- Render taskbar -->
    <UISlot slot="taskbar" />

    <!-- Render overlays (spotlight, context menus) -->
    <UISlot slot="overlay" />
  </div>
</template>

<style>
.desktop {
  width: 100vw;
  height: 100vh;
  background: #1a1a2e;
  position: relative;
  overflow: hidden;
}
</style>
```
