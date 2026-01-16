# Window Counter Plugin

**Difficulty**: Intermediate

A plugin that tracks window lifecycle statistics and exposes them via a custom API on the desktop instance.

## What This Example Demonstrates

- Extending the desktop instance with a custom API
- TypeScript interface extension pattern for type safety
- Stateful plugins with internal tracking
- Factory function pattern
- Separating types into a dedicated file

## Files

- `index.ts` - Plugin implementation and factory function
- `types.ts` - TypeScript interfaces for the API

## Usage

### Basic Usage

```typescript
import { createDesktop } from '@kiwiproject/vue-desktop'
import {
  createWindowCounterPlugin,
  DesktopWithCounter
} from './examples/plugins/window-counter-plugin'

// Create desktop with extended type
const desktop = createDesktop() as DesktopWithCounter
desktop.installPlugin(createWindowCounterPlugin())

// Create some windows
desktop.createWindow({ title: 'Window 1', component: MyComponent })
desktop.createWindow({ title: 'Window 2', component: MyComponent })

// Access the counter API
console.log(desktop.counter?.getCount())  // 2

console.log(desktop.counter?.getStats())
// { created: 2, closed: 0, current: 2, peak: 2 }
```

### In Vue Components

```typescript
import { computed } from 'vue'
import { useDesktop } from '@kiwiproject/vue-desktop'
import type { DesktopWithCounter } from './examples/plugins/window-counter-plugin'

export default {
  setup() {
    const desktop = useDesktop() as DesktopWithCounter

    const stats = computed(() => desktop.counter?.getStats())

    return { stats }
  }
}
```

## How It Works

### 1. Type Extension

```typescript
// types.ts
export interface CounterAPI {
  getCount(): number
  getStats(): WindowStats
  reset(): void
}

export interface DesktopWithCounter extends DesktopInstance {
  counter?: CounterAPI
}
```

This pattern:
- Defines the shape of your plugin's API
- Extends `DesktopInstance` with the new property
- Makes the API optional (`?`) since plugin may not be installed

### 2. Attaching the API

```typescript
install(desktop) {
  const api: CounterAPI = {
    getCount() { return desktop.windows.length },
    getStats() { return { created, closed, current: desktop.windows.length, peak } },
    reset() { /* ... */ }
  }

  // Attach to desktop
  (desktop as DesktopWithCounter).counter = api

  // Remove on cleanup
  return () => {
    delete (desktop as DesktopWithCounter).counter
  }
}
```

### 3. Internal State

```typescript
install(desktop) {
  // Private state - not exposed directly
  let created = 0
  let closed = 0
  let peak = 0

  // Subscribe to events to update state
  const unsubCreate = desktop.on('window:created', () => {
    created++
    // Update peak if needed
  })

  // Expose state via API methods
  const api = {
    getStats() {
      return { created, closed, current: desktop.windows.length, peak }
    }
  }
}
```

Using closures keeps state private while exposing controlled access via API methods.

## API Reference

### `desktop.counter.getCount()`

Returns the current number of open windows.

```typescript
const count = desktop.counter?.getCount()  // number
```

### `desktop.counter.getStats()`

Returns detailed statistics:

```typescript
interface WindowStats {
  created: number   // Total windows created since plugin install
  closed: number    // Total windows closed since plugin install
  current: number   // Currently open windows
  peak: number      // Maximum windows open at once
}

const stats = desktop.counter?.getStats()
```

### `desktop.counter.reset()`

Resets statistics without affecting open windows.

```typescript
desktop.counter?.reset()
// Stats are now: { created: 0, closed: 0, current: <current>, peak: <current> }
```

## Key Concepts

### Type-Safe API Extension

Always define types for your plugin's API:

```typescript
// Good - Type-safe
const desktop = createDesktop() as DesktopWithCounter
desktop.counter?.getStats()  // TypeScript knows about counter

// Avoid - No type safety
(desktop as any).counter.getStats()
```

### Optional Chaining

Since plugins may not be installed, use optional chaining:

```typescript
// Safe - handles missing plugin
desktop.counter?.getStats()

// Risky - throws if plugin not installed
desktop.counter.getStats()
```

### Cleanup API Properties

Always remove attached APIs during cleanup:

```typescript
return () => {
  delete (desktop as DesktopWithCounter).counter
}
```

## Customization Ideas

- Add window type tracking (count by type)
- Add time-based statistics (windows per minute)
- Expose events when thresholds are crossed
- Add window duration tracking (how long each window is open)
