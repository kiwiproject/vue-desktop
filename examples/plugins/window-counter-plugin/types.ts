import type { DesktopInstance } from "../../../src";

/**
 * Statistics tracked by the WindowCounterPlugin.
 */
export interface WindowStats {
  /** Total windows created since plugin install */
  created: number;
  /** Total windows closed since plugin install */
  closed: number;
  /** Current number of open windows */
  current: number;
  /** Peak number of windows open at once */
  peak: number;
}

/**
 * API exposed by the WindowCounterPlugin.
 *
 * Access via `desktop.counter` after installing the plugin.
 */
export interface CounterAPI {
  /** Get the current number of open windows */
  getCount(): number;
  /** Get detailed window statistics */
  getStats(): WindowStats;
  /** Reset statistics (does not affect open windows) */
  reset(): void;
}

/**
 * Extended DesktopInstance with counter API.
 *
 * Use this type for type-safe access to the counter:
 * ```typescript
 * const desktop = createDesktop() as DesktopWithCounter
 * desktop.installPlugin(createWindowCounterPlugin())
 * console.log(desktop.counter?.getStats())
 * ```
 */
export interface DesktopWithCounter extends DesktopInstance {
  counter?: CounterAPI;
}
