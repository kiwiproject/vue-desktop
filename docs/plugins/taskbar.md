# Taskbar Plugin

Displays a taskbar showing all open windows with click-to-focus functionality.

## Installation

```ts
import { TaskbarPlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(TaskbarPlugin)
```

## Usage

Render the taskbar using `UISlot`:

```vue
<template>
  <div class="desktop">
    <WindowHost />
    <UISlot slot="taskbar" />
  </div>
</template>

<style>
.desktop {
  width: 100vw;
  height: 100vh;
  padding-bottom: 48px; /* Make room for taskbar */
}
</style>
```

## Features

- Shows all windows (including minimized)
- Visual indicator for focused window
- Visual indicator for minimized windows
- Click behavior:
  - Minimized window → Restore and focus
  - Focused window → Minimize
  - Unfocused window → Focus

## Styling

```css
/* Taskbar container */
.vd-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 4px;
}

/* Individual taskbar item */
.vd-taskbar-item {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.vd-taskbar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Focused window indicator */
.vd-taskbar-item.focused {
  background: rgba(255, 255, 255, 0.15);
}

/* Minimized window styling */
.vd-taskbar-item.minimized {
  opacity: 0.6;
}
```

## Custom Taskbar

For complete control, create your own taskbar component:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDesktop } from '@kiwiproject/vue-desktop'

const desktop = useDesktop()

const windows = computed(() => desktop.windows)
const focusedId = computed(() => desktop.getFocusedWindowId())

function handleClick(windowId: string) {
  const mode = desktop.getMode(windowId)
  const isFocused = windowId === focusedId.value

  if (mode === 'minimized') {
    desktop.restoreWindow(windowId)
    desktop.focusWindow(windowId)
  } else if (isFocused) {
    desktop.minimizeWindow(windowId)
  } else {
    desktop.focusWindow(windowId)
  }
}
</script>

<template>
  <div class="my-taskbar">
    <button
      v-for="win in windows"
      :key="win.id"
      :class="{
        focused: win.id === focusedId,
        minimized: desktop.getMode(win.id!) === 'minimized'
      }"
      @click="handleClick(win.id!)"
    >
      {{ win.title }}
    </button>
  </div>
</template>
```

## Accessibility

The taskbar includes:
- `role="toolbar"` on the container
- `aria-pressed` states on buttons
- Descriptive `aria-label` for each item
