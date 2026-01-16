# Clock Plugin

**Difficulty**: Beginner

A simple example plugin that displays a clock overlay in the corner of the desktop.

## What This Example Demonstrates

- Basic plugin structure (`name` + `install` function)
- Registering UI components with `registerUI()`
- Proper cleanup by returning an unregister function
- Creating a Vue component with render functions

## Files

- `index.ts` - Plugin definition
- `ClockOverlay.ts` - Vue component for the clock display

## Usage

```typescript
import { createDesktop, provideDesktop } from '@kiwiproject/vue-desktop'
import { ClockPlugin } from './examples/plugins/clock-plugin'

// Create and configure desktop
const desktop = createDesktop()
desktop.installPlugin(ClockPlugin)

// In your Vue component setup:
provideDesktop(desktop)
```

## How It Works

### 1. Plugin Definition

```typescript
export const ClockPlugin: Plugin = {
  name: "clock",
  install(desktop) {
    // ... setup code
    return () => { /* cleanup */ }
  }
}
```

Every plugin needs:
- `name`: Unique identifier for the plugin
- `install(desktop)`: Function called when plugin is installed

### 2. Registering UI

```typescript
const unregister = desktop.registerUI({
  id: "clock-overlay",      // Unique ID for this UI registration
  slot: "overlay",          // Where to render: 'overlay' or 'taskbar'
  component: ClockOverlay,  // Vue component to render
  order: 1000               // Render order (higher = on top)
})
```

The `registerUI()` method returns an unregister function that should be called during cleanup.

### 3. Cleanup

```typescript
install(desktop) {
  const unregister = desktop.registerUI({ ... })

  // Return cleanup function
  return unregister
}
```

When your plugin is uninstalled, vue-desktop calls the function you returned from `install()`. This ensures proper resource cleanup.

## Key Concepts

### UI Slots

vue-desktop provides two built-in slots for plugin UI:
- `overlay`: Renders above all windows (good for modals, notifications, clocks)
- `taskbar`: Renders in the taskbar area

Use `<UISlot slot="overlay" />` in your app to render registered overlay components.

### Render Functions

The clock component uses Vue's render function syntax instead of templates:

```typescript
return () => h('div', { class: 'clock-overlay' }, time.value)
```

This is common in plugins because:
- No build step required for templates
- More control over the rendered output
- Easier to distribute as plain TypeScript

## Customization Ideas

- Add date display
- Make position configurable via plugin options
- Add click-to-toggle between 12/24 hour format
- Style based on focused window theme
