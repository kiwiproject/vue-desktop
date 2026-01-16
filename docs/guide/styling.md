# Styling

## Default Styles

Import the default styles in your app:

```ts
import '@anthropic/vue-desktop/styles.css'
```

## CSS Custom Properties

Customize the appearance using CSS custom properties:

```css
:root {
  /* Window chrome */
  --vd-window-bg: #ffffff;
  --vd-window-border: #cccccc;
  --vd-window-border-radius: 8px;
  --vd-window-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  /* Header */
  --vd-header-bg: #f5f5f5;
  --vd-header-height: 32px;
  --vd-header-text: #333333;

  /* Controls (minimize, maximize, close) */
  --vd-control-size: 12px;
  --vd-control-close: #ff5f57;
  --vd-control-minimize: #ffbd2e;
  --vd-control-maximize: #28c840;

  /* Focused window */
  --vd-window-focused-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  --vd-header-focused-bg: #e8e8e8;

  /* Taskbar */
  --vd-taskbar-bg: rgba(30, 30, 30, 0.9);
  --vd-taskbar-height: 48px;
  --vd-taskbar-item-bg: transparent;
  --vd-taskbar-item-hover: rgba(255, 255, 255, 0.1);
  --vd-taskbar-item-active: rgba(255, 255, 255, 0.2);

  /* Menu bar */
  --vd-menubar-bg: #f5f5f5;
  --vd-menubar-text: #333333;
  --vd-menu-bg: #ffffff;
  --vd-menu-hover: #e8e8e8;
  --vd-menu-text: #333333;
}
```

## Dark Theme Example

```css
.dark-theme {
  --vd-window-bg: #1e1e1e;
  --vd-window-border: #333333;
  --vd-window-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

  --vd-header-bg: #2d2d2d;
  --vd-header-text: #ffffff;
  --vd-header-focused-bg: #3d3d3d;

  --vd-menubar-bg: #2d2d2d;
  --vd-menubar-text: #ffffff;
  --vd-menu-bg: #252525;
  --vd-menu-hover: #3d3d3d;
  --vd-menu-text: #ffffff;
}
```

## Custom Window Styles

Style specific window types:

```css
/* Style windows by type */
.vd-window[data-window-type="settings"] {
  --vd-window-border-radius: 12px;
}

/* Style the window body */
.vd-window-body {
  padding: 16px;
}

/* Custom header for specific windows */
.vd-window[data-window-type="media-player"] .vd-window-header {
  background: linear-gradient(to right, #1a1a2e, #16213e);
}
```

## Resize Handles

Style the resize handles:

```css
.vd-resize-handle {
  /* Handles are transparent by default */
  /* Add visible handles: */
  background: rgba(100, 100, 100, 0.2);
}

.vd-resize-handle:hover {
  background: rgba(100, 100, 100, 0.4);
}
```

## Window Switcher

Customize the Alt+Tab overlay:

```css
.vd-switcher {
  --vd-switcher-bg: rgba(0, 0, 0, 0.8);
  --vd-switcher-item-bg: rgba(255, 255, 255, 0.1);
  --vd-switcher-item-selected: rgba(255, 255, 255, 0.2);
  --vd-switcher-border-radius: 8px;
}
```

## Taskbar Customization

```css
/* Horizontal taskbar at bottom */
.vd-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--vd-taskbar-height);
  background: var(--vd-taskbar-bg);
  backdrop-filter: blur(10px);
}

/* macOS-style dock */
.vd-taskbar.dock-style {
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  border-radius: 16px;
  padding: 4px 8px;
}
```

## Context Menu Styling

```css
.vd-context-menu {
  --vd-context-bg: #ffffff;
  --vd-context-border: #e0e0e0;
  --vd-context-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --vd-context-item-hover: #f0f0f0;
  --vd-context-separator: #e0e0e0;
}
```

## Animations

Add smooth transitions:

```css
.vd-window {
  transition: box-shadow 0.2s ease;
}

.vd-window.minimizing {
  animation: minimize 0.2s ease forwards;
}

@keyframes minimize {
  to {
    transform: scale(0.8);
    opacity: 0;
  }
}

.vd-window.maximizing {
  transition: all 0.2s ease;
}
```

## Completely Custom Window Chrome

For complete control, create a custom WindowShell:

```vue
<script setup lang="ts">
import { useDesktop } from '@anthropic/vue-desktop'

const props = defineProps<{
  windowId: string
  title: string
}>()

const desktop = useDesktop()

function close() {
  desktop.closeWindow(props.windowId)
}
</script>

<template>
  <div class="my-custom-window">
    <header class="my-header">
      <span>{{ title }}</span>
      <button @click="close">×</button>
    </header>
    <main class="my-body">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.my-custom-window {
  /* Your custom styles */
}
</style>
```
