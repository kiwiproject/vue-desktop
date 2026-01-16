import type { Plugin } from "../../../src";
import type { CounterAPI, DesktopWithCounter, WindowStats } from "./types";

// Re-export types for consumers
export type { CounterAPI, DesktopWithCounter, WindowStats };

/**
 * Creates a WindowCounterPlugin.
 *
 * This plugin tracks window lifecycle statistics and exposes them via
 * a `counter` API on the desktop instance.
 *
 * @example
 * ```typescript
 * import { createDesktop } from '@kiwiproject/vue-desktop'
 * import { createWindowCounterPlugin, DesktopWithCounter } from './examples/plugins/window-counter-plugin'
 *
 * const desktop = createDesktop() as DesktopWithCounter
 * desktop.installPlugin(createWindowCounterPlugin())
 *
 * // Create some windows...
 * desktop.createWindow({ title: 'Window 1', component: MyComponent })
 * desktop.createWindow({ title: 'Window 2', component: MyComponent })
 *
 * // Access statistics
 * console.log(desktop.counter?.getCount()) // 2
 * console.log(desktop.counter?.getStats())
 * // { created: 2, closed: 0, current: 2, peak: 2 }
 * ```
 */
export function createWindowCounterPlugin(): Plugin {
  return {
    name: "window-counter",

    install(desktop) {
      // Internal state
      let created = 0;
      let closed = 0;
      let peak = 0;

      // Update peak when windows are created
      const updatePeak = () => {
        const current = desktop.windows.length;
        if (current > peak) {
          peak = current;
        }
      };

      // Subscribe to window events
      const unsubCreate = desktop.on("window:created", () => {
        created++;
        updatePeak();
      });

      const unsubClose = desktop.on("window:closed", () => {
        closed++;
      });

      // Create the API object
      const api: CounterAPI = {
        getCount() {
          return desktop.windows.length;
        },

        getStats() {
          return {
            created,
            closed,
            current: desktop.windows.length,
            peak
          };
        },

        reset() {
          created = 0;
          closed = 0;
          peak = desktop.windows.length;
        }
      };

      // Attach API to desktop instance
      (desktop as DesktopWithCounter).counter = api;

      // Initialize peak with current window count
      updatePeak();

      // Return cleanup function
      return () => {
        unsubCreate();
        unsubClose();
        delete (desktop as DesktopWithCounter).counter;
      };
    }
  };
}

/**
 * WindowCounterPlugin - Default instance of the window counter plugin.
 *
 * This plugin demonstrates:
 * - Extending the desktop instance with a custom API
 * - TypeScript interface extension pattern
 * - Stateful plugins with internal tracking
 * - Factory function pattern
 */
export const WindowCounterPlugin = createWindowCounterPlugin();

export default WindowCounterPlugin;
