# Spotlight Plugin

Adds a quick search dialog for finding and launching apps, windows, and custom results.

## Installation

```ts
import { SpotlightPlugin } from '@anthropic/vue-desktop'

desktop.installPlugin(SpotlightPlugin)
```

## Usage

Press `Ctrl+K` (or `Cmd+K` on Mac) to open the spotlight dialog.

```vue
<template>
  <div class="desktop">
    <WindowHost />
    <UISlot slot="overlay" />
  </div>
</template>
```

## Features

- Keyboard shortcut to open (Ctrl+K / Cmd+K)
- Search through apps (if StartMenuPlugin is installed)
- Search through open windows
- Custom search providers
- Keyboard navigation (↑/↓ arrows, Enter, Escape)
- Category grouping

## Built-in Providers

### Apps Provider

If `StartMenuPlugin` is installed, Spotlight searches through registered apps:

```ts
// Install both plugins
desktop.installPlugin(createStartMenuPlugin({ apps: [...] }))
desktop.installPlugin(SpotlightPlugin)

// Now spotlight will search apps
```

### Windows Provider

Searches through open windows by title:

```ts
// Type "doc" to find windows with "doc" in the title
```

## API

After installation, access the API via `desktop.spotlight`:

```ts
import type { DesktopWithSpotlight } from '@anthropic/vue-desktop'

const { spotlight } = desktop as DesktopWithSpotlight
```

### open() / close() / toggle()

Control visibility.

```ts
spotlight.open()
spotlight.close()
spotlight.toggle()
```

### isOpen()

Check if spotlight is open.

```ts
if (spotlight.isOpen()) {
  console.log('Spotlight is open')
}
```

### registerProvider(provider)

Add a custom search provider.

```ts
spotlight.registerProvider({
  id: 'contacts',
  name: 'Contacts',
  search: (query) => {
    return contacts
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      .map(c => ({
        id: `contact-${c.id}`,
        label: c.name,
        description: c.email,
        icon: '👤',
        category: 'Contacts',
        action: () => openContact(c.id)
      }))
  }
})
```

### unregisterProvider(id)

Remove a provider.

```ts
spotlight.unregisterProvider('contacts')
```

### getProviders()

Get all registered providers.

```ts
const providers = spotlight.getProviders()
```

### search(query)

Programmatically search.

```ts
const results = await spotlight.search('document')
```

## Custom Providers

### Provider Interface

```ts
interface SpotlightProvider {
  id: string
  name: string
  search(query: string): SpotlightResult[] | Promise<SpotlightResult[]>
}

interface SpotlightResult {
  id: string
  label: string
  description?: string
  icon?: string
  category?: string
  keywords?: string[]  // Additional search terms
  action: () => void
}
```

### Sync Provider Example

```ts
const recentFilesProvider: SpotlightProvider = {
  id: 'recent-files',
  name: 'Recent Files',
  search: (query) => {
    const q = query.toLowerCase()
    return recentFiles
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(f => ({
        id: `file-${f.path}`,
        label: f.name,
        description: f.path,
        icon: getFileIcon(f.extension),
        category: 'Recent Files',
        action: () => openFile(f.path)
      }))
  }
}
```

### Async Provider Example

```ts
const apiSearchProvider: SpotlightProvider = {
  id: 'api-search',
  name: 'API Search',
  search: async (query) => {
    if (query.length < 2) return []

    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const results = await response.json()

    return results.map(item => ({
      id: `api-${item.id}`,
      label: item.title,
      description: item.description,
      category: 'Search Results',
      action: () => openItem(item)
    }))
  }
}
```

### Commands Provider

Create a command palette:

```ts
const commandsProvider: SpotlightProvider = {
  id: 'commands',
  name: 'Commands',
  search: (query) => {
    const commands = [
      { id: 'new-window', label: 'New Window', keywords: ['create', 'open'], action: () => newWindow() },
      { id: 'close-all', label: 'Close All Windows', keywords: ['clear'], action: () => closeAll() },
      { id: 'toggle-theme', label: 'Toggle Dark Mode', keywords: ['theme', 'dark', 'light'], action: () => toggleTheme() },
      { id: 'settings', label: 'Open Settings', keywords: ['preferences', 'config'], action: () => openSettings() }
    ]

    const q = query.toLowerCase()
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    ).map(cmd => ({
      ...cmd,
      category: 'Commands',
      icon: '⌘'
    }))
  }
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` / `Cmd+K` | Open Spotlight |
| `↑` / `↓` | Navigate results |
| `Enter` | Execute selected result |
| `Escape` | Close Spotlight |

## Styling

```css
/* Spotlight overlay */
.vd-spotlight-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  padding-top: 20vh;
}

/* Search dialog */
.vd-spotlight {
  width: 600px;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Search input */
.vd-spotlight-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 18px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
}

/* Results list */
.vd-spotlight-results {
  max-height: 300px;
  overflow-y: auto;
}

/* Result item */
.vd-spotlight-result {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.vd-spotlight-result:hover,
.vd-spotlight-result.selected {
  background: #f0f0f0;
}

/* Category header */
.vd-spotlight-category {
  padding: 8px 20px;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  background: #fafafa;
}
```

## Accessibility

The spotlight includes:
- `role="combobox"` on the input
- `role="listbox"` on the results
- `role="option"` on each result
- `aria-selected` for the current selection
- `aria-activedescendant` for keyboard navigation
