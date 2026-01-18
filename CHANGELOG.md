## [1.0.1](https://github.com/kiwiproject/vue-desktop/compare/v1.0.0...v1.0.1) (2026-01-18)


### Bug Fixes

* **release:** add NODE_AUTH_TOKEN for npm authentication ([#15](https://github.com/kiwiproject/vue-desktop/issues/15)) ([758102a](https://github.com/kiwiproject/vue-desktop/commit/758102aa9ea508a74190cbc9c5a221b842740a20))
* **release:** temporarily use NPM_TOKEN for initial publish ([#14](https://github.com/kiwiproject/vue-desktop/issues/14)) ([a20925e](https://github.com/kiwiproject/vue-desktop/commit/a20925e53abe5100162a81d9c84b23d7f53ee817))
* **release:** update husky command and normalize repository URL ([#13](https://github.com/kiwiproject/vue-desktop/issues/13)) ([c425805](https://github.com/kiwiproject/vue-desktop/commit/c4258057dee02fd695a82d680140fd4f4dbbe766))

# 1.0.0 (2026-01-18)


### Bug Fixes

* **core:** add early-exit checks in mode methods to prevent reactivity cascades ([0036bd5](https://github.com/kiwiproject/vue-desktop/commit/0036bd5c6e5880c5d4e76a43d8fab6b86538184e))


### Features

* **a11y:** add comprehensive ARIA attributes and roles ([8b6c9ca](https://github.com/kiwiproject/vue-desktop/commit/8b6c9cad6eea5d0e18a31aec5bf9d6eb4479abda))
* **core:** add public API test and export verification ([0fa9479](https://github.com/kiwiproject/vue-desktop/commit/0fa9479e647b59a82c990a7b2ca3b4f6e106c73c))
* **drag-resize:** implement drag and resize behaviors ([887b1fa](https://github.com/kiwiproject/vue-desktop/commit/887b1fa5b4f2c39adda5e94a31a8700fce1d65d5))
* **examples:** add plugin examples collection ([8e6bdfa](https://github.com/kiwiproject/vue-desktop/commit/8e6bdfa3321899e7230a44f1094c86f66ad86767))
* **instance:** implement DesktopInstance registry, z-order, focus and events; add tests; update ROADMAP ([dc5409c](https://github.com/kiwiproject/vue-desktop/commit/dc5409c01b546ce8d9d0dc54dfe802defdffe8b3))
* **keyboard:** add keyboard shortcuts and focus cycling (MRU order) ([22efbaf](https://github.com/kiwiproject/vue-desktop/commit/22efbafbd481659e117a57917efc91b6d7882fcf))
* **keyboard:** add visual Alt+Tab window switcher overlay ([c63cfd5](https://github.com/kiwiproject/vue-desktop/commit/c63cfd5e2764a6f37c988f0f27b83b0454b87e27))
* **persistence:** add createChainedAdapter for combining storage adapters ([bcfd69d](https://github.com/kiwiproject/vue-desktop/commit/bcfd69d9189c4b42fa12771c3802b363a036fed8))
* **plugin-api:** implement plugin registration system ([46238ce](https://github.com/kiwiproject/vue-desktop/commit/46238ce8e30963182b5fc8c37b7b250c3b03530f))
* **plugin-context-menu:** implement context menu plugin ([7f9a2cc](https://github.com/kiwiproject/vue-desktop/commit/7f9a2cce4f51b5fa0ad9d64ac607fa12197e7c1c))
* **plugin-persistence:** implement persistence plugin with session restoration ([0cd1c37](https://github.com/kiwiproject/vue-desktop/commit/0cd1c37a28913008ca519c9d21957eb252dd7325))
* **plugin-shortcuts:** implement shortcuts plugin ([b54483b](https://github.com/kiwiproject/vue-desktop/commit/b54483b41bd2e03b188da4bbe6323de12390a449))
* **plugin-snap:** implement window snapping plugin ([edf8d87](https://github.com/kiwiproject/vue-desktop/commit/edf8d87d82be4ad7ce3a8c0c09e03f4d2f6b4999))
* **plugin-spotlight:** implement spotlight search plugin ([94f285e](https://github.com/kiwiproject/vue-desktop/commit/94f285e4373b77b39b2585ff90ee40dd0fa7df7d))
* **plugin-start-menu:** implement start menu plugin ([e1c2b73](https://github.com/kiwiproject/vue-desktop/commit/e1c2b73fcc8737a7ec222e40aa69fd521d63a8e5))
* **plugin-taskbar:** implement taskbar plugin ([557a8f4](https://github.com/kiwiproject/vue-desktop/commit/557a8f48898331d4728e5bb8b1a4b39fa5b4957f))
* **types:** add core type definitions and export from public API ([fc91f43](https://github.com/kiwiproject/vue-desktop/commit/fc91f430852a3ca2bb6abe138c97b816d1490eab))
* **ui-registry:** add UI registry for plugin-rendered components ([927ca54](https://github.com/kiwiproject/vue-desktop/commit/927ca544cb3568f5ad7886b532c85f76cafc553d))
* **ui:** add focused window visual styling ([b894fc6](https://github.com/kiwiproject/vue-desktop/commit/b894fc656ebf05fa0eee9b94fee231e5d687ab07))
* **ui:** add window menu bar support ([3ac4f25](https://github.com/kiwiproject/vue-desktop/commit/3ac4f251ede109e013104c7c1c79177010a859ab))
* **ui:** add WindowHost and WindowShell basic rendering ([1685ec6](https://github.com/kiwiproject/vue-desktop/commit/1685ec69cfb7864ff0fe3294c6e4d4a99171f0a8))
* **window-controls:** add minimize/maximize/restore ([fedf83c](https://github.com/kiwiproject/vue-desktop/commit/fedf83cb4e022259cabc76810edb1ea626ef381b))

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
