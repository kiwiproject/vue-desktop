import type { Plugin } from "../../../src";

/**
 * Window events that can be logged.
 */
const WINDOW_EVENTS = [
  "window:created",
  "window:closed",
  "window:focused",
  "window:blurred",
  "window:minimized",
  "window:maximized",
  "window:restored",
  "window:moved",
  "window:resized"
] as const;

type WindowEvent = (typeof WINDOW_EVENTS)[number];

/**
 * Options for the WindowLoggerPlugin.
 */
export interface WindowLoggerOptions {
  /** Events to log. Defaults to all window events. */
  events?: WindowEvent[];
  /** Custom log function. Defaults to console.log. */
  logger?: (event: string, data: unknown) => void;
  /** Prefix for log messages. Defaults to "[vue-desktop]". */
  prefix?: string;
}

/**
 * Creates a WindowLoggerPlugin with custom options.
 *
 * @example
 * ```typescript
 * // Log only focus events
 * const logger = createWindowLoggerPlugin({
 *   events: ['window:focused', 'window:blurred']
 * })
 *
 * // Use custom logger
 * const logger = createWindowLoggerPlugin({
 *   logger: (event, data) => myLogger.debug(event, data)
 * })
 * ```
 */
export function createWindowLoggerPlugin(options: WindowLoggerOptions = {}): Plugin {
  const {
    events = [...WINDOW_EVENTS],
    logger = console.log,
    prefix = "[vue-desktop]"
  } = options;

  return {
    name: "window-logger",

    install(desktop) {
      // Subscribe to each event and store unsubscribe functions
      const unsubscribers = events.map((event) =>
        desktop.on(event, (data: unknown) => {
          logger(`${prefix} ${event}`, data);
        })
      );

      // Return cleanup function that unsubscribes from all events
      return () => {
        unsubscribers.forEach((unsub) => unsub());
      };
    }
  };
}

/**
 * WindowLoggerPlugin - Logs all window lifecycle events to console.
 *
 * This plugin demonstrates:
 * - Event subscription with `desktop.on()`
 * - Proper cleanup of multiple subscriptions
 * - Factory function pattern for configurable plugins
 *
 * @example
 * ```typescript
 * import { createDesktop } from '@kiwiproject/vue-desktop'
 * import { WindowLoggerPlugin } from './examples/plugins/window-logger-plugin'
 *
 * const desktop = createDesktop()
 * desktop.installPlugin(WindowLoggerPlugin)
 *
 * // Now all window events will be logged to console:
 * // [vue-desktop] window:created { id: "win-1", title: "My Window", ... }
 * // [vue-desktop] window:focused { windowId: "win-1" }
 * ```
 */
export const WindowLoggerPlugin = createWindowLoggerPlugin();

export default WindowLoggerPlugin;
