import type { Plugin } from "../../../src";
import type { AlwaysOnTopAPI, DesktopWithAlwaysOnTop } from "./types";

// Re-export types for consumers
export type { AlwaysOnTopAPI, DesktopWithAlwaysOnTop };

/**
 * Creates an AlwaysOnTopPlugin.
 *
 * This plugin allows windows to be "pinned" to always stay on top of
 * other windows, similar to the "Always on Top" feature in many desktop
 * applications.
 *
 * @example
 * ```typescript
 * import { createDesktop } from '@kiwiproject/vue-desktop'
 * import {
 *   createAlwaysOnTopPlugin,
 *   DesktopWithAlwaysOnTop
 * } from './examples/plugins/always-on-top-plugin'
 *
 * const desktop = createDesktop() as DesktopWithAlwaysOnTop
 * desktop.installPlugin(createAlwaysOnTopPlugin())
 *
 * // Pin a window
 * desktop.alwaysOnTop?.pin('my-window-id')
 *
 * // Check if pinned
 * if (desktop.alwaysOnTop?.isPinned('my-window-id')) {
 *   console.log('Window is pinned!')
 * }
 *
 * // Toggle pin state
 * desktop.alwaysOnTop?.toggle('my-window-id')
 * ```
 */
export function createAlwaysOnTopPlugin(): Plugin {
  return {
    name: "always-on-top",

    install(desktop) {
      // Track pinned windows
      const pinnedWindows = new Set<string>();

      // Store original method reference
      const originalFocusWindow = desktop.focusWindow.bind(desktop);

      // Wrap focusWindow to maintain pinned window order
      desktop.focusWindow = (windowId: string) => {
        // First, focus the requested window normally
        originalFocusWindow(windowId);

        // Then, re-focus all pinned windows (except the one being focused)
        // This ensures pinned windows stay on top
        pinnedWindows.forEach((pinnedId) => {
          if (pinnedId !== windowId && desktop.getWindow(pinnedId)) {
            originalFocusWindow(pinnedId);
          }
        });

        // If the focused window is pinned, make sure it's on top
        if (pinnedWindows.has(windowId)) {
          originalFocusWindow(windowId);
        }
      };

      // Clean up closed windows from pinned set
      const unsubClose = desktop.on("window:closed", ({ windowId }) => {
        pinnedWindows.delete(windowId);
      });

      // Create the API
      const api: AlwaysOnTopAPI = {
        pin(windowId: string) {
          if (desktop.getWindow(windowId)) {
            pinnedWindows.add(windowId);
            // Bring to top immediately
            originalFocusWindow(windowId);
          }
        },

        unpin(windowId: string) {
          pinnedWindows.delete(windowId);
        },

        isPinned(windowId: string) {
          return pinnedWindows.has(windowId);
        },

        toggle(windowId: string) {
          if (pinnedWindows.has(windowId)) {
            pinnedWindows.delete(windowId);
            return false;
          } else if (desktop.getWindow(windowId)) {
            pinnedWindows.add(windowId);
            originalFocusWindow(windowId);
            return true;
          }
          return false;
        },

        getPinnedWindows() {
          return [...pinnedWindows];
        }
      };

      // Attach API to desktop
      (desktop as DesktopWithAlwaysOnTop).alwaysOnTop = api;

      // Return cleanup function
      return () => {
        // Restore original focusWindow
        desktop.focusWindow = originalFocusWindow;

        // Unsubscribe from events
        unsubClose();

        // Remove API
        delete (desktop as DesktopWithAlwaysOnTop).alwaysOnTop;

        // Clear pinned windows
        pinnedWindows.clear();
      };
    }
  };
}

/**
 * AlwaysOnTopPlugin - Default instance.
 *
 * This plugin demonstrates:
 * - Wrapping core desktop methods
 * - Complex stateful behavior
 * - Proper cleanup of method overrides
 * - Event handling to maintain consistency
 */
export const AlwaysOnTopPlugin = createAlwaysOnTopPlugin();

export default AlwaysOnTopPlugin;
