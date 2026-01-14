<template>
  <div class="demo-app">
    <div class="demo-toolbar">
      <h1>Vue Desktop — Demo</h1>
      <button @click="openWindow">Open Window</button>
    </div>
    <div class="demo-desktop" ref="desktopRef">
      <WindowHost />
      <UISlot name="taskbar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref, onMounted } from 'vue'
import {
  createDesktop,
  provideDesktop,
  WindowHost,
  UISlot,
  TaskbarPlugin,
  ShortcutsPlugin,
  createSnapPlugin,
  createPersistencePlugin,
  type PersistedWindowInfo,
  type DesktopInstanceWithPersistence
} from '@kiwiproject/vue-desktop'
import '@kiwiproject/vue-desktop/styles.css'

// Define window components first (so they're available for the factory)
const SampleContent = defineComponent({
  name: 'SampleContent',
  props: { message: String },
  setup(props) {
    return () => h('div', [
      h('p', `This is window content.`),
      h('p', props.message || 'No message provided.')
    ])
  }
})

// Window type registry - maps type names to components
const windowComponents: Record<string, ReturnType<typeof defineComponent>> = {
  sample: SampleContent
}

// Window factory for session restoration
function windowFactory(info: PersistedWindowInfo) {
  const component = windowComponents[info.type]
  if (!component) return null

  return {
    type: info.type,
    title: info.title,
    component,
    props: info.props,
    singletonKey: info.singletonKey,
    meta: info.meta
  }
}

const desktopRef = ref<HTMLElement | null>(null)

const desktop = createDesktop()
desktop.installPlugin(TaskbarPlugin)
desktop.installPlugin(ShortcutsPlugin)
desktop.installPlugin(createSnapPlugin({
  edges: true,
  windows: true,
  threshold: 12,
  getViewport: () => {
    if (!desktopRef.value) return undefined
    return {
      x: 0,
      y: 0,
      width: desktopRef.value.clientWidth,
      height: desktopRef.value.clientHeight - 48 // Account for taskbar
    }
  }
}))
desktop.installPlugin(createPersistencePlugin({
  storageKey: 'vue-desktop-demo',
  persistSession: true,
  windowFactory
}))
provideDesktop(desktop)

// Restore session on mount
onMounted(() => {
  ;(desktop as DesktopInstanceWithPersistence).persistence?.restoreSession()
})

let windowCount = 0

function openWindow() {
  windowCount++
  desktop.createWindow({
    type: 'sample',
    title: `Window ${windowCount}`,
    component: SampleContent,
    props: { message: `Hello from window ${windowCount}!` },
    initialBounds: {
      x: 50 + (windowCount - 1) * 30,
      y: 50 + (windowCount - 1) * 30,
      width: 400,
      height: 300
    }
  })
}
</script>

<style>
* { box-sizing: border-box; }
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 0;
}
.demo-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f0f0f0;
  border-bottom: 1px solid #ccc;
}
.demo-toolbar h1 {
  margin: 0;
  font-size: 18px;
}
.demo-toolbar button {
  padding: 8px 16px;
  border: 1px solid #999;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
.demo-toolbar button:hover {
  background: #e8e8e8;
}
.demo-desktop {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
