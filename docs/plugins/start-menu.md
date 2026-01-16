# Start Menu Plugin

Adds an application launcher with categories, similar to the Windows Start Menu.

## Installation

```ts
import { createStartMenuPlugin } from '@anthropic/vue-desktop'

desktop.installPlugin(createStartMenuPlugin({
  apps: [
    {
      id: 'notepad',
      label: 'Notepad',
      icon: '📝',
      category: 'Utilities',
      action: () => openNotepad()
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: '🧮',
      category: 'Utilities',
      action: () => openCalculator()
    }
  ]
}))
```

## Options

```ts
interface StartMenuPluginOptions {
  apps?: StartMenuApp[]
}

interface StartMenuApp {
  id: string           // Unique app identifier
  label: string        // Display name
  icon?: string        // Icon (emoji or image URL)
  category?: string    // Category for grouping
  shortcut?: string    // Keyboard shortcut hint
  action: () => void   // Function to run when clicked
}
```

## Rendering

The start menu renders in the `taskbar` slot. Make sure to include it:

```vue
<template>
  <div class="desktop">
    <WindowHost />
    <UISlot slot="taskbar" />
  </div>
</template>
```

The start menu button appears on the left side of the taskbar.

## API

After installation, access the API via `desktop.startMenu`:

```ts
import type { DesktopWithStartMenu } from '@anthropic/vue-desktop'

const { startMenu } = desktop as DesktopWithStartMenu
```

### registerApp(app)

Register a new application.

```ts
startMenu.registerApp({
  id: 'my-app',
  label: 'My Application',
  icon: '🚀',
  category: 'My Apps',
  action: () => {
    desktop.createWindow({
      type: 'my-app',
      title: 'My Application',
      component: MyApp
    })
  }
})
```

### unregisterApp(id)

Remove an application.

```ts
startMenu.unregisterApp('my-app')
```

### getApps()

Get all registered applications.

```ts
const apps = startMenu.getApps()
```

### getAppsByCategory()

Get applications grouped by category.

```ts
const byCategory = startMenu.getAppsByCategory()
// Map<string, StartMenuApp[]>
// e.g., { 'Utilities': [...], 'Games': [...] }
```

### open() / close() / toggle()

Control the menu visibility.

```ts
startMenu.open()
startMenu.close()
startMenu.toggle()
```

### isOpen()

Check if the menu is open.

```ts
if (startMenu.isOpen()) {
  console.log('Menu is open')
}
```

## Categories

Apps are automatically grouped by category:

```ts
createStartMenuPlugin({
  apps: [
    { id: 'notepad', label: 'Notepad', category: 'Utilities', action: () => {} },
    { id: 'paint', label: 'Paint', category: 'Utilities', action: () => {} },
    { id: 'chess', label: 'Chess', category: 'Games', action: () => {} },
    { id: 'solitaire', label: 'Solitaire', category: 'Games', action: () => {} },
    { id: 'settings', label: 'Settings', category: 'System', action: () => {} }
  ]
})
```

Apps without a category appear in "Other".

## Keyboard Shortcut Hints

Display keyboard shortcuts next to app names:

```ts
{
  id: 'settings',
  label: 'Settings',
  shortcut: 'Ctrl+,',
  action: () => openSettings()
}
```

## Complete Example

```ts
const startMenu = createStartMenuPlugin({
  apps: [
    // Productivity
    {
      id: 'text-editor',
      label: 'Text Editor',
      icon: '📝',
      category: 'Productivity',
      shortcut: 'Ctrl+N',
      action: () => {
        desktop.createWindow({
          type: 'text-editor',
          title: 'Untitled.txt',
          component: TextEditor
        })
      }
    },
    {
      id: 'spreadsheet',
      label: 'Spreadsheet',
      icon: '📊',
      category: 'Productivity',
      action: () => {
        desktop.createWindow({
          type: 'spreadsheet',
          title: 'Untitled.xlsx',
          component: Spreadsheet
        })
      }
    },

    // Utilities
    {
      id: 'calculator',
      label: 'Calculator',
      icon: '🧮',
      category: 'Utilities',
      action: () => {
        desktop.createWindow({
          type: 'calculator',
          title: 'Calculator',
          component: Calculator,
          singletonKey: 'calculator'
        })
      }
    },

    // System
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      category: 'System',
      shortcut: 'Ctrl+,',
      action: () => {
        desktop.createWindow({
          type: 'settings',
          title: 'Settings',
          component: Settings,
          singletonKey: 'settings'
        })
      }
    }
  ]
})

desktop.installPlugin(startMenu)
```

## Styling

```css
/* Start menu button */
.vd-start-button {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.vd-start-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Start menu panel */
.vd-start-menu {
  position: fixed;
  bottom: 48px;
  left: 0;
  width: 300px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px 8px 0 0;
  padding: 8px 0;
}

/* Category header */
.vd-start-category {
  padding: 8px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

/* App item */
.vd-start-app {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.vd-start-app:hover {
  background: rgba(255, 255, 255, 0.1);
}
```
