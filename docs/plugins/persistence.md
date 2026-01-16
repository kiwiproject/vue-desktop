# Persistence Plugin

Saves and restores window state (bounds, mode, session) to storage.

## Installation

```ts
// With default options (localStorage)
import { PersistencePlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(PersistencePlugin)

// Or with custom options
import { createPersistencePlugin } from '@kiwiproject/vue-desktop'

desktop.installPlugin(createPersistencePlugin({
  storageKey: 'my-app-desktop',
  persistBounds: true,
  persistMode: true,
  persistSession: true,
  windowFactory: (info) => createWindowFromInfo(info)
}))
```

## Options

```ts
interface PersistencePluginOptions {
  storageKey?: string           // Storage key (default: 'vue-desktop-state')
  debounceMs?: number           // Debounce saves (default: 300ms)
  persistBounds?: boolean       // Save window bounds (default: true)
  persistMode?: boolean         // Save window mode (default: true)
  persistZOrder?: boolean       // Save z-order (default: false)
  persistSession?: boolean      // Save open windows (default: false)
  storage?: StorageAdapter      // Custom storage adapter
  getWindowKey?: (windowId: string, type: string, singletonKey?: string) => string
  windowFactory?: (info: PersistedWindowInfo) => WindowDefinition | null
}
```

## Features

### Bounds Persistence

Automatically saves and restores window position and size:

```ts
createPersistencePlugin({
  persistBounds: true
})
```

When a window is created with a known key, its previous bounds are restored.

### Mode Persistence

Saves window mode (normal, minimized, maximized):

```ts
createPersistencePlugin({
  persistMode: true
})
```

### Session Persistence

Saves which windows are open and restores them on reload:

```ts
createPersistencePlugin({
  persistSession: true,
  windowFactory: (info) => {
    // Create window definition from persisted info
    return {
      type: info.type,
      title: info.title,
      component: getComponentForType(info.type),
      props: info.props,
      singletonKey: info.singletonKey
    }
  }
})
```

## API

After installation, access the API via `desktop.persistence`:

```ts
import type { DesktopWithPersistence } from '@kiwiproject/vue-desktop'

const { persistence } = desktop as DesktopWithPersistence
```

### save()

Manually save current state (bypasses debounce).

```ts
persistence.save()
```

### load()

Load and apply persisted state.

```ts
persistence.load()
```

### restoreSession()

Restore all windows from the persisted session.

```ts
// Call after setting up window factory
persistence.restoreSession()
```

### clear()

Clear all persisted state.

```ts
persistence.clear()
```

### getWindowState(windowId)

Get persisted state for a specific window.

```ts
const state = persistence.getWindowState(windowId)
// { bounds: { x, y, width, height }, mode: 'normal' }
```

### isEnabled() / setEnabled(enabled)

Enable or disable persistence.

```ts
persistence.setEnabled(false)  // Pause persistence
// ... do something
persistence.setEnabled(true)   // Resume
```

## Custom Storage Adapters

### Memory Adapter

For testing or non-persistent use:

```ts
import { createMemoryStorageAdapter } from '@kiwiproject/vue-desktop'

createPersistencePlugin({
  storage: createMemoryStorageAdapter()
})
```

### Chained Adapter

Use multiple storage backends with fallback:

```ts
import {
  createChainedAdapter,
  createLocalStorageAdapter,
  createMemoryStorageAdapter
} from '@kiwiproject/vue-desktop'

createPersistencePlugin({
  storage: createChainedAdapter([
    createLocalStorageAdapter('my-app'),
    createMemoryStorageAdapter()  // Fallback if localStorage fails
  ])
})
```

### Custom Adapter

Implement your own storage backend:

```ts
interface StorageAdapter {
  load(): PersistedState | null
  save(state: PersistedState): void
  clear(): void
}

const indexedDBAdapter: StorageAdapter = {
  async load() {
    // Load from IndexedDB
  },
  async save(state) {
    // Save to IndexedDB
  },
  async clear() {
    // Clear IndexedDB
  }
}
```

## Window Key Function

Control how windows are identified for persistence:

```ts
createPersistencePlugin({
  getWindowKey: (windowId, type, singletonKey) => {
    // Use singletonKey if available, otherwise type
    return singletonKey || type
  }
})
```

## Complete Example

```ts
import {
  createDesktop,
  createPersistencePlugin
} from '@kiwiproject/vue-desktop'

const desktop = createDesktop()

// Define how to recreate windows
const windowComponents = {
  'text-editor': TextEditor,
  'image-viewer': ImageViewer,
  'settings': SettingsPanel
}

const persistence = createPersistencePlugin({
  storageKey: 'my-app-state',
  persistBounds: true,
  persistMode: true,
  persistSession: true,

  // Map window types to stable keys
  getWindowKey: (windowId, type, singletonKey) => {
    return singletonKey || type
  },

  // Factory to recreate windows
  windowFactory: (info) => {
    const component = windowComponents[info.type]
    if (!component) return null

    return {
      type: info.type,
      title: info.title,
      component,
      props: info.props,
      singletonKey: info.singletonKey
    }
  }
})

desktop.installPlugin(persistence)

// Restore previous session on app start
;(desktop as DesktopWithPersistence).persistence?.restoreSession()
```
