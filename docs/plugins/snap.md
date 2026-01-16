# Snap Plugin

Enables window snapping to viewport edges, other windows, and grid positions.

## Installation

```ts
// With default options
import { SnapPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(SnapPlugin)

// Or with custom options
import { createSnapPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(createSnapPlugin({
  threshold: 20,
  edgeSnap: true,
  windowSnap: true,
  gridSnap: true,
  gridSize: 50
}))
```

## Options

```ts
interface SnapOptions {
  threshold?: number    // Snap distance in pixels (default: 10)
  edgeSnap?: boolean    // Snap to viewport edges (default: true)
  windowSnap?: boolean  // Snap to other windows (default: true)
  gridSnap?: boolean    // Snap to grid (default: false)
  gridSize?: number     // Grid size in pixels (default: 20)
}
```

## Features

### Edge Snapping

Windows snap to the viewport edges when dragged close:

- Top, bottom, left, right edges
- Snaps window position (x, y)
- Snaps window size edges (x+width, y+height)

### Window-to-Window Snapping

Windows snap to align with other windows:

- Align left edges
- Align right edges
- Align top edges
- Align bottom edges
- Dock adjacent (window edge to window edge)

### Grid Snapping

Windows snap to grid positions during drag and resize.

## API

After installation, access the API via `desktop.snap`:

```ts
import type { DesktopWithSnap } from '@kiwiproject/vue-desktop'

const { snap } = desktop as DesktopWithSnap
```

### setEnabled(enabled)

Enable or disable snapping.

```ts
snap.setEnabled(false)  // Disable
snap.setEnabled(true)   // Enable
```

### isEnabled()

Check if snapping is enabled.

```ts
if (snap.isEnabled()) {
  console.log('Snapping is on')
}
```

### setOptions(options)

Update snap options at runtime.

```ts
snap.setOptions({
  threshold: 30,
  gridSnap: true,
  gridSize: 100
})
```

### getOptions()

Get current snap options.

```ts
const options = snap.getOptions()
console.log(options.threshold)
```

## Utility Functions

These functions are exported for use in custom implementations:

### snapToValue(value, target, threshold)

Snap a value to a target if within threshold.

```ts
import { snapToValue } from '@kiwiproject/vue-desktop'

const snapped = snapToValue(98, 100, 10)
// Returns 100 (98 is within 10 of 100)

const notSnapped = snapToValue(85, 100, 10)
// Returns 85 (85 is not within 10 of 100)
```

### snapToGrid(value, gridSize)

Snap a value to the nearest grid position.

```ts
import { snapToGrid } from '@kiwiproject/vue-desktop'

const snapped = snapToGrid(73, 50)
// Returns 50 (nearest multiple of 50)

const snapped2 = snapToGrid(88, 50)
// Returns 100
```

### snapToEdges(bounds, viewport, threshold)

Snap bounds to viewport edges.

```ts
import { snapToEdges } from '@kiwiproject/vue-desktop'

const snapped = snapToEdges(
  { x: 8, y: 12, width: 400, height: 300 },
  { width: 1920, height: 1080 },
  10
)
// { x: 0, y: 0, width: 400, height: 300 }
```

### snapToWindows(bounds, windows, excludeId, threshold)

Snap bounds to align with other windows.

```ts
import { snapToWindows } from '@kiwiproject/vue-desktop'

const otherWindows = [
  { id: 'win1', x: 0, y: 0, width: 400, height: 300 },
  { id: 'win2', x: 500, y: 0, width: 400, height: 300 }
]

const snapped = snapToWindows(
  { x: 395, y: 50, width: 300, height: 200 },
  otherWindows,
  'current-window-id',
  10
)
// { x: 400, y: 0, width: 300, height: 200 }
// Snapped to right edge of win1 and top of win1
```

### applySnapping(bounds, options, viewport, windows, excludeId)

Apply all snapping logic.

```ts
import { applySnapping } from '@kiwiproject/vue-desktop'

const snapped = applySnapping(
  { x: 8, y: 12, width: 400, height: 300 },
  { threshold: 10, edgeSnap: true, windowSnap: true },
  { width: 1920, height: 1080 },
  otherWindowBounds,
  'current-window-id'
)
```

## Example: Toggle Button

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDesktop } from '@kiwiproject/vue-desktop'
import type { DesktopWithSnap } from '@kiwiproject/vue-desktop'

const desktop = useDesktop() as DesktopWithSnap
const snapEnabled = ref(desktop.snap?.isEnabled() ?? false)

function toggleSnap() {
  snapEnabled.value = !snapEnabled.value
  desktop.snap?.setEnabled(snapEnabled.value)
}
</script>

<template>
  <button @click="toggleSnap">
    Snap: {{ snapEnabled ? 'ON' : 'OFF' }}
  </button>
</template>
```
