# Window Logger Plugin

**Difficulty**: Beginner

An event-driven plugin that logs window lifecycle events to the console. Useful for debugging and understanding the event system.

## What This Example Demonstrates

- Event subscription with `desktop.on()`
- Proper cleanup of multiple event subscriptions
- Factory function pattern for configurable plugins
- TypeScript typing for plugin options

## Files

- `index.ts` - Plugin definition with factory function

## Usage

### Basic Usage

```typescript
import { createDesktop } from '@kiwiproject/vue-desktop'
import { WindowLoggerPlugin } from './examples/plugins/window-logger-plugin'

const desktop = createDesktop()
desktop.installPlugin(WindowLoggerPlugin)

// Now creates a window...
desktop.createWindow({ title: 'Test', component: MyComponent })
// Console: [vue-desktop] window:created { id: "win-1", title: "Test", ... }
```

### Custom Configuration

```typescript
import { createWindowLoggerPlugin } from './examples/plugins/window-logger-plugin'

// Log only focus events
const focusLogger = createWindowLoggerPlugin({
  events: ['window:focused', 'window:blurred']
})

// Use custom logger function
const customLogger = createWindowLoggerPlugin({
  logger: (event, data) => {
    myAnalytics.track(event, data)
  }
})

// Custom prefix
const prefixedLogger = createWindowLoggerPlugin({
  prefix: '[MyApp]'
})
```

## How It Works

### 1. Event Subscription

```typescript
const unsubscribers = events.map((event) =>
  desktop.on(event, (data) => {
    logger(`${prefix} ${event}`, data)
  })
)
```

The `desktop.on(event, handler)` method:
- Subscribes to a specific event
- Returns an unsubscribe function
- Handler receives event-specific data

### 2. Multiple Subscriptions

```typescript
// Subscribe to multiple events
const unsubscribers = events.map(event => desktop.on(event, handler))

// Clean up all subscriptions
return () => {
  unsubscribers.forEach(unsub => unsub())
}
```

When subscribing to multiple events, store all unsubscribe functions and call them during cleanup.

### 3. Factory Function Pattern

```typescript
export function createWindowLoggerPlugin(options = {}): Plugin {
  return {
    name: "window-logger",
    install(desktop) { /* ... */ }
  }
}

// Pre-configured default instance
export const WindowLoggerPlugin = createWindowLoggerPlugin()
```

This pattern allows:
- Customization via options
- A default instance for simple use cases
- Multiple instances with different configurations

## Available Events

| Event | Data | Description |
|-------|------|-------------|
| `window:created` | WindowDefinition | Window was created |
| `window:closed` | `{ windowId }` | Window was closed |
| `window:focused` | `{ windowId }` | Window gained focus |
| `window:blurred` | `{ windowId }` | Window lost focus |
| `window:minimized` | `{ windowId }` | Window was minimized |
| `window:maximized` | `{ windowId }` | Window was maximized |
| `window:restored` | `{ windowId }` | Window was restored |
| `window:moved` | `{ windowId, bounds }` | Window position changed |
| `window:resized` | `{ windowId, bounds }` | Window size changed |

## Key Concepts

### Event-Driven Architecture

Plugins can react to desktop events without modifying core behavior. This is ideal for:
- Logging and analytics
- Syncing state with external systems
- Triggering side effects

### Cleanup is Essential

Always unsubscribe from events when your plugin is uninstalled:

```typescript
install(desktop) {
  const unsub = desktop.on('window:created', handler)
  return () => unsub()  // Called on uninstall
}
```

Failing to clean up can cause:
- Memory leaks
- Duplicate event handlers
- Unexpected behavior after reinstall

## Customization Ideas

- Filter events by window type or ID
- Log to a remote service
- Create event history for debugging
- Measure time between events for performance monitoring
