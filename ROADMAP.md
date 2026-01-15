# ROADMAP — Commit-by-commit implementation plan

This file lists an incremental, commit-focused plan to implement the `vue-desktop` library. Each item is written as a commit message (subject) and a short description of what that commit implements. Follow the project's CHECKLIST rules: one prompt = one commit, no unrelated refactors, tests and lint must pass.

1. chore: initial scaffold
   - Create project metadata, basic README, LICENSE, tsconfig, Vite config, and initial `src` layout. (Already completed.)

2. feat(core): add public entry and core module stubs
   - Add `src/index.ts` and empty exports for `DesktopRoot`, `DesktopInstance`, `WindowHost`, `WindowShell`.
   - Add minimal unit tests for existence of API.

3. feat(types): define core types and data models
   - Add types: `Bounds`, `WindowDefinition`, `WindowConstraints`, `WindowBehaviors`.
   - Export types from public API.

4. feat(instance): implement `DesktopInstance` basic state
   - Implement window registry, `createWindow`, `closeWindow`, `getWindow`, and simple events.
   - Add unit tests covering registry operations.

    Status: implemented (2026-01-12) — `src/core/DesktopInstance.ts` with registry, z-order, focus, and basic event bus. Tests added in `tests/desktop-instance.test.ts`.

5. feat(ui): add `WindowHost` and `WindowShell` basic render
   - `WindowHost` renders list of windows; `WindowShell` provides header/body layout.
   - Add minimal styling and demo integration.

    Status: implemented (2026-01-12) — `WindowHost` renders windows with z-order, `WindowShell` has positioned chrome with close button. Added `src/styles.css`, provide/inject pattern (`useDesktop`, `provideDesktop`), and demo integration.

6. feat(interaction): add focus and z-order management
   - Implement focus handling and z-index ordering in `DesktopInstance` and `WindowHost`.
   - Tests for focus change behavior.

7. feat(drag-resize): implement drag and resize behaviors
   - Add pointer handling in `WindowShell` for dragging/resizing; constraints support.
   - Add tests for bounds calculations (non-DOM logic).

    Status: implemented (2026-01-12) — Added `src/core/bounds.ts` with `applyConstraints` and `calcResize` utilities. WindowShell now supports drag (via header) and resize (via 8 edge/corner handles). DesktopInstance tracks runtime bounds with `getBounds`/`updateBounds`. Tests added in `tests/bounds.test.ts`.

8. feat(window-controls): add minimize/maximize/restore
   - Implement modes (minimized, maximized, normal) and persistence hooks.
   - Add plugin events to notify status changes.

    Status: implemented (2026-01-12) — Added `WindowMode` type, mode tracking in DesktopInstance (`getMode`, `minimizeWindow`, `maximizeWindow`, `restoreWindow`). WindowShell has minimize/maximize/restore buttons, double-click header to toggle maximize. WindowHost tracks viewport for maximized bounds, hides minimized windows. Tests added in `tests/window-mode.test.ts`.

9. feat(keyboard): add keyboard shortcuts and focus keyboard handling
   - Provide keyboard navigation for windows (e.g., Alt+Tab style) and shortcuts API.

    Status: implemented (2026-01-12) — Added `getFocusedWindowId()` and `cycleFocus(reverse?)` to DesktopInstance. WindowHost handles keyboard events (Escape, Alt+F4 to close; Alt+Tab / Alt+Shift+Tab to cycle focus). Tests added in `tests/keyboard.test.ts`.

    Enhanced (2026-01-13) — Added visual window switcher overlay. Alt+Tab opens a centered overlay showing window tiles; continued Tab presses cycle selection; releasing Alt commits selection. Added `WindowSwitcher` component and switcher methods (`openSwitcher`, `closeSwitcher`, `cycleSwitcherSelection`, `getSwitcherWindows`). Tests in `tests/switcher.test.ts`.

10. feat(plugin-api): implement plugin registration system
    - Add `Plugin` interface, `installPlugin()` on `DesktopRoot` / `DesktopInstance`, and plugin lifecycle hooks.
    - Add example plugin registration unit tests.

    Status: implemented (2026-01-12) — Added `Plugin` interface to types.ts. DesktopInstance has `installPlugin(plugin)`, `uninstallPlugin(name)`, and `hasPlugin(name)` methods. Plugin install() receives desktop instance and can return cleanup function. Tests added in `tests/plugin.test.ts`.

11. feat(ui-registry): add UI registry for taskbar/overlays
    - Expose API for plugins to mount UIs (taskbar slot, overlays) and a simple renderer.

    Status: implemented (2026-01-12) — Added `UIRegistration` interface and `registerUI()`, `unregisterUI()`, `getUIForSlot()` methods to DesktopInstance. Created `UISlot` component for rendering registered UIs. Tests added in `tests/ui-registry.test.ts`.

12. feat(plugin-taskbar): implement taskbar plugin (UI + behavior)
    - Create taskbar UI, register with UI registry, show open windows and minimize/restore actions.
    - Wire demo to show taskbar in examples/demo.

    Status: implemented (2026-01-13) — Created `TaskbarPlugin` in `src/plugins/taskbar/`. Taskbar component shows all windows with focus highlight and minimized state. Click behavior: minimized windows restore+focus, focused windows minimize, unfocused windows focus. Exported from public API. Demo updated to use taskbar. Tests in `tests/taskbar.test.ts`.

13. feat(plugin-shortcuts): implement shortcuts plugin
    - Global shortcuts registration and example shortcuts (close window, toggle maximize).

    Status: implemented (2026-01-13) — Created `ShortcutsPlugin` in `src/plugins/shortcuts/`. Provides `createShortcutsPlugin(options)` factory and default `ShortcutsPlugin`. API exposes `register()`, `unregister()`, `setEnabled()`, `getShortcuts()` methods via `desktop.shortcuts`. Default shortcuts: Ctrl+W (close), Ctrl+Shift+F (toggle maximize), Ctrl+M (minimize). Includes `parseShortcut()` and `matchesShortcut()` utilities. Tests in `tests/shortcuts.test.ts`.

14. feat(plugin-snap): implement window snapping plugin
    - Provide snap-to-grid and edge snapping behavior as a plugin.

    Status: implemented (2026-01-14) — Created `SnapPlugin` in `src/plugins/snap/`. Features: edge snapping (viewport boundaries), window-to-window snapping (align/dock), grid snapping (configurable grid size). API via `desktop.snap`: `setEnabled()`, `isEnabled()`, `setOptions()`, `getOptions()`. Utility functions exported: `snapToValue`, `snapToGrid`, `snapToEdges`, `snapToWindows`, `applySnapping`. Tests in `tests/snap.test.ts`.

15. feat(plugin-persistence): implement persistence plugin
    - Persist window state (bounds/mode) to localStorage or optional persistence adapter.
    - Add tests for serialization logic (non-DOM).

    Status: implemented (2026-01-14) — Created `PersistencePlugin` in `src/plugins/persistence/`. Features: automatic save/restore of window bounds and mode, debounced saves, localStorage adapter (default), memory adapter for testing, custom storage adapter support, configurable persist key via `getWindowKey`. API via `desktop.persistence`: `save()`, `load()`, `clear()`, `getWindowState()`, `isEnabled()`, `setEnabled()`. Tests in `tests/persistence.test.ts`.

15.5. feat(plugin-start-menu): implement start menu plugin
    - Start menu button in taskbar with dropdown panel showing registered apps.
    - Apps grouped by category with optional keyboard shortcut hints.
    - Click app to open window via factory function.

    Status: implemented (2026-01-14) — Created `StartMenuPlugin` in `src/plugins/start-menu/`. Features: static app registration via options, dynamic registration via API, category grouping, shortcut hints. API via `desktop.startMenu`: `registerApp()`, `unregisterApp()`, `getApps()`, `getAppsByCategory()`, `open()`, `close()`, `toggle()`, `isOpen()`. Tests in `tests/start-menu.test.ts`.

15.6. feat(plugin-spotlight): implement spotlight search plugin
    - macOS Spotlight-style search dialog triggered by Cmd/Ctrl+K.
    - Search through apps (from StartMenu) and open windows.
    - Custom search providers for extensibility.
    - Smart singleton handling (focuses existing singleton windows).

    Status: implemented (2026-01-14) — Created `SpotlightPlugin` in `src/plugins/spotlight/`. Features: keyboard shortcut trigger (Cmd/Ctrl+K), built-in providers for apps and windows, custom provider registration, search by label/description/keywords, category grouping, keyboard navigation (arrows/enter/escape). API via `desktop.spotlight`: `open()`, `close()`, `toggle()`, `isOpen()`, `registerProvider()`, `unregisterProvider()`, `getProviders()`, `search()`. Tests in `tests/spotlight.test.ts`.

16. chore: examples and demo improvements
    - Expand `examples/demo` to demonstrate multiple windows, taskbar, persistence, and plugins toggling.

    Status: implemented (2026-01-14) — Enhanced demo with 7 window types (Sample, TextEditor, ImageViewer, ColorPicker, Counter, Help, About). Added toolbar controls (New Window, Help, Clear Session, Snap toggle). Help window shows all keyboard shortcuts, window features, and enabled plugins. Start menu expanded to 7 apps across General, Utilities, and System categories. Auto-shows Help on first visit.

17. test: add e2e-ish smoke tests for demo (optional)
    - Add simple Playwright or Puppeteer smoke test to ensure the demo boots and windows can be opened.

18. docs: API docs and usage examples
    - Generate or write documentation for public APIs and plugin contract. Add top-level examples in README.

    Status: implemented (2026-01-14) — Comprehensive README with: features overview, installation, quick start example, core API documentation (createDesktop, provideDesktop, useDesktop, all methods), window definition types, component documentation (WindowHost, UISlot), all 6 plugins fully documented with options and APIs, custom plugin creation guide, keyboard shortcuts reference, styling guide, TypeScript types list, and development instructions.

19. chore: CI coverage and badges
    - Ensure `pnpm build`, `pnpm lint`, `pnpm test` run in CI and add status badges to README.

20. chore(release): configure semantic-release and release pipeline
    - (Already added) Ensure `NPM_TOKEN` secret and publish config — verify dry-run release flow.

21. perf/accessibility: polish and accessibility checks
    - Audit keyboard navigation and ARIA attributes for windows and controls.

22. feat: plugin marketplace / examples collection
    - Create separate `plugins/` examples and docs showing how to author plugins.

23. refactor(api): stabilize public API & types for v1.0.0
    - Finalize public API surface, remove experimental flags, update changelog.

24. release: v1.0.0
    - Tag and publish first stable release once API stabilized and tests/CI pass.

25. post-release: collect feedback and iterate
    - Address issues, prioritize feature requests, and plan 1.x roadmap.

Notes
- Keep commits small and focused. Each commit should have tests or a demo showing the new behavior where applicable.
- Use CHECKLIST.md rules on each commit/PR: build/test/lint/format pass before merge, document exports, and keep diffs clean.
