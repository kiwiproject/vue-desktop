# Plugins Overview

vue-desktop includes several built-in plugins that extend the desktop with common functionality.

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [Taskbar](/plugins/taskbar) | Shows open windows with click to focus/minimize |
| [Shortcuts](/plugins/shortcuts) | Keyboard shortcuts for window management |
| [Snap](/plugins/snap) | Window snapping to edges and other windows |
| [Persistence](/plugins/persistence) | Save/restore window state to localStorage |
| [Start Menu](/plugins/start-menu) | Application launcher with categories |
| [Spotlight](/plugins/spotlight) | Quick search dialog (Ctrl+K) |
| [Context Menu](/plugins/context-menu) | Right-click context menus |

## Installing Plugins

```ts
import {
  createDesktop,
  TaskbarPlugin,
  ShortcutsPlugin,
  SnapPlugin
} from '@anthropic/vue-desktop'

const desktop = createDesktop()

// Install with default options
desktop.installPlugin(TaskbarPlugin)
desktop.installPlugin(ShortcutsPlugin)

// Or use factory functions for custom options
import { createSnapPlugin } from '@anthropic/vue-desktop'

desktop.installPlugin(createSnapPlugin({
  threshold: 20,
  gridSnap: true,
  gridSize: 50
}))
```

## Checking Plugin Status

```ts
// Check if a plugin is installed
if (desktop.hasPlugin('taskbar')) {
  console.log('Taskbar is available')
}

// Uninstall a plugin
desktop.uninstallPlugin('snap')
```

## Plugin Load Order

Plugins are independent and can be installed in any order. However, some plugins may depend on others:

- `SpotlightPlugin` works better with `StartMenuPlugin` (provides app search)
- `ContextMenuPlugin` enhances window title bars

## Rendering Plugin UI

Many plugins register UI components. Use `UISlot` to render them:

```vue
<template>
  <div class="desktop">
    <WindowHost />

    <!-- Taskbar at bottom -->
    <UISlot slot="taskbar" />

    <!-- Overlays (spotlight, context menus, etc.) -->
    <UISlot slot="overlay" />
  </div>
</template>
```

## Plugin APIs

Most plugins expose an API on the desktop instance:

```ts
// Shortcuts API
const { shortcuts } = desktop as DesktopWithShortcuts
shortcuts.register({ key: 'n', ctrl: true, action: () => newWindow() })

// Snap API
const { snap } = desktop as DesktopWithSnap
snap.setEnabled(false)

// Spotlight API
const { spotlight } = desktop as DesktopWithSpotlight
spotlight.open()

// Start Menu API
const { startMenu } = desktop as DesktopWithStartMenu
startMenu.registerApp({ ... })

// Context Menu API
const { contextMenu } = desktop as DesktopWithContextMenu
contextMenu.show(x, y, items)

// Persistence API
const { persistence } = desktop as DesktopWithPersistence
persistence.save()
```

## Creating Custom Plugins

See the [Creating Plugins](/guide/creating-plugins) guide for how to build your own plugins.
