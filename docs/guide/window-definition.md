# Window Definition

## Basic Properties

```ts
interface WindowDefinition {
  // Required
  type: string              // Window type identifier
  title: string             // Window title
  component: Component      // Vue component to render

  // Optional
  id?: string               // Custom ID (auto-generated if omitted)
  props?: object            // Props passed to component
  initialBounds?: Bounds    // Initial position and size
  singletonKey?: string     // Unique key for singleton windows
  meta?: Record<string, unknown>  // Custom metadata
  menuBar?: MenuBarDefinition     // Window menu bar
}
```

## Initial Bounds

Control where and how big the window appears:

```ts
desktop.createWindow({
  type: 'app',
  title: 'My App',
  component: MyApp,
  initialBounds: {
    x: 100,      // Distance from left
    y: 100,      // Distance from top
    width: 600,  // Window width
    height: 400  // Window height
  }
})
```

If `initialBounds` is omitted, defaults are used:
- `x: 100`, `y: 100`
- `width: 400`, `height: 300`

## Passing Props

Pass data to your window component:

```ts
desktop.createWindow({
  type: 'document',
  title: 'Report.pdf',
  component: DocumentViewer,
  props: {
    documentId: '12345',
    readOnly: true
  }
})
```

```vue
<!-- DocumentViewer.vue -->
<script setup>
const props = defineProps<{
  documentId: string
  readOnly: boolean
}>()
</script>
```

## Singleton Windows

Prevent multiple instances of the same window:

```ts
// First call creates the window
desktop.createWindow({
  type: 'preferences',
  title: 'Preferences',
  component: PreferencesPanel,
  singletonKey: 'main-preferences'
})

// Second call with same singletonKey focuses existing window
desktop.createWindow({
  type: 'preferences',
  title: 'Preferences',
  component: PreferencesPanel,
  singletonKey: 'main-preferences'
})
```

## Window Metadata

Store custom data with the window:

```ts
const win = desktop.createWindow({
  type: 'editor',
  title: 'Document.txt',
  component: TextEditor,
  meta: {
    filePath: '/documents/Document.txt',
    unsavedChanges: false,
    encoding: 'utf-8'
  }
})

// Access later
const window = desktop.getWindow(win.id)
console.log(window.meta.filePath)
```

## Menu Bar

Add a standard menu bar to windows:

```ts
desktop.createWindow({
  type: 'text-editor',
  title: 'Untitled.txt',
  component: TextEditor,
  menuBar: [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: () => newFile() },
        { label: 'Open', shortcut: 'Ctrl+O', action: () => openFile() },
        { type: 'separator' },
        { label: 'Save', shortcut: 'Ctrl+S', action: () => saveFile() },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => saveAs() }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => undo() },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => redo() },
        { type: 'separator' },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => cut() },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => copy() },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => paste() }
      ]
    }
  ]
})
```

## Dynamic Menu Items

Use a function to dynamically enable/disable menu items:

```ts
menuBar: [
  {
    label: 'Edit',
    items: () => [
      {
        label: 'Undo',
        shortcut: 'Ctrl+Z',
        action: () => undo(),
        disabled: !canUndo.value  // Dynamic based on state
      },
      {
        label: 'Redo',
        shortcut: 'Ctrl+Y',
        action: () => redo(),
        disabled: !canRedo.value
      }
    ]
  }
]
```

## Complete Example

```ts
import TextEditor from './TextEditor.vue'

desktop.createWindow({
  id: 'editor-1',
  type: 'text-editor',
  title: 'README.md',
  component: TextEditor,
  props: {
    content: '# Hello World',
    language: 'markdown'
  },
  initialBounds: {
    x: 50,
    y: 50,
    width: 800,
    height: 600
  },
  singletonKey: 'readme-editor',
  meta: {
    filePath: '/project/README.md',
    modified: false
  },
  menuBar: [
    {
      label: 'File',
      items: [
        { label: 'Save', shortcut: 'Ctrl+S', action: () => save() },
        { label: 'Close', action: () => desktop.closeWindow('editor-1') }
      ]
    }
  ]
})
```
