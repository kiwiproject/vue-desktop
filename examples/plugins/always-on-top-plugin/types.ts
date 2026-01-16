import type { DesktopInstance } from "../../../src";

/**
 * API exposed by the AlwaysOnTopPlugin.
 *
 * Access via `desktop.alwaysOnTop` after installing the plugin.
 */
export interface AlwaysOnTopAPI {
  /**
   * Pin a window to stay on top of other windows.
   * @param windowId - ID of the window to pin
   */
  pin(windowId: string): void;

  /**
   * Unpin a window, allowing it to be covered by other windows.
   * @param windowId - ID of the window to unpin
   */
  unpin(windowId: string): void;

  /**
   * Check if a window is currently pinned.
   * @param windowId - ID of the window to check
   */
  isPinned(windowId: string): boolean;

  /**
   * Toggle the pinned state of a window.
   * @param windowId - ID of the window to toggle
   * @returns New pinned state (true = pinned, false = unpinned)
   */
  toggle(windowId: string): boolean;

  /**
   * Get all currently pinned window IDs.
   */
  getPinnedWindows(): string[];
}

/**
 * Extended DesktopInstance with always-on-top API.
 *
 * Use this type for type-safe access:
 * ```typescript
 * const desktop = createDesktop() as DesktopWithAlwaysOnTop
 * desktop.installPlugin(createAlwaysOnTopPlugin())
 * desktop.alwaysOnTop?.pin('my-window')
 * ```
 */
export interface DesktopWithAlwaysOnTop extends DesktopInstance {
  alwaysOnTop?: AlwaysOnTopAPI;
}
