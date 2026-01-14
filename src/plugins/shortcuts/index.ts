import type { Plugin } from "../../core/types";
import type { DesktopInstance } from "../../core/DesktopInstance";
import { parseShortcut, matchesShortcut, type ShortcutDefinition, type ParsedShortcut } from "./types";

export type { ShortcutDefinition } from "./types";
export { parseShortcut, matchesShortcut } from "./types";

export interface ShortcutsPluginOptions {
  /** Include default shortcuts for common actions */
  defaults?: boolean;
  /** Target element for keyboard events (defaults to window) */
  target?: EventTarget;
}

interface RegisteredShortcut extends ShortcutDefinition {
  parsed: ParsedShortcut;
}

/**
 * Create a shortcuts plugin instance with optional configuration.
 */
export function createShortcutsPlugin(options: ShortcutsPluginOptions = {}): Plugin {
  const { defaults = true, target = typeof window !== "undefined" ? window : undefined } = options;

  return {
    name: "shortcuts",
    install(desktop: DesktopInstance) {
      const shortcuts = new Map<string, RegisteredShortcut>();

      const handleKeydown = (e: Event) => {
        const event = e as KeyboardEvent;

        for (const shortcut of shortcuts.values()) {
          if (shortcut.enabled === false) continue;

          if (matchesShortcut(event, shortcut.parsed)) {
            event.preventDefault();
            shortcut.handler(desktop);
            return;
          }
        }
      };

      // Register a shortcut
      const register = (def: ShortcutDefinition): (() => void) => {
        const registered: RegisteredShortcut = {
          ...def,
          enabled: def.enabled !== false,
          parsed: parseShortcut(def.keys)
        };
        shortcuts.set(def.id, registered);
        return () => unregister(def.id);
      };

      // Unregister a shortcut
      const unregister = (id: string): boolean => {
        return shortcuts.delete(id);
      };

      // Enable/disable a shortcut
      const setEnabled = (id: string, enabled: boolean): boolean => {
        const shortcut = shortcuts.get(id);
        if (!shortcut) return false;
        shortcut.enabled = enabled;
        return true;
      };

      // Get all registered shortcuts
      const getShortcuts = (): ShortcutDefinition[] => {
        return Array.from(shortcuts.values()).map((shortcut) => ({
          id: shortcut.id,
          keys: shortcut.keys,
          handler: shortcut.handler,
          enabled: shortcut.enabled,
          description: shortcut.description
        }));
      };

      // Expose API on desktop instance via meta
      (desktop as DesktopInstanceWithShortcuts).shortcuts = {
        register,
        unregister,
        setEnabled,
        getShortcuts
      };

      // Add default shortcuts
      if (defaults) {
        // Ctrl+W / Cmd+W - Close focused window
        register({
          id: "close-window",
          keys: "ctrl+w",
          description: "Close focused window",
          handler: (d) => {
            const focusedId = d.getFocusedWindowId();
            if (focusedId) {
              const win = d.getWindow(focusedId);
              if (win?.behaviors?.closable !== false) {
                d.closeWindow(focusedId);
              }
            }
          }
        });

        // Ctrl+Shift+F - Toggle maximize (fullscreen-style)
        register({
          id: "toggle-maximize",
          keys: "ctrl+shift+f",
          description: "Toggle maximize for focused window",
          handler: (d) => {
            const focusedId = d.getFocusedWindowId();
            if (focusedId) {
              const win = d.getWindow(focusedId);
              if (win?.behaviors?.maximizable !== false) {
                const mode = d.getMode(focusedId);
                if (mode === "maximized") {
                  d.restoreWindow(focusedId);
                } else {
                  d.maximizeWindow(focusedId);
                }
              }
            }
          }
        });

        // Ctrl+M / Cmd+M - Minimize focused window
        register({
          id: "minimize-window",
          keys: "ctrl+m",
          description: "Minimize focused window",
          handler: (d) => {
            const focusedId = d.getFocusedWindowId();
            if (focusedId) {
              const win = d.getWindow(focusedId);
              if (win?.behaviors?.minimizable !== false) {
                d.minimizeWindow(focusedId);
              }
            }
          }
        });
      }

      // Attach event listener
      if (target) {
        target.addEventListener("keydown", handleKeydown);
      }

      // Return cleanup function
      return () => {
        if (target) {
          target.removeEventListener("keydown", handleKeydown);
        }
        shortcuts.clear();
        delete (desktop as DesktopInstanceWithShortcuts).shortcuts;
      };
    }
  };
}

/** Desktop instance with shortcuts API attached */
export interface ShortcutsAPI {
  register(def: ShortcutDefinition): () => void;
  unregister(id: string): boolean;
  setEnabled(id: string, enabled: boolean): boolean;
  getShortcuts(): ShortcutDefinition[];
}

export interface DesktopInstanceWithShortcuts extends DesktopInstance {
  shortcuts?: ShortcutsAPI;
}

/** Default shortcuts plugin with standard options */
export const ShortcutsPlugin = createShortcutsPlugin();
