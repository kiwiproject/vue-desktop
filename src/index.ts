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
