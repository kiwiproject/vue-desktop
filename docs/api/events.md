# Events

The desktop instance emits events for window lifecycle changes. Subscribe using the `on()` method.

## Subscribing to Events

```ts
// Subscribe
const unsubscribe = desktop.on('window:created', (payload) => {
  console.log('Window created:', payload)
})

// Unsubscribe
unsubscribe()
// or
desktop.off('window:created', handler)
```

## Event Reference

### window:created

Emitted when a window is created.

**Payload:** `WindowDefinition`

```ts
desktop.on('window:created', (window) => {
  console.log('Created:', window.id, window.title)
})
```

---

### window:closed

Emitted when a window is closed.

**Payload:**
```ts
{
  windowId: string
  window: WindowDefinition
}
```

```ts
desktop.on('window:closed', ({ windowId, window }) => {
  console.log('Closed:', windowId, window.title)
})
```

---

### window:focused

Emitted when a window gains focus.

**Payload:**
```ts
{
  windowId: string
}
```

```ts
desktop.on('window:focused', ({ windowId }) => {
  console.log('Focused:', windowId)
})
```

---

### window:blurred

Emitted when a window loses focus (another window is focused).

**Payload:**
```ts
{
  windowId: string
}
```

```ts
desktop.on('window:blurred', ({ windowId }) => {
  console.log('Lost focus:', windowId)
})
```

---

### window:minimized

Emitted when a window is minimized.

**Payload:**
```ts
{
  windowId: string
}
```

```ts
desktop.on('window:minimized', ({ windowId }) => {
  console.log('Minimized:', windowId)
})
```

---

### window:maximized

Emitted when a window is maximized.

**Payload:**
```ts
{
  windowId: string
}
```

```ts
desktop.on('window:maximized', ({ windowId }) => {
  console.log('Maximized:', windowId)
})
```

---

### window:restored

Emitted when a window is restored to normal mode.

**Payload:**
```ts
{
  windowId: string
}
```

```ts
desktop.on('window:restored', ({ windowId }) => {
  console.log('Restored:', windowId)
})
```

---

### window:bounds

Emitted when a window's position or size changes.

**Payload:**
```ts
{
  windowId: string
  bounds: Bounds
  oldBounds: Bounds | undefined
}
```

```ts
desktop.on('window:bounds', ({ windowId, bounds, oldBounds }) => {
  console.log('Bounds changed:', windowId)
  console.log('New:', bounds)
  console.log('Old:', oldBounds)
})
```

---

## Event Patterns

### Cleanup Pattern

Always store unsubscribe functions for cleanup:

```ts
// In a Vue component
import { onMounted, onUnmounted } from 'vue'

let unsubscribers: (() => void)[] = []

onMounted(() => {
  unsubscribers = [
    desktop.on('window:created', handleCreated),
    desktop.on('window:closed', handleClosed),
    desktop.on('window:focused', handleFocused)
  ]
})

onUnmounted(() => {
  unsubscribers.forEach(unsub => unsub())
})
```

### Multiple Event Subscription

```ts
const events = [
  'window:created',
  'window:closed',
  'window:focused',
  'window:minimized',
  'window:maximized',
  'window:restored'
]

const unsubscribers = events.map(event =>
  desktop.on(event, (payload) => {
    console.log(`[${event}]`, payload)
  })
)

// Cleanup
const cleanup = () => unsubscribers.forEach(u => u())
```

### Tracking Window State

```ts
const windowStates = new Map<string, {
  focused: boolean
  mode: WindowMode
}>()

desktop.on('window:created', (window) => {
  windowStates.set(window.id!, {
    focused: false,
    mode: 'normal'
  })
})

desktop.on('window:closed', ({ windowId }) => {
  windowStates.delete(windowId)
})

desktop.on('window:focused', ({ windowId }) => {
  // Blur all others
  windowStates.forEach((state, id) => {
    state.focused = id === windowId
  })
})

desktop.on('window:minimized', ({ windowId }) => {
  const state = windowStates.get(windowId)
  if (state) state.mode = 'minimized'
})

desktop.on('window:maximized', ({ windowId }) => {
  const state = windowStates.get(windowId)
  if (state) state.mode = 'maximized'
})

desktop.on('window:restored', ({ windowId }) => {
  const state = windowStates.get(windowId)
  if (state) state.mode = 'normal'
})
```

### Analytics Example

```ts
function trackWindowEvent(event: string, data: Record<string, unknown>) {
  // Send to analytics service
  analytics.track(event, {
    timestamp: Date.now(),
    ...data
  })
}

desktop.on('window:created', (window) => {
  trackWindowEvent('window_opened', {
    windowType: window.type,
    windowTitle: window.title
  })
})

desktop.on('window:closed', ({ windowId, window }) => {
  trackWindowEvent('window_closed', {
    windowType: window.type,
    windowId
  })
})
```
