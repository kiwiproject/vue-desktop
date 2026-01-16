# Window Management

## Creating Windows

```ts
const window = desktop.createWindow({
  type: 'my-app',
  title: 'My Window',
  component: MyComponent
})

console.log(window.id) // Unique window ID
```

## Closing Windows

```ts
// Close by ID
desktop.closeWindow(windowId)

// Close returns true if window existed
const closed = desktop.closeWindow('window-123')
if (!closed) {
  console.log('Window not found')
}
```

## Getting Windows

```ts
// Get a specific window
const window = desktop.getWindow(windowId)

// Get all windows
const allWindows = desktop.listWindows()
// or
const windows = desktop.windows // Reactive array

// Find windows by type
const editors = desktop.windows.filter(w => w.type === 'text-editor')
```

## Focus Management

```ts
// Focus a window (brings to front)
desktop.focusWindow(windowId)

// Get currently focused window
const focusedId = desktop.getFocusedWindowId()

// Cycle focus (Alt+Tab behavior)
desktop.cycleFocus()        // Next window
desktop.cycleFocus(true)    // Previous window (reverse)
```

## Window Modes

Windows have three modes: `normal`, `minimized`, and `maximized`.

```ts
// Get current mode
const mode = desktop.getMode(windowId) // 'normal' | 'minimized' | 'maximized'

// Minimize
desktop.minimizeWindow(windowId)

// Maximize
desktop.maximizeWindow(windowId)

// Restore to normal
desktop.restoreWindow(windowId)
```

## Z-Order

The z-order determines which windows appear on top:

```ts
// Get z-order (array of window IDs, last = topmost)
const order = desktop.zOrder

// The focused window is always at the top
desktop.focusWindow(windowId) // Moves to top of z-order
```

## Bounds Management

```ts
// Get current bounds
const bounds = desktop.getBounds(windowId)
// { x: 100, y: 100, width: 400, height: 300 }

// Update bounds
desktop.updateBounds(windowId, {
  x: 200,
  y: 150,
  width: 500,
  height: 400
})
```

## Window Switcher

The Alt+Tab style window switcher:

```ts
// Open the switcher overlay
desktop.openSwitcher()

// Cycle selection within switcher
desktop.cycleSwitcherSelection()        // Next
desktop.cycleSwitcherSelection(true)    // Previous

// Close and commit selection
desktop.closeSwitcher()        // Focus selected window
desktop.closeSwitcher(false)   // Cancel without focusing

// Get windows shown in switcher (non-minimized, MRU order)
const switcherWindows = desktop.getSwitcherWindows()

// Check if switcher is open
if (desktop.switcherActive) {
  console.log('Selected:', desktop.switcherSelectedId)
}
```

## Event Handling

Listen to window lifecycle events:

```ts
// Window created
desktop.on('window:created', (window) => {
  console.log('Created:', window.id, window.title)
})

// Window closed
desktop.on('window:closed', ({ windowId, window }) => {
  console.log('Closed:', windowId)
})

// Focus changes
desktop.on('window:focused', ({ windowId }) => {
  console.log('Focused:', windowId)
})

desktop.on('window:blurred', ({ windowId }) => {
  console.log('Lost focus:', windowId)
})

// Mode changes
desktop.on('window:minimized', ({ windowId }) => { ... })
desktop.on('window:maximized', ({ windowId }) => { ... })
desktop.on('window:restored', ({ windowId }) => { ... })

// Bounds changed
desktop.on('window:bounds', ({ windowId, bounds, oldBounds }) => {
  console.log('Moved/resized:', windowId, bounds)
})
```

## Unsubscribing from Events

The `on()` method returns an unsubscribe function:

```ts
const unsubscribe = desktop.on('window:created', handler)

// Later, when you want to stop listening
unsubscribe()
```

## Example: Window Manager Component

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDesktop } from '@kiwiproject/vue-desktop'

const desktop = useDesktop()

const windows = computed(() => desktop.windows)
const focusedId = computed(() => desktop.getFocusedWindowId())

function closeAll() {
  for (const win of [...desktop.windows]) {
    desktop.closeWindow(win.id!)
  }
}

function minimizeAll() {
  for (const win of desktop.windows) {
    desktop.minimizeWindow(win.id!)
  }
}

function tileWindows() {
  const wins = desktop.windows
  const cols = Math.ceil(Math.sqrt(wins.length))
  const width = Math.floor(window.innerWidth / cols)
  const height = Math.floor(window.innerHeight / Math.ceil(wins.length / cols))

  wins.forEach((win, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    desktop.updateBounds(win.id!, {
      x: col * width,
      y: row * height,
      width,
      height
    })
    desktop.restoreWindow(win.id!)
  })
}
</script>

<template>
  <div class="window-manager">
    <button @click="closeAll">Close All</button>
    <button @click="minimizeAll">Minimize All</button>
    <button @click="tileWindows">Tile Windows</button>
    <div>Open: {{ windows.length }} | Focused: {{ focusedId }}</div>
  </div>
</template>
```
