# Shortcuts Plugin

Adds customizable keyboard shortcuts for window management.

## Installation

```ts
// With default shortcuts
import { ShortcutsPlugin } from '@anthropic/vue-desktop'

desktop.installPlugin(ShortcutsPlugin)

// Or with custom options
import { createShortcutsPlugin } from '@anthropic/vue-desktop'

desktop.installPlugin(createShortcutsPlugin({
  shortcuts: [
    { key: 'n', ctrl: true, action: () => createNewWindow() }
  ]
}))
```

## Default Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+W` | Close focused window |
| `Ctrl+M` | Minimize focused window |
| `Ctrl+Shift+F` | Toggle maximize |

## Options

```ts
interface ShortcutsPluginOptions {
  shortcuts?: ShortcutDefinition[]
}

interface ShortcutDefinition {
  key: string       // Key name (e.g., 'a', 'Enter', 'F1', 'Escape')
  ctrl?: boolean    // Require Ctrl (or Cmd on Mac)
  shift?: boolean   // Require Shift
  alt?: boolean     // Require Alt (or Option on Mac)
  meta?: boolean    // Require Meta key
  action: () => void
}
```

## API

After installation, access the API via `desktop.shortcuts`:

```ts
import type { DesktopWithShortcuts } from '@anthropic/vue-desktop'

const { shortcuts } = desktop as DesktopWithShortcuts
```

### register(shortcut)

Register a new shortcut.

```ts
shortcuts.register({
  key: 's',
  ctrl: true,
  action: () => saveDocument()
})
```

### unregister(shortcutString)

Unregister a shortcut by its string representation.

```ts
shortcuts.unregister('ctrl+s')
```

### setEnabled(enabled)

Enable or disable all shortcuts.

```ts
// Disable during text input
shortcuts.setEnabled(false)

// Re-enable
shortcuts.setEnabled(true)
```

### getShortcuts()

Get all registered shortcuts.

```ts
const all = shortcuts.getShortcuts()
// Map<string, ShortcutDefinition>
```

## Utility Functions

### parseShortcut(str)

Parse a shortcut string into a definition.

```ts
import { parseShortcut } from '@anthropic/vue-desktop'

const shortcut = parseShortcut('ctrl+shift+s')
// { key: 's', ctrl: true, shift: true, alt: false, meta: false }
```

### matchesShortcut(event, shortcut)

Check if a keyboard event matches a shortcut.

```ts
import { matchesShortcut } from '@anthropic/vue-desktop'

document.addEventListener('keydown', (e) => {
  if (matchesShortcut(e, { key: 's', ctrl: true })) {
    e.preventDefault()
    save()
  }
})
```

## Example: Custom Shortcuts

```ts
const shortcuts = createShortcutsPlugin({
  shortcuts: [
    // Window management
    { key: 'w', ctrl: true, action: () => closeWindow() },
    { key: 'm', ctrl: true, action: () => minimizeWindow() },
    { key: 'f', ctrl: true, shift: true, action: () => toggleMaximize() },

    // Navigation
    { key: '1', alt: true, action: () => focusWindow(0) },
    { key: '2', alt: true, action: () => focusWindow(1) },
    { key: '3', alt: true, action: () => focusWindow(2) },

    // Application
    { key: 'n', ctrl: true, action: () => newDocument() },
    { key: 'o', ctrl: true, action: () => openFile() },
    { key: 's', ctrl: true, action: () => saveFile() },
    { key: 's', ctrl: true, shift: true, action: () => saveAs() },

    // Search
    { key: 'k', ctrl: true, action: () => openSpotlight() },
    { key: 'f', ctrl: true, action: () => openFind() }
  ]
})

desktop.installPlugin(shortcuts)
```

## Disabling During Input

Disable shortcuts when typing in inputs:

```ts
// In your app component
onMounted(() => {
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      (desktop as DesktopWithShortcuts).shortcuts?.setEnabled(false)
    }
  })

  document.addEventListener('focusout', (e) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      (desktop as DesktopWithShortcuts).shortcuts?.setEnabled(true)
    }
  })
})
```
