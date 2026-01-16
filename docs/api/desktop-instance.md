# DesktopInstance

The central manager for all windows and desktop state.

## Creating an Instance

```ts
import { createDesktop } from '@kiwiproject/vue-desktop'

const desktop = createDesktop()
```

## Properties

### windows

Reactive array of all windows.

- **Type:** `WindowDefinition[]`
- **Reactive:** Yes

```ts
const allWindows = desktop.windows
```

### zOrder

Array of window IDs in z-order (last = topmost).

- **Type:** `string[]`
- **Reactive:** Yes

```ts
const order = desktop.zOrder
const topmostId = order[order.length - 1]
```

### switcherActive

Whether the window switcher overlay is open.

- **Type:** `boolean`
- **Reactive:** Yes

```ts
if (desktop.switcherActive) {
  console.log('Switcher is open')
}
```

### switcherSelectedId

Currently selected window ID in the switcher.

- **Type:** `string | null`
- **Reactive:** Yes

```ts
const selected = desktop.switcherSelectedId
```

## Window Methods

### createWindow(def)

Creates a new window.

- **Parameters:**
  - `def: WindowDefinition` - Window configuration
- **Returns:** `WindowDefinition` - The created window with generated `id`

```ts
const win = desktop.createWindow({
  type: 'editor',
  title: 'New Document',
  component: EditorComponent,
  initialBounds: { x: 100, y: 100, width: 600, height: 400 }
})
console.log(win.id) // Auto-generated ID
```

### closeWindow(id)

Closes a window.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `boolean` - `true` if window was closed, `false` if not found

```ts
const closed = desktop.closeWindow(windowId)
```

### getWindow(id)

Gets a window by ID.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `WindowDefinition | undefined`

```ts
const win = desktop.getWindow(windowId)
if (win) {
  console.log(win.title)
}
```

### listWindows()

Returns all windows. Alias for `windows` property.

- **Returns:** `WindowDefinition[]`

```ts
const windows = desktop.listWindows()
```

## Focus Methods

### focusWindow(id)

Focuses a window, bringing it to the front.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `boolean` - `true` if focused, `false` if window not found

```ts
desktop.focusWindow(windowId)
```

### getFocusedWindowId()

Gets the ID of the currently focused window.

- **Returns:** `string | undefined`

```ts
const focusedId = desktop.getFocusedWindowId()
```

### cycleFocus(reverse?)

Cycles focus to the next/previous window (Alt+Tab behavior).

- **Parameters:**
  - `reverse?: boolean` - If `true`, cycles backward
- **Returns:** `boolean` - `true` if focus changed

```ts
desktop.cycleFocus()       // Next window
desktop.cycleFocus(true)   // Previous window
```

## Mode Methods

### getMode(id)

Gets the current mode of a window.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `WindowMode` - `'normal' | 'minimized' | 'maximized'`

```ts
const mode = desktop.getMode(windowId)
```

### minimizeWindow(id)

Minimizes a window.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `boolean`

```ts
desktop.minimizeWindow(windowId)
```

### maximizeWindow(id)

Maximizes a window.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `boolean`

```ts
desktop.maximizeWindow(windowId)
```

### restoreWindow(id)

Restores a window to normal mode.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `boolean`

```ts
desktop.restoreWindow(windowId)
```

## Bounds Methods

### getBounds(id)

Gets the current bounds of a window.

- **Parameters:**
  - `id: string` - Window ID
- **Returns:** `Bounds | undefined`

```ts
const bounds = desktop.getBounds(windowId)
// { x: 100, y: 100, width: 400, height: 300 }
```

### updateBounds(id, bounds)

Updates the bounds of a window.

- **Parameters:**
  - `id: string` - Window ID
  - `bounds: Bounds` - New bounds
- **Returns:** `boolean`

```ts
desktop.updateBounds(windowId, {
  x: 200,
  y: 150,
  width: 500,
  height: 400
})
```

## Switcher Methods

### openSwitcher()

Opens the window switcher overlay.

```ts
desktop.openSwitcher()
```

### closeSwitcher(commit?)

Closes the window switcher.

- **Parameters:**
  - `commit?: boolean` - If `true` (default), focuses the selected window

```ts
desktop.closeSwitcher()        // Focus selected
desktop.closeSwitcher(false)   // Cancel
```

### cycleSwitcherSelection(reverse?)

Cycles the selection in the window switcher.

- **Parameters:**
  - `reverse?: boolean` - If `true`, cycles backward

```ts
desktop.cycleSwitcherSelection()       // Next
desktop.cycleSwitcherSelection(true)   // Previous
```

### getSwitcherWindows()

Gets windows shown in the switcher (non-minimized, MRU order).

- **Returns:** `WindowDefinition[]`

```ts
const windows = desktop.getSwitcherWindows()
```

## Plugin Methods

### installPlugin(plugin)

Installs a plugin.

- **Parameters:**
  - `plugin: Plugin` - Plugin to install
- **Returns:** `boolean` - `true` if installed, `false` if already installed

```ts
import { TaskbarPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(TaskbarPlugin)
```

### uninstallPlugin(name)

Uninstalls a plugin by name.

- **Parameters:**
  - `name: string` - Plugin name
- **Returns:** `boolean` - `true` if uninstalled, `false` if not found

```ts
desktop.uninstallPlugin('taskbar')
```

### hasPlugin(name)

Checks if a plugin is installed.

- **Parameters:**
  - `name: string` - Plugin name
- **Returns:** `boolean`

```ts
if (desktop.hasPlugin('taskbar')) {
  // Taskbar is available
}
```

## UI Registry Methods

### registerUI(registration)

Registers a UI component in a slot.

- **Parameters:**
  - `registration: UIRegistration` - UI registration
- **Returns:** `() => void` - Unregister function

```ts
const unregister = desktop.registerUI({
  id: 'my-widget',
  slot: 'overlay',
  component: MyWidget,
  order: 100
})
```

### unregisterUI(id)

Unregisters a UI component.

- **Parameters:**
  - `id: string` - Registration ID
- **Returns:** `boolean`

```ts
desktop.unregisterUI('my-widget')
```

### getUIForSlot(slot)

Gets all UI registrations for a slot.

- **Parameters:**
  - `slot: string` - Slot name
- **Returns:** `UIRegistration[]`

```ts
const overlays = desktop.getUIForSlot('overlay')
```

## Event Methods

### on(event, handler)

Subscribes to an event.

- **Parameters:**
  - `event: string` - Event name
  - `handler: (payload?: unknown) => void` - Event handler
- **Returns:** `() => void` - Unsubscribe function

```ts
const unsub = desktop.on('window:created', (window) => {
  console.log('Created:', window.id)
})

// Later
unsub()
```

### off(event, handler)

Unsubscribes from an event.

- **Parameters:**
  - `event: string` - Event name
  - `handler: Function` - The handler to remove

```ts
desktop.off('window:created', myHandler)
```
