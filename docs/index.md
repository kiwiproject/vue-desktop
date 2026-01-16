---
layout: home

hero:
  name: vue-desktop
  text: Desktop-style window manager for Vue 3
  tagline: Create rich, desktop-like experiences in the browser with draggable, resizable windows
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Demo
      link: /demo/
    - theme: alt
      text: GitHub
      link: https://github.com/anthropics/vue-desktop

features:
  - icon: 🪟
    title: Window Management
    details: Create, minimize, maximize, and restore windows with full z-order management and focus tracking.
  - icon: ⌨️
    title: Keyboard Shortcuts
    details: Built-in Alt+Tab window switching, customizable shortcuts, and full keyboard navigation support.
  - icon: 🔌
    title: Plugin System
    details: Extend functionality with plugins for taskbar, snap-to-edge, persistence, spotlight search, and more.
  - icon: 🎨
    title: Fully Customizable
    details: Style windows with CSS custom properties, create custom window components, and extend the API.
  - icon: ♿
    title: Accessible
    details: Comprehensive ARIA attributes and keyboard navigation for screen reader support.
  - icon: 📦
    title: TypeScript First
    details: Full TypeScript support with complete type definitions for all APIs.
---

## Quick Example

```vue
<script setup lang="ts">
import { createDesktop, provideDesktop, WindowHost, TaskbarPlugin } from '@anthropic/vue-desktop'
import '@anthropic/vue-desktop/styles.css'
import MyApp from './MyApp.vue'

const desktop = createDesktop()
desktop.installPlugin(TaskbarPlugin)
provideDesktop(desktop)

// Create a window
desktop.createWindow({
  type: 'app',
  title: 'My Application',
  component: MyApp
})
</script>

<template>
  <WindowHost />
</template>
```
