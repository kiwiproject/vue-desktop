# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `window:blurred` event emitted when a window loses focus
- Plugin examples collection in `examples/plugins/` demonstrating different plugin patterns:
  - `clock-plugin` (beginner) - UI overlay plugin
  - `window-logger-plugin` (beginner) - event subscription plugin
  - `window-counter-plugin` (intermediate) - API extension plugin
  - `always-on-top-plugin` (advanced) - method wrapping plugin

### Changed
- **BREAKING**: Event names standardized to use colons (`:`) instead of hyphens (`-`):
  - `window-created` -> `window:created`
  - `window-closed` -> `window:closed`
  - `window-focused` -> `window:focused`
  - `window-blurred` -> `window:blurred`
  - `window-bounds-changed` -> `window:bounds`
  - `window-minimized` -> `window:minimized`
  - `window-maximized` -> `window:maximized`
  - `window-restored` -> `window:restored`
- **BREAKING**: Event payloads standardized to use `windowId` instead of `id`:
  - `window:closed` payload: `{ windowId, window }`
  - `window:focused` payload: `{ windowId }`
  - `window:blurred` payload: `{ windowId }`
  - `window:bounds` payload: `{ windowId, bounds, oldBounds }`
  - `window:minimized` payload: `{ windowId }`
  - `window:maximized` payload: `{ windowId }`
  - `window:restored` payload: `{ windowId }`

### Fixed
- Comprehensive ARIA attributes and roles for accessibility

## [0.0.0] - Initial Development

### Added
- Core `DesktopInstance` class with window registry, z-order management, and focus tracking
- `createDesktop()`, `provideDesktop()`, and `useDesktop()` Vue integration functions
- Window lifecycle: `createWindow()`, `closeWindow()`, `getWindow()`, `listWindows()`
- Window focus: `focusWindow()`, `getFocusedWindowId()`, `cycleFocus()`
- Window modes: `minimizeWindow()`, `maximizeWindow()`, `restoreWindow()`, `getMode()`
- Window bounds: `getBounds()`, `updateBounds()`
- Alt+Tab window switcher: `openSwitcher()`, `closeSwitcher()`, `cycleSwitcherSelection()`
- Plugin system: `installPlugin()`, `uninstallPlugin()`, `hasPlugin()`
- UI registry: `registerUI()`, `unregisterUI()`, `getUIForSlot()`
- Event system: `on()`, `off()` for subscribing to window events

### Plugins
- **Taskbar Plugin**: Window taskbar with minimize/restore functionality
- **Shortcuts Plugin**: Keyboard shortcuts for window management
- **Snap Plugin**: Window snapping to screen edges and corners
- **Persistence Plugin**: Persist window bounds, mode, and session state
- **Start Menu Plugin**: Application launcher with categories
- **Spotlight Plugin**: Quick search with extensible providers
- **Context Menu Plugin**: Right-click context menus

### Components
- `WindowHost`: Container for rendering all windows
- `WindowShell`: Individual window chrome with title bar, controls, drag/resize
- `DesktopSlot`: Slot component for plugin-registered UI

### Types
- `WindowDefinition`: Window configuration
- `Bounds`: Position and size `{ x, y, width, height }`
- `WindowMode`: `'normal' | 'minimized' | 'maximized'`
- `Plugin`: Plugin interface `{ name, install }`
- `UIRegistration`: UI slot registration
