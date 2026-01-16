# Always-on-Top Plugin

**Difficulty**: Advanced

A plugin that allows windows to be "pinned" to always stay on top of other windows, demonstrating method wrapping patterns.

## What This Example Demonstrates

- Wrapping/overriding core desktop methods
- Complex stateful behavior with window tracking
- Proper cleanup and restoration of overridden methods
- Event handling to maintain state consistency
- Advanced TypeScript patterns

## Files

- `index.ts` - Plugin implementation with method wrapping
- `types.ts` - TypeScript interfaces for the API

## Usage

### Basic Usage

```typescript
import { createDesktop } from '@kiwiproject/vue-desktop'
import {
  createAlwaysOnTopPlugin,
  DesktopWithAlwaysOnTop
} from './examples/plugins/always-on-top-plugin'

const desktop = createDesktop() as DesktopWithAlwaysOnTop
desktop.installPlugin(createAlwaysOnTopPlugin())

// Create a window
const windowId = desktop.createWindow({
  title: 'Sticky Note',
  component: StickyNote
})

// Pin it to stay on top
desktop.alwaysOnTop?.pin(windowId)

// Now this window will stay on top even when other windows are focused
```

### Toggle from Context Menu

```typescript
import { createContextMenuPlugin } from '@kiwiproject/vue-desktop'
import type { DesktopWithAlwaysOnTop } from './examples/plugins/always-on-top-plugin'

// Add to window context menu
desktop.contextMenu?.setWindowMenu((context) => [
  {
    id: 'pin',
    label: desktop.alwaysOnTop?.isPinned(context.windowId)
      ? 'Unpin from Top'
      : 'Pin to Top',
    icon: desktop.alwaysOnTop?.isPinned(context.windowId) ? '📍' : '📌',
    action: () => desktop.alwaysOnTop?.toggle(context.windowId)
  }
])
```

## How It Works

### 1. Method Wrapping

The core technique is wrapping `desktop.focusWindow`:

```typescript
install(desktop) {
  // Save original method
  const originalFocusWindow = desktop.focusWindow.bind(desktop)

  // Replace with wrapped version
  desktop.focusWindow = (windowId: string) => {
    originalFocusWindow(windowId)
    // Additional logic for pinned windows...
  }

  // Restore on cleanup
  return () => {
    desktop.focusWindow = originalFocusWindow
  }
}
```

**Important**: Always use `.bind(desktop)` when storing method references to preserve `this` context.

### 2. Maintaining Pin Order

When any window is focused:

```typescript
desktop.focusWindow = (windowId: string) => {
  // 1. Focus the requested window
  originalFocusWindow(windowId)

  // 2. Re-focus pinned windows (except the focused one)
  pinnedWindows.forEach((pinnedId) => {
    if (pinnedId !== windowId) {
      originalFocusWindow(pinnedId)
    }
  })

  // 3. If focused window is pinned, ensure it's on top
  if (pinnedWindows.has(windowId)) {
    originalFocusWindow(windowId)
  }
}
```

This ensures pinned windows always stay above non-pinned windows.

### 3. State Cleanup

When windows are closed, remove them from the pinned set:

```typescript
const unsubClose = desktop.on('window:closed', ({ windowId }) => {
  pinnedWindows.delete(windowId)
})
```

## API Reference

### `desktop.alwaysOnTop.pin(windowId)`

Pin a window to stay on top.

```typescript
desktop.alwaysOnTop?.pin('my-window')
```

### `desktop.alwaysOnTop.unpin(windowId)`

Unpin a window, allowing it to be covered.

```typescript
desktop.alwaysOnTop?.unpin('my-window')
```

### `desktop.alwaysOnTop.isPinned(windowId)`

Check if a window is pinned.

```typescript
if (desktop.alwaysOnTop?.isPinned('my-window')) {
  // Window is pinned
}
```

### `desktop.alwaysOnTop.toggle(windowId)`

Toggle pin state. Returns new state.

```typescript
const nowPinned = desktop.alwaysOnTop?.toggle('my-window')
// nowPinned: true (pinned) or false (unpinned)
```

### `desktop.alwaysOnTop.getPinnedWindows()`

Get all pinned window IDs.

```typescript
const pinned = desktop.alwaysOnTop?.getPinnedWindows()
// ['win-1', 'win-3']
```

## Key Concepts

### Method Wrapping Pattern

This is a powerful but dangerous pattern. Guidelines:

1. **Always save the original**: `const orig = method.bind(context)`
2. **Call the original**: Don't skip it unless intentional
3. **Restore on cleanup**: Essential for proper uninstall
4. **Use bind()**: Preserve `this` context

### When to Use Method Wrapping

Good use cases:
- Adding behavior before/after core operations
- Intercepting and modifying parameters
- Adding side effects (logging, analytics)
- Implementing features that require hooking into core flow

Avoid when:
- Event listening would suffice
- You can use composition instead
- The behavior doesn't need to intercept the core method

### Order of Operations

When wrapping methods that affect window order:
1. Perform the normal operation first
2. Apply your modifications after
3. Handle edge cases (closed windows, etc.)

## Cleanup Checklist

For method-wrapping plugins, ensure cleanup:

- [x] Restore original methods
- [x] Unsubscribe from events
- [x] Remove API from desktop
- [x] Clear internal state

```typescript
return () => {
  desktop.focusWindow = originalFocusWindow  // Restore method
  unsubClose()                                // Unsubscribe events
  delete (desktop as any).alwaysOnTop        // Remove API
  pinnedWindows.clear()                       // Clear state
}
```

## Customization Ideas

- Add visual indicator for pinned windows (icon in title bar)
- Support pin groups (multiple layers of always-on-top)
- Add keyboard shortcut to toggle pin (Ctrl+T)
- Persist pinned state across sessions
- Add "pin all" and "unpin all" actions
