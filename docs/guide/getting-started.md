# Getting Started

## Installation

::: code-group

```bash [npm]
npm install @kiwiproject/vue-desktop
```

```bash [pnpm]
pnpm add @kiwiproject/vue-desktop
```

```bash [yarn]
yarn add @kiwiproject/vue-desktop
```

:::

## Basic Setup

### 1. Create the Desktop Instance

The desktop instance manages all windows and their state.

```ts
import { createDesktop } from '@kiwiproject/vue-desktop'

const desktop = createDesktop()
```

### 2. Provide to Your App

Use Vue's provide/inject to make the desktop available to all components.

```vue
<script setup lang="ts">
import { createDesktop, provideDesktop, WindowHost } from '@kiwiproject/vue-desktop'
import '@kiwiproject/vue-desktop/styles.css'

const desktop = createDesktop()
provideDesktop(desktop)
</script>

<template>
  <WindowHost />
</template>
```

### 3. Create Windows

Create windows programmatically from anywhere in your app.

```ts
import { useDesktop } from '@kiwiproject/vue-desktop'
import MyComponent from './MyComponent.vue'

const desktop = useDesktop()

desktop.createWindow({
  type: 'my-app',
  title: 'My Window',
  component: MyComponent,
  initialBounds: { x: 100, y: 100, width: 400, height: 300 }
})
```

## Adding Plugins

Plugins extend the desktop with additional functionality.

```ts
import {
  createDesktop,
  TaskbarPlugin,
  ShortcutsPlugin,
  SnapPlugin
} from '@kiwiproject/vue-desktop'

const desktop = createDesktop()

// Add a taskbar showing open windows
desktop.installPlugin(TaskbarPlugin)

// Add keyboard shortcuts (Ctrl+W to close, etc.)
desktop.installPlugin(ShortcutsPlugin)

// Enable window snapping to edges
desktop.installPlugin(SnapPlugin)
```

## Complete Example

```vue
<script setup lang="ts">
import {
  createDesktop,
  provideDesktop,
  WindowHost,
  UISlot,
  TaskbarPlugin,
  ShortcutsPlugin,
  createSnapPlugin
} from '@kiwiproject/vue-desktop'
import '@kiwiproject/vue-desktop/styles.css'
import TextEditor from './TextEditor.vue'
import ImageViewer from './ImageViewer.vue'

// Create desktop
const desktop = createDesktop()

// Install plugins
desktop.installPlugin(TaskbarPlugin)
desktop.installPlugin(ShortcutsPlugin)
desktop.installPlugin(createSnapPlugin({ threshold: 15 }))

// Provide to app
provideDesktop(desktop)

// Create initial windows
desktop.createWindow({
  type: 'text-editor',
  title: 'Untitled.txt',
  component: TextEditor,
  initialBounds: { x: 50, y: 50, width: 600, height: 400 }
})

desktop.createWindow({
  type: 'image-viewer',
  title: 'Photo.jpg',
  component: ImageViewer,
  initialBounds: { x: 200, y: 100, width: 500, height: 400 }
})
</script>

<template>
  <div class="desktop">
    <WindowHost />
    <UISlot slot="taskbar" />
  </div>
</template>

<style>
.desktop {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
  overflow: hidden;
}
</style>
```

## Next Steps

- Learn about [Core Concepts](/guide/core-concepts)
- Explore [Window Definition](/guide/window-definition) options
- Browse available [Plugins](/plugins/overview)
- Check the [API Reference](/api/desktop-instance)
