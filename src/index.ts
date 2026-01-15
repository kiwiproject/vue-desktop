export * from "./core/DesktopRoot";
export * from "./core/DesktopInstance";
export { default as WindowHost } from "./core/WindowHost";
export { default as WindowShell } from "./core/WindowShell";
export { default as UISlot } from "./core/UISlot";
export * from "./core/types";
export * from "./core/bounds";

// Plugins
export { TaskbarPlugin, Taskbar } from "./plugins/taskbar";
export {
  ShortcutsPlugin,
  createShortcutsPlugin,
  parseShortcut,
  matchesShortcut,
  type ShortcutDefinition,
  type ShortcutsAPI,
  type DesktopInstanceWithShortcuts,
  type ShortcutsPluginOptions
} from "./plugins/shortcuts";
export {
  SnapPlugin,
  createSnapPlugin,
  snapToValue,
  snapToGrid,
  snapToEdges,
  snapBoundsToGrid,
  snapToWindows,
  applySnapping,
  type SnapOptions,
  type SnapResult,
  type SnapTarget,
  type SnapAPI,
  type SnapPluginOptions,
  type DesktopInstanceWithSnap
} from "./plugins/snap";
export {
  PersistencePlugin,
  createPersistencePlugin,
  createLocalStorageAdapter,
  createMemoryStorageAdapter,
  createChainedAdapter,
  type StorageAdapter,
  type PersistedState,
  type PersistedWindowState,
  type PersistedWindowInfo,
  type PersistencePluginOptions,
  type PersistenceAPI,
  type DesktopInstanceWithPersistence
} from "./plugins/persistence";
export {
  StartMenuPlugin,
  createStartMenuPlugin,
  StartMenu,
  type StartMenuApp,
  type StartMenuAPI,
  type StartMenuPluginOptions,
  type DesktopInstanceWithStartMenu
} from "./plugins/start-menu";
export {
  SpotlightPlugin,
  createSpotlightPlugin,
  Spotlight,
  createAppsProvider,
  createWindowsProvider,
  type SpotlightItem,
  type SpotlightProvider,
  type SpotlightAPI,
  type SpotlightPluginOptions,
  type DesktopInstanceWithSpotlight
} from "./plugins/spotlight";
export {
  ContextMenuPlugin,
  createContextMenuPlugin,
  ContextMenu,
  type ContextMenuItem,
  type ContextMenuAPI,
  type ContextMenuPluginOptions,
  type MenuItemsOrBuilder,
  type MenuContext,
  type DesktopInstanceWithContextMenu
} from "./plugins/context-menu";
