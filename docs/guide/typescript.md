# TypeScript

vue-desktop is written in TypeScript and provides complete type definitions.

## Type Imports

```ts
import type {
  // Core types
  DesktopInstance,
  WindowDefinition,
  Bounds,
  WindowMode,

  // Plugin types
  Plugin,
  UIRegistration,

  // Menu types
  MenuBarDefinition,
  MenuBarMenu,
  MenuBarItem,

  // Plugin-specific types
  ShortcutDefinition,
  SnapOptions,
  PersistencePluginOptions,
  SpotlightProvider,
  ContextMenuItem
} from '@kiwiproject/vue-desktop'
```

## Window Definition

```ts
import type { WindowDefinition, Bounds } from '@kiwiproject/vue-desktop'
import type { Component } from 'vue'

// Basic window
const window: WindowDefinition = {
  type: 'editor',
  title: 'My Editor',
  component: EditorComponent
}

// Fully typed window
const fullWindow: WindowDefinition = {
  id: 'editor-1',
  type: 'text-editor',
  title: 'Document.txt',
  component: TextEditor,
  props: { content: '', language: 'plaintext' },
  initialBounds: { x: 100, y: 100, width: 600, height: 400 },
  singletonKey: 'main-editor',
  meta: { filePath: '/docs/readme.md' },
  menuBar: [
    { label: 'File', items: [] }
  ]
}
```

## Typed Props

Pass typed props to window components:

```ts
// Define your component's props
interface EditorProps {
  content: string
  language: string
  readOnly?: boolean
}

// EditorComponent.vue
const props = defineProps<EditorProps>()

// Creating the window
desktop.createWindow({
  type: 'editor',
  title: 'Code Editor',
  component: EditorComponent,
  props: {
    content: '// Hello',
    language: 'typescript',
    readOnly: false
  } satisfies EditorProps
})
```

## Plugin Types

### Basic Plugin

```ts
import type { Plugin, DesktopInstance } from '@kiwiproject/vue-desktop'

const MyPlugin: Plugin = {
  name: 'my-plugin',
  install(desktop: DesktopInstance) {
    // desktop is fully typed
    desktop.on('window:created', (window) => {
      console.log(window.id, window.title)
    })
  }
}
```

### Plugin with Extended API

```ts
import type { Plugin, DesktopInstance } from '@kiwiproject/vue-desktop'

// Define your plugin's API
interface MyPluginAPI {
  enable(): void
  disable(): void
  isEnabled(): boolean
}

// Extend DesktopInstance
export interface DesktopWithMyPlugin extends DesktopInstance {
  myPlugin?: MyPluginAPI
}

// Create the plugin
export function createMyPlugin(): Plugin {
  return {
    name: 'my-plugin',
    install(desktop) {
      let enabled = true

      const api: MyPluginAPI = {
        enable: () => { enabled = true },
        disable: () => { enabled = false },
        isEnabled: () => enabled
      }

      ;(desktop as DesktopWithMyPlugin).myPlugin = api

      return () => {
        delete (desktop as DesktopWithMyPlugin).myPlugin
      }
    }
  }
}

// Usage with proper typing
const desktop = useDesktop() as DesktopWithMyPlugin
desktop.myPlugin?.enable()
```

## Event Payloads

```ts
import type { WindowDefinition, Bounds } from '@kiwiproject/vue-desktop'

// window:created
desktop.on('window:created', (window: WindowDefinition) => {
  console.log(window.id)
})

// window:closed
desktop.on('window:closed', (payload: {
  windowId: string
  window: WindowDefinition
}) => {
  console.log(payload.windowId)
})

// window:bounds
desktop.on('window:bounds', (payload: {
  windowId: string
  bounds: Bounds
  oldBounds: Bounds | undefined
}) => {
  console.log(payload.bounds.width)
})

// window:focused, window:blurred, window:minimized, etc.
desktop.on('window:focused', (payload: { windowId: string }) => {
  console.log(payload.windowId)
})
```

## Menu Bar Types

```ts
import type { MenuBarDefinition, MenuBarMenu, MenuBarItem } from '@kiwiproject/vue-desktop'

const menuBar: MenuBarDefinition = [
  {
    label: 'File',
    items: [
      {
        label: 'New',
        shortcut: 'Ctrl+N',
        action: () => createNew()
      },
      { type: 'separator' },
      {
        label: 'Recent',
        items: [  // Submenu
          { label: 'Document1.txt', action: () => open('doc1') },
          { label: 'Document2.txt', action: () => open('doc2') }
        ]
      }
    ]
  }
]

// Dynamic menu items
const dynamicMenu: MenuBarMenu = {
  label: 'Edit',
  items: () => [
    {
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      action: undo,
      disabled: !canUndo.value
    }
  ]
}
```

## Shortcut Types

```ts
import type { ShortcutDefinition } from '@kiwiproject/vue-desktop'
import { parseShortcut, matchesShortcut } from '@kiwiproject/vue-desktop'

const shortcut: ShortcutDefinition = {
  key: 's',
  ctrl: true,
  shift: false,
  alt: false,
  meta: false,
  action: () => save()
}

// Parse from string
const parsed = parseShortcut('ctrl+shift+s')
// { key: 's', ctrl: true, shift: true, alt: false, meta: false }

// Check keyboard event
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (matchesShortcut(e, shortcut)) {
    e.preventDefault()
    shortcut.action()
  }
})
```

## Generic Window Props

For reusable components with typed window props:

```ts
import type { WindowDefinition } from '@kiwiproject/vue-desktop'

// A function that creates windows with specific props
function createDocumentWindow<T extends object>(
  title: string,
  component: Component,
  props: T
): WindowDefinition {
  return {
    type: 'document',
    title,
    component,
    props
  }
}

// Usage
const win = createDocumentWindow('README.md', MarkdownEditor, {
  content: '# Hello',
  editable: true
})
```

## Strict Null Checks

vue-desktop is designed for `strictNullChecks`:

```ts
const win = desktop.getWindow(id)
if (win) {
  // win is WindowDefinition, not undefined
  console.log(win.title)
}

const focused = desktop.getFocusedWindowId()
if (focused) {
  // focused is string, not undefined
  desktop.closeWindow(focused)
}
```
