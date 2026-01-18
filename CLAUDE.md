# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue Desktop is a Vue 3 + TypeScript library providing a desktop-style window manager with a plugin-based architecture. It enables browser applications to have movable, resizable, focusable windows with z-index management, similar to a desktop OS.

## Commands

```bash
pnpm install              # Install dependencies
pnpm build               # Build the library
pnpm test                # Run tests (vitest --run)
pnpm lint                # Lint source files (eslint src)
pnpm format              # Format source files (prettier)
pnpm dev                 # Start Vite dev server

# Run a single test file
pnpm vitest run tests/desktop-instance.test.ts

# Run demo app
pnpm --filter ./examples/demo dev
```

## Architecture

### Core Components

- **DesktopInstance** (`src/core/DesktopInstance.ts`) - Central state manager for windows. Maintains window registry, z-order stack, and event bus. Use `createDesktop()` factory to instantiate. Emits events: `window-created`, `window-closed`, `window-focused`.

- **DesktopRoot** (`src/core/DesktopRoot.ts`) - Vue plugin installer. Root container that provides context and installs plugins.

- **WindowHost** (`src/core/WindowHost.ts`) - Vue component that renders windows with z-order management.

- **WindowShell** (`src/core/WindowShell.ts`) - Window chrome component handling title bar, drag/resize interactions.

### Data Model

Core types in `src/core/types.ts`:
- `WindowDefinition` - Window configuration (type, title, component, props, constraints, behaviors)
- `Bounds` - Position and size (x, y, width, height)
- `WindowConstraints` - Min/max dimensions
- `WindowBehaviors` - Feature flags (resizable, movable, closable, minimizable, maximizable)

### Plugin System

Plugins extend functionality without bloating core. Located in `src/plugins/`:
- Plugins must use only public APIs (no core internals)
- No circular dependencies between core and plugins
- Example: `TaskbarPlugin` for taskbar UI

### Public API

All exports go through `src/index.ts`. Key export: `createDesktop()`.

## Development Rules

From CHECKLIST.md:
- No `any` in public APIs
- One prompt = one commit, no scope creep
- Plugins use only public APIs
- All quality gates must pass before commit: build, test, lint, format
