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

10. feat(plugin-api): implement plugin registration system
    - Add `Plugin` interface, `installPlugin()` on `DesktopRoot` / `DesktopInstance`, and plugin lifecycle hooks.
    - Add example plugin registration unit tests.

11. feat(ui-registry): add UI registry for taskbar/overlays
    - Expose API for plugins to mount UIs (taskbar slot, overlays) and a simple renderer.

12. feat(plugin-taskbar): implement taskbar plugin (UI + behavior)
    - Create taskbar UI, register with UI registry, show open windows and minimize/restore actions.
    - Wire demo to show taskbar in examples/demo.

13. feat(plugin-shortcuts): implement shortcuts plugin
    - Global shortcuts registration and example shortcuts (close window, toggle maximize).

14. feat(plugin-snap): implement window snapping plugin
    - Provide snap-to-grid and edge snapping behavior as a plugin.

15. feat(plugin-persistence): implement persistence plugin
    - Persist window state (bounds/mode) to localStorage or optional persistence adapter.
    - Add tests for serialization logic (non-DOM).

16. chore: examples and demo improvements
    - Expand `examples/demo` to demonstrate multiple windows, taskbar, persistence, and plugins toggling.

17. test: add e2e-ish smoke tests for demo (optional)
    - Add simple Playwright or Puppeteer smoke test to ensure the demo boots and windows can be opened.

18. docs: API docs and usage examples
    - Generate or write documentation for public APIs and plugin contract. Add top-level examples in README.

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
