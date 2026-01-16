# Keyboard Shortcuts

## Built-in Shortcuts

The `WindowHost` component includes these default keyboard handlers:

| Shortcut | Action |
|----------|--------|
| `Alt+Tab` | Open window switcher / cycle forward |
| `Alt+Shift+Tab` | Cycle backward in switcher |
| `Alt+F4` | Close focused window |
| `Escape` | Close focused window |

## Shortcuts Plugin

The `ShortcutsPlugin` adds more keyboard shortcuts:

```ts
import { ShortcutsPlugin } from '@anthropic/vue-desktop'

desktop.installPlugin(ShortcutsPlugin)
```

### Default Plugin Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+W` | Close focused window |
| `Ctrl+M` | Minimize focused window |
| `Ctrl+Shift+F` | Toggle maximize |

### Custom Shortcuts

Create a plugin with custom shortcuts:

```ts
import { createShortcutsPlugin } from '@anthropic/vue-desktop'

const shortcuts = createShortcutsPlugin({
  shortcuts: [
    {
      key: 'n',
      ctrl: true,
      action: () => createNewWindow()
    },
    {
      key: 'f',
      ctrl: true,
      shift: true,
      action: () => toggleFullscreen()
    },
    {
      key: '1',
      alt: true,
      action: () => focusWindowAtIndex(0)
    }
  ]
})

desktop.installPlugin(shortcuts)
```

### Shortcut Definition

```ts
interface ShortcutDefinition {
  key: string       // Key name (e.g., 'a', 'Enter', 'F1')
  ctrl?: boolean    // Require Ctrl/Cmd
  shift?: boolean   // Require Shift
  alt?: boolean     // Require Alt/Option
  meta?: boolean    // Require Meta (Windows key / Cmd on Mac)
  action: () => void
}
```

### Runtime Shortcut Management

```ts
// After installing the plugin, access the API
const { shortcuts } = desktop as DesktopWithShortcuts

// Register new shortcut
shortcuts.register({
  key: 'o',
  ctrl: true,
  action: () => openFile()
})

// Unregister
shortcuts.unregister('ctrl+o')

// Enable/disable all shortcuts
shortcuts.setEnabled(false)
shortcuts.setEnabled(true)

// Get all registered shortcuts
const all = shortcuts.getShortcuts()
```

## Shortcut String Format

Shortcuts can be specified as strings:

```ts
// These are equivalent
{ key: 's', ctrl: true, shift: true }
'ctrl+shift+s'

// Parse a shortcut string
import { parseShortcut } from '@anthropic/vue-desktop'

const shortcut = parseShortcut('ctrl+shift+s')
// { key: 's', ctrl: true, shift: true, alt: false, meta: false }
```

## Matching Shortcuts

Check if a keyboard event matches a shortcut:

```ts
import { matchesShortcut } from '@anthropic/vue-desktop'

document.addEventListener('keydown', (event) => {
  if (matchesShortcut(event, { key: 's', ctrl: true })) {
    event.preventDefault()
    save()
  }
})
```

## Window-specific Shortcuts

Handle shortcuts within a window component:

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { matchesShortcut } from '@anthropic/vue-desktop'

function handleKeydown(e: KeyboardEvent) {
  if (matchesShortcut(e, { key: 's', ctrl: true })) {
    e.preventDefault()
    saveDocument()
  }
  if (matchesShortcut(e, { key: 'f', ctrl: true })) {
    e.preventDefault()
    openFind()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
```

## Spotlight Search

The `SpotlightPlugin` adds a quick search dialog:

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open Spotlight search |
| `Escape` | Close Spotlight |
| `Enter` | Execute selected result |
| `↑` / `↓` | Navigate results |

```ts
import { SpotlightPlugin } from '@anthropic/vue-desktop'

desktop.installPlugin(SpotlightPlugin)
```
