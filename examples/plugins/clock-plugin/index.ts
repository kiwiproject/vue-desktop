import type { Plugin } from "../../../src";
import ClockOverlay from "./ClockOverlay";

/**
 * ClockPlugin - A simple example plugin that displays a clock overlay.
 *
 * This plugin demonstrates:
 * - Basic plugin structure (name + install function)
 * - Registering a UI component with `registerUI()`
 * - Proper cleanup by returning an unregister function
 *
 * @example
 * ```typescript
 * import { createDesktop } from '@kiwiproject/vue-desktop'
 * import { ClockPlugin } from './examples/plugins/clock-plugin'
 *
 * const desktop = createDesktop()
 * desktop.installPlugin(ClockPlugin)
 * ```
 */
export const ClockPlugin: Plugin = {
  name: "clock",

  install(desktop) {
    // Register the clock overlay in the 'overlay' slot
    // The overlay slot renders components above all windows
    const unregister = desktop.registerUI({
      id: "clock-overlay",
      slot: "overlay",
      component: ClockOverlay,
      order: 1000 // High order to render on top
    });

    // Return cleanup function - called when plugin is uninstalled
    return unregister;
  }
};

export default ClockPlugin;
