<template>
  <div class="demo-app">
    <div class="demo-toolbar">
      <h1>Vue Desktop — Demo</h1>
      <div class="demo-toolbar-buttons">
        <button @click="openWindow">New Window</button>
        <button @click="showHelp">Help</button>
        <button @click="clearSession" class="demo-btn-secondary">Clear Session</button>
      </div>
      <div class="demo-toolbar-toggles">
        <label>
          <input type="checkbox" v-model="snapEnabled" @change="toggleSnap" />
          Snap
        </label>
      </div>
      <span class="demo-hint">Right-click: Context Menu | Cmd/Ctrl+K: Spotlight | Alt+Tab: Switch</span>
    </div>
    <div class="demo-desktop" ref="desktopRef">
      <WindowHost />
      <UISlot name="taskbar" />
      <UISlot name="overlay" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref, onMounted, computed } from 'vue'
import {
  createDesktop,
  provideDesktop,
  WindowHost,
  UISlot,
  TaskbarPlugin,
  ShortcutsPlugin,
  createSnapPlugin,
  createPersistencePlugin,
  createStartMenuPlugin,
  createSpotlightPlugin,
  createContextMenuPlugin,
  type PersistedWindowInfo,
  type DesktopInstanceWithPersistence,
  type DesktopInstanceWithSnap,
  type MenuBarDefinition
} from '@kiwiproject/vue-desktop'
import '@kiwiproject/vue-desktop/styles.css'

// ============================================================================
// Window Components
// ============================================================================

// Basic content window
const SampleContent = defineComponent({
  name: 'SampleContent',
  props: { message: String },
  setup(props) {
    return () => h('div', { class: 'window-sample' }, [
      h('p', 'This is a sample window.'),
      h('p', props.message || 'No message provided.')
    ])
  }
})

// Text Editor window
const TextEditor = defineComponent({
  name: 'TextEditor',
  props: { initialContent: { type: String, default: '' } },
  setup(props) {
    const content = ref(props.initialContent)
    return () => h('div', { class: 'window-editor' }, [
      h('textarea', {
        value: content.value,
        onInput: (e: Event) => { content.value = (e.target as HTMLTextAreaElement).value },
        placeholder: 'Start typing...'
      })
    ])
  }
})

// Image Viewer window
const ImageViewer = defineComponent({
  name: 'ImageViewer',
  props: {
    imageUrl: { type: String, default: 'https://picsum.photos/400/300' },
    caption: { type: String, default: '' }
  },
  setup(props) {
    return () => h('div', { class: 'window-image-viewer' }, [
      h('img', { src: props.imageUrl, alt: props.caption || 'Image' }),
      props.caption && h('p', { class: 'image-caption' }, props.caption)
    ])
  }
})

// Color Picker window
const ColorPicker = defineComponent({
  name: 'ColorPicker',
  setup() {
    const selectedColor = ref('#667eea')
    const presetColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140']

    return () => h('div', { class: 'window-color-picker' }, [
      h('div', { class: 'color-preview', style: { backgroundColor: selectedColor.value } }),
      h('input', {
        type: 'color',
        value: selectedColor.value,
        onInput: (e: Event) => { selectedColor.value = (e.target as HTMLInputElement).value }
      }),
      h('div', { class: 'color-value' }, selectedColor.value),
      h('div', { class: 'color-presets' },
        presetColors.map(color =>
          h('button', {
            class: 'color-preset',
            style: { backgroundColor: color },
            onClick: () => { selectedColor.value = color }
          })
        )
      )
    ])
  }
})

// About Dialog
const AboutDialog = defineComponent({
  name: 'AboutDialog',
  setup() {
    return () => h('div', { class: 'window-about' }, [
      h('div', { class: 'about-logo' }, 'Vue Desktop'),
      h('p', { class: 'about-version' }, 'Version 0.0.0'),
      h('p', 'A Vue 3 desktop-style window manager library.'),
      h('ul', [
        h('li', 'Draggable & resizable windows'),
        h('li', 'Minimize, maximize, restore'),
        h('li', 'Plugin architecture'),
        h('li', 'Session persistence'),
        h('li', 'Keyboard shortcuts'),
        h('li', 'Window snapping')
      ]),
      h('p', { class: 'about-link' }, [
        'GitHub: ',
        h('a', { href: 'https://github.com/kiwiproject/vue-desktop', target: '_blank' }, 'kiwiproject/vue-desktop')
      ])
    ])
  }
})

// Help/Feature Showcase window
const HelpWindow = defineComponent({
  name: 'HelpWindow',
  setup() {
    return () => h('div', { class: 'window-help' }, [
      h('h3', 'Keyboard Shortcuts'),
      h('table', { class: 'shortcuts-table' }, [
        h('tbody', [
          h('tr', [h('td', 'Cmd/Ctrl + K'), h('td', 'Open Spotlight search')]),
          h('tr', [h('td', 'Alt + Tab'), h('td', 'Switch between windows')]),
          h('tr', [h('td', 'Ctrl + W'), h('td', 'Close focused window')]),
          h('tr', [h('td', 'Ctrl + M'), h('td', 'Minimize focused window')]),
          h('tr', [h('td', 'Ctrl + Shift + F'), h('td', 'Toggle maximize')]),
          h('tr', [h('td', 'Escape'), h('td', 'Close dialogs / cancel')]),
        ])
      ]),
      h('h3', 'Window Features'),
      h('ul', [
        h('li', 'Drag windows by the title bar'),
        h('li', 'Resize from any edge or corner'),
        h('li', 'Double-click title bar to maximize'),
        h('li', 'Right-click title bar for window menu'),
        h('li', 'Right-click desktop for context menu'),
        h('li', 'Windows snap to edges and other windows'),
        h('li', 'Session persists across page refreshes'),
        h('li', 'Per-window menu bars (see Text Editor)'),
      ]),
      h('h3', 'Plugins Enabled'),
      h('ul', [
        h('li', [h('strong', 'Taskbar'), ' — Shows open windows at bottom']),
        h('li', [h('strong', 'Start Menu'), ' — Click "Start" to launch apps']),
        h('li', [h('strong', 'Spotlight'), ' — Quick search with Cmd/Ctrl+K']),
        h('li', [h('strong', 'Context Menu'), ' — Right-click menus with submenus']),
        h('li', [h('strong', 'Shortcuts'), ' — Global keyboard shortcuts']),
        h('li', [h('strong', 'Snap'), ' — Window edge/grid snapping']),
        h('li', [h('strong', 'Persistence'), ' — Saves window state to localStorage']),
      ])
    ])
  }
})

// Counter Demo (interactive)
const CounterDemo = defineComponent({
  name: 'CounterDemo',
  setup() {
    const count = ref(0)
    return () => h('div', { class: 'window-counter' }, [
      h('div', { class: 'counter-display' }, count.value.toString()),
      h('div', { class: 'counter-buttons' }, [
        h('button', { onClick: () => count.value-- }, '-'),
        h('button', { onClick: () => count.value = 0 }, 'Reset'),
        h('button', { onClick: () => count.value++ }, '+'),
      ])
    ])
  }
})

// ============================================================================
// Window Registry & Factory
// ============================================================================

const windowComponents: Record<string, ReturnType<typeof defineComponent>> = {
  sample: SampleContent,
  editor: TextEditor,
  image: ImageViewer,
  color: ColorPicker,
  about: AboutDialog,
  help: HelpWindow,
  counter: CounterDemo
}

function windowFactory(info: PersistedWindowInfo) {
  const component = windowComponents[info.type]
  if (!component) return null

  return {
    type: info.type,
    title: info.title,
    icon: info.icon,
    component,
    props: info.props,
    singletonKey: info.singletonKey,
    meta: info.meta
  }
}

// ============================================================================
// Desktop Setup
// ============================================================================

const desktopRef = ref<HTMLElement | null>(null)
const snapEnabled = ref(true)

const desktop = createDesktop()

// Install plugins
desktop.installPlugin(TaskbarPlugin)
desktop.installPlugin(ShortcutsPlugin)

const snapPlugin = createSnapPlugin({
  edges: true,
  windows: true,
  threshold: 12,
  getViewport: () => {
    if (!desktopRef.value) return undefined
    return {
      x: 0,
      y: 0,
      width: desktopRef.value.clientWidth,
      height: desktopRef.value.clientHeight - 48
    }
  }
})
desktop.installPlugin(snapPlugin)

desktop.installPlugin(createPersistencePlugin({
  storageKey: 'vue-desktop-demo',
  persistSession: true,
  windowFactory
}))

// Start menu apps
let windowCounter = 0
desktop.installPlugin(createStartMenuPlugin({
  buttonLabel: 'Start',
  apps: [
    {
      id: 'new-window',
      label: 'New Window',
      icon: '📄',
      category: 'General',
      factory: () => ({
        type: 'sample',
        title: `Window ${++windowCounter}`,
        icon: '📄',
        component: SampleContent,
        props: { message: 'Opened from Start menu!' },
        initialBounds: { x: 100 + windowCounter * 30, y: 100 + windowCounter * 30, width: 400, height: 300 }
      })
    },
    {
      id: 'text-editor',
      label: 'Text Editor',
      icon: '📝',
      category: 'Utilities',
      factory: () => ({
        type: 'editor',
        title: 'Text Editor',
        icon: '📝',
        component: TextEditor,
        props: { initialContent: 'Hello, world!\n\nStart typing here...' },
        singletonKey: 'editor',
        initialBounds: { x: 150, y: 100, width: 500, height: 400 },
        menuBar: [
          {
            id: 'file',
            label: 'File',
            items: [
              { id: 'new', label: 'New', shortcut: 'Ctrl+N', action: () => alert('New file!') },
              { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => alert('Open file dialog') },
              { id: 'sep1', label: '', separator: true },
              { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: () => alert('File saved!') },
              { id: 'saveas', label: 'Save As...', action: () => alert('Save As dialog') },
              { id: 'sep2', label: '', separator: true },
              { id: 'exit', label: 'Exit', action: () => { /* window will be closed by user */ } }
            ]
          },
          {
            id: 'edit',
            label: 'Edit',
            items: [
              { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', disabled: true },
              { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', disabled: true },
              { id: 'sep1', label: '', separator: true },
              { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
              { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
              { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
              { id: 'sep2', label: '', separator: true },
              { id: 'selectall', label: 'Select All', shortcut: 'Ctrl+A', action: () => document.execCommand('selectAll') }
            ]
          },
          {
            id: 'view',
            label: 'View',
            items: [
              { id: 'zoomin', label: 'Zoom In', shortcut: 'Ctrl++', action: () => alert('Zoom in') },
              { id: 'zoomout', label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => alert('Zoom out') },
              { id: 'sep1', label: '', separator: true },
              { id: 'wordwrap', label: 'Word Wrap', action: () => alert('Toggle word wrap') }
            ]
          },
          {
            id: 'help',
            label: 'Help',
            items: [
              { id: 'about', label: 'About Text Editor', action: () => alert('Text Editor v1.0\nA simple text editor demo.') }
            ]
          }
        ] as MenuBarDefinition
      })
    },
    {
      id: 'image-viewer',
      label: 'Image Viewer',
      icon: '🖼️',
      category: 'Utilities',
      factory: () => ({
        type: 'image',
        title: 'Image Viewer',
        icon: '🖼️',
        component: ImageViewer,
        props: { imageUrl: 'https://picsum.photos/400/300', caption: 'Random image from Picsum' },
        initialBounds: { x: 200, y: 120, width: 450, height: 380 }
      })
    },
    {
      id: 'color-picker',
      label: 'Color Picker',
      icon: '🎨',
      category: 'Utilities',
      factory: () => ({
        type: 'color',
        title: 'Color Picker',
        icon: '🎨',
        component: ColorPicker,
        singletonKey: 'color-picker',
        initialBounds: { x: 250, y: 150, width: 280, height: 320 }
      })
    },
    {
      id: 'counter',
      label: 'Counter',
      icon: '🔢',
      category: 'Utilities',
      factory: () => ({
        type: 'counter',
        title: 'Counter',
        icon: '🔢',
        component: CounterDemo,
        singletonKey: 'counter',
        initialBounds: { x: 300, y: 180, width: 250, height: 200 }
      })
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      category: 'System',
      shortcut: 'F1',
      factory: () => ({
        type: 'help',
        title: 'Help & Shortcuts',
        icon: '❓',
        component: HelpWindow,
        singletonKey: 'help',
        initialBounds: { x: 180, y: 80, width: 420, height: 500 }
      })
    },
    {
      id: 'about',
      label: 'About',
      icon: 'ℹ️',
      category: 'System',
      factory: () => ({
        type: 'about',
        title: 'About Vue Desktop',
        icon: 'ℹ️',
        component: AboutDialog,
        singletonKey: 'about',
        behaviors: { resizable: false },
        initialBounds: { x: 200, y: 120, width: 320, height: 340 }
      })
    }
  ]
}))

desktop.installPlugin(createSpotlightPlugin({
  placeholder: 'Search apps and windows...',
  maxResults: 10
}))

// Context menus (right-click on desktop or window title bar)
desktop.installPlugin(createContextMenuPlugin({
  desktopMenu: (ctx) => [
    {
      id: 'new-window',
      label: 'New Window',
      icon: '📄',
      action: () => openWindow()
    },
    {
      id: 'apps',
      label: 'Applications',
      icon: '📁',
      children: [
        { id: 'app-editor', label: 'Text Editor', icon: '📝', action: () => {
          desktop.createWindow({
            type: 'editor',
            title: 'Text Editor',
            icon: '📝',
            component: TextEditor,
            singletonKey: 'editor',
            initialBounds: { x: 150, y: 100, width: 500, height: 400 },
            menuBar: [
              {
                id: 'file',
                label: 'File',
                items: [
                  { id: 'new', label: 'New', shortcut: 'Ctrl+N', action: () => alert('New file!') },
                  { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => alert('Open file dialog') },
                  { id: 'sep1', label: '', separator: true },
                  { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: () => alert('File saved!') }
                ]
              },
              {
                id: 'edit',
                label: 'Edit',
                items: [
                  { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
                  { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
                  { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V' }
                ]
              },
              {
                id: 'help',
                label: 'Help',
                items: [
                  { id: 'about', label: 'About', action: () => alert('Text Editor v1.0') }
                ]
              }
            ] as MenuBarDefinition
          })
        }},
        { id: 'app-color', label: 'Color Picker', icon: '🎨', action: () => {
          desktop.createWindow({
            type: 'color',
            title: 'Color Picker',
            icon: '🎨',
            component: ColorPicker,
            singletonKey: 'color-picker',
            initialBounds: { x: 250, y: 150, width: 280, height: 320 }
          })
        }},
        { id: 'app-counter', label: 'Counter', icon: '🔢', action: () => {
          desktop.createWindow({
            type: 'counter',
            title: 'Counter',
            icon: '🔢',
            component: CounterDemo,
            singletonKey: 'counter',
            initialBounds: { x: 300, y: 180, width: 250, height: 200 }
          })
        }}
      ]
    },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      shortcut: 'F1',
      action: () => showHelp()
    },
    {
      id: 'about',
      label: 'About',
      icon: 'ℹ️',
      action: () => {
        desktop.createWindow({
          type: 'about',
          title: 'About Vue Desktop',
          icon: 'ℹ️',
          component: AboutDialog,
          singletonKey: 'about',
          behaviors: { resizable: false },
          initialBounds: { x: 200, y: 120, width: 320, height: 340 }
        })
      }
    },
    { id: 'sep2', label: '', separator: true },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: '🔄',
      shortcut: 'F5',
      action: () => location.reload()
    }
  ],
  windowMenu: (ctx) => {
    const mode = ctx.desktop.getMode(ctx.windowId!)
    return [
      {
        id: 'minimize',
        label: 'Minimize',
        icon: '−',
        disabled: mode === 'minimized',
        action: () => ctx.desktop.minimizeWindow(ctx.windowId!)
      },
      {
        id: 'maximize',
        label: mode === 'maximized' ? 'Restore' : 'Maximize',
        icon: mode === 'maximized' ? '⧉' : '□',
        action: () => {
          if (mode === 'maximized') {
            ctx.desktop.restoreWindow(ctx.windowId!)
          } else {
            ctx.desktop.maximizeWindow(ctx.windowId!)
          }
        }
      },
      { id: 'sep', label: '', separator: true },
      {
        id: 'close',
        label: 'Close',
        icon: '✕',
        shortcut: 'Ctrl+W',
        action: () => ctx.desktop.closeWindow(ctx.windowId!)
      }
    ]
  }
}))

provideDesktop(desktop)

// ============================================================================
// Toolbar Actions
// ============================================================================

function toggleSnap() {
  (desktop as DesktopInstanceWithSnap).snap?.setEnabled(snapEnabled.value)
}

function clearSession() {
  (desktop as DesktopInstanceWithPersistence).persistence?.clear()
  // Close all windows
  for (const win of [...desktop.windows]) {
    desktop.closeWindow(win.id!)
  }
}

function showHelp() {
  // Check if help window already exists
  const existing = desktop.windows.find(w => w.singletonKey === 'help')
  if (existing) {
    if (desktop.getMode(existing.id!) === 'minimized') {
      desktop.restoreWindow(existing.id!)
    }
    desktop.focusWindow(existing.id!)
    return
  }

  desktop.createWindow({
    type: 'help',
    title: 'Help & Shortcuts',
    icon: '❓',
    component: HelpWindow,
    singletonKey: 'help',
    initialBounds: { x: 180, y: 80, width: 420, height: 500 }
  })
}

let windowCount = 0
function openWindow() {
  windowCount++
  desktop.createWindow({
    type: 'sample',
    title: `Window ${windowCount}`,
    icon: '📄',
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

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  (desktop as DesktopInstanceWithPersistence).persistence?.restoreSession()

  // Show help on first visit (no persisted session)
  if (desktop.windows.length === 0) {
    showHelp()
  }
})
</script>

<style>
* { box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  padding: 10px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.demo-toolbar h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.demo-toolbar-buttons {
  display: flex;
  gap: 8px;
}

.demo-toolbar button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.demo-toolbar button:hover {
  background: #e8e8e8;
}

.demo-btn-secondary {
  color: #666;
}

.demo-toolbar-toggles {
  display: flex;
  gap: 12px;
}

.demo-toolbar-toggles label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
}

.demo-hint {
  font-size: 11px;
  color: #888;
  margin-left: auto;
}

.demo-desktop {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Window Content Styles */
.window-sample {
  padding: 8px;
}

.window-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.window-editor textarea {
  flex: 1;
  width: 100%;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 8px;
  outline: none;
}

.window-image-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #1a1a1a;
}

.window-image-viewer img {
  max-width: 100%;
  max-height: calc(100% - 30px);
  object-fit: contain;
}

.image-caption {
  color: #aaa;
  font-size: 12px;
  margin-top: 8px;
}

.window-color-picker {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.color-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.window-color-picker input[type="color"] {
  width: 60px;
  height: 40px;
  border: none;
  cursor: pointer;
}

.color-value {
  font-family: monospace;
  font-size: 14px;
  color: #666;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.color-preset {
  width: 28px;
  height: 28px;
  border: 2px solid #fff;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.color-preset:hover {
  transform: scale(1.1);
}

.window-about {
  padding: 20px;
  text-align: center;
}

.about-logo {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 4px;
}

.about-version {
  color: #999;
  font-size: 12px;
  margin: 0 0 16px 0;
}

.window-about ul {
  text-align: left;
  margin: 16px 0;
  padding-left: 24px;
}

.window-about li {
  margin: 4px 0;
  font-size: 13px;
}

.about-link {
  font-size: 12px;
  color: #666;
  margin-top: 16px;
}

.about-link a {
  color: #667eea;
}

.window-help {
  padding: 16px;
  font-size: 13px;
  overflow-y: auto;
}

.window-help h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.window-help h3:not(:first-child) {
  margin-top: 16px;
}

.shortcuts-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.shortcuts-table td {
  padding: 4px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.shortcuts-table td:first-child {
  font-family: monospace;
  font-size: 12px;
  background: #f5f5f5;
  border-radius: 3px;
  white-space: nowrap;
  width: 130px;
}

.window-help ul {
  margin: 8px 0;
  padding-left: 20px;
}

.window-help li {
  margin: 4px 0;
}

.window-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.counter-display {
  font-size: 48px;
  font-weight: bold;
  font-family: monospace;
  color: #333;
}

.counter-buttons {
  display: flex;
  gap: 8px;
}

.counter-buttons button {
  padding: 8px 20px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.counter-buttons button:hover {
  background: #f0f0f0;
}
</style>
