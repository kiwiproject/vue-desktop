# Context Menu Plugin

Adds right-click context menus for the desktop and window title bars.

## Installation

```ts
import { ContextMenuPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(ContextMenuPlugin)
```

## Usage

Render the context menu in the overlay slot:

```vue
<template>
  <div class="desktop">
    <WindowHost />
    <UISlot slot="overlay" />
  </div>
</template>
```

## Default Menus

### Desktop Menu (right-click on background)

- New Window
- Refresh

### Window Menu (right-click on title bar)

- Minimize
- Maximize / Restore
- Close

## API

After installation, access the API via `desktop.contextMenu`:

```ts
import type { DesktopWithContextMenu } from '@kiwiproject/vue-desktop'

const { contextMenu } = desktop as DesktopWithContextMenu
```

### show(x, y, items)

Show a context menu at the specified position.

```ts
contextMenu.show(event.clientX, event.clientY, [
  { label: 'Cut', shortcut: 'Ctrl+X', action: () => cut() },
  { label: 'Copy', shortcut: 'Ctrl+C', action: () => copy() },
  { label: 'Paste', shortcut: 'Ctrl+V', action: () => paste() }
])
```

### hide()

Close the context menu.

```ts
contextMenu.hide()
```

### isOpen()

Check if a context menu is open.

```ts
if (contextMenu.isOpen()) {
  console.log('Menu is open')
}
```

### setDesktopMenu(items)

Set the desktop background context menu.

```ts
contextMenu.setDesktopMenu([
  { label: 'New Folder', action: () => createFolder() },
  { label: 'New File', action: () => createFile() },
  { type: 'separator' },
  { label: 'Refresh', action: () => refresh() },
  { label: 'Properties', action: () => showProperties() }
])
```

### setWindowMenu(items)

Set the window title bar context menu.

```ts
contextMenu.setWindowMenu((windowId) => [
  { label: 'Minimize', action: () => desktop.minimizeWindow(windowId) },
  { label: 'Maximize', action: () => desktop.maximizeWindow(windowId) },
  { type: 'separator' },
  { label: 'Close', action: () => desktop.closeWindow(windowId) }
])
```

## Menu Item Types

### Action Item

```ts
{
  type: 'item',  // Optional, default
  label: 'Save',
  icon: '💾',
  shortcut: 'Ctrl+S',
  action: () => save(),
  disabled: false
}
```

### Submenu

```ts
{
  type: 'submenu',
  label: 'Export',
  icon: '📤',
  items: [
    { label: 'As PDF', action: () => exportPDF() },
    { label: 'As Image', action: () => exportImage() },
    { label: 'As HTML', action: () => exportHTML() }
  ]
}
```

### Separator

```ts
{
  type: 'separator'
}
```

## Dynamic Menus

Use a function for dynamic menu items:

```ts
contextMenu.setDesktopMenu(() => [
  {
    label: 'Paste',
    action: () => paste(),
    disabled: !hasClipboardContent()
  },
  {
    label: `Windows: ${desktop.windows.length}`,
    disabled: true
  }
])
```

## Custom Context Menus

Add context menus to your own components:

```vue
<script setup lang="ts">
import { useDesktop } from '@kiwiproject/vue-desktop'
import type { DesktopWithContextMenu } from '@kiwiproject/vue-desktop'

const desktop = useDesktop() as DesktopWithContextMenu

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()

  desktop.contextMenu?.show(event.clientX, event.clientY, [
    { label: 'Edit', action: () => edit() },
    { label: 'Delete', action: () => remove() },
    { type: 'separator' },
    {
      label: 'More',
      type: 'submenu',
      items: [
        { label: 'Duplicate', action: () => duplicate() },
        { label: 'Rename', action: () => rename() }
      ]
    }
  ])
}
</script>

<template>
  <div @contextmenu="handleContextMenu">
    Right-click me
  </div>
</template>
```

## Complete Example

```ts
const contextMenu = ContextMenuPlugin

desktop.installPlugin(contextMenu)

// After installation, customize menus
const { contextMenu: api } = desktop as DesktopWithContextMenu

// Desktop menu
api.setDesktopMenu(() => [
  {
    label: 'New',
    type: 'submenu',
    items: [
      {
        label: 'Text Document',
        icon: '📝',
        action: () => desktop.createWindow({
          type: 'text-editor',
          title: 'Untitled.txt',
          component: TextEditor
        })
      },
      {
        label: 'Folder',
        icon: '📁',
        action: () => createFolder()
      }
    ]
  },
  { type: 'separator' },
  {
    label: 'View',
    type: 'submenu',
    items: [
      { label: 'Large Icons', action: () => setView('large') },
      { label: 'Small Icons', action: () => setView('small') },
      { label: 'List', action: () => setView('list') }
    ]
  },
  { type: 'separator' },
  { label: 'Refresh', shortcut: 'F5', action: () => refresh() },
  { type: 'separator' },
  { label: 'Properties', action: () => showDesktopProperties() }
])

// Window menu
api.setWindowMenu((windowId) => {
  const mode = desktop.getMode(windowId)
  const window = desktop.getWindow(windowId)

  return [
    {
      label: mode === 'minimized' ? 'Restore' : 'Minimize',
      action: () => {
        if (mode === 'minimized') {
          desktop.restoreWindow(windowId)
        } else {
          desktop.minimizeWindow(windowId)
        }
      }
    },
    {
      label: mode === 'maximized' ? 'Restore' : 'Maximize',
      action: () => {
        if (mode === 'maximized') {
          desktop.restoreWindow(windowId)
        } else {
          desktop.maximizeWindow(windowId)
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Always on Top',
      action: () => toggleAlwaysOnTop(windowId)
    },
    { type: 'separator' },
    {
      label: 'Close',
      shortcut: 'Alt+F4',
      action: () => desktop.closeWindow(windowId)
    }
  ]
})
```

## Styling

```css
/* Context menu container */
.vd-context-menu {
  position: fixed;
  min-width: 180px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 10000;
}

/* Menu item */
.vd-context-item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.vd-context-item:hover {
  background: #f0f0f0;
}

.vd-context-item.disabled {
  opacity: 0.5;
  cursor: default;
}

/* Separator */
.vd-context-separator {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 8px;
}

/* Submenu indicator */
.vd-context-submenu::after {
  content: '▸';
  margin-left: auto;
}

/* Shortcut hint */
.vd-context-shortcut {
  margin-left: auto;
  color: #888;
  font-size: 12px;
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate items |
| `→` | Open submenu |
| `←` | Close submenu |
| `Enter` | Execute item |
| `Escape` | Close menu |

## Accessibility

The context menu includes:
- `role="menu"` on the container
- `role="menuitem"` on items
- `aria-haspopup` for submenus
- `aria-disabled` for disabled items
