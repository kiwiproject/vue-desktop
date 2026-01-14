import type { Plugin, Bounds } from "../../core/types";
import type { DesktopInstance } from "../../core/DesktopInstance";
import { applySnapping, type SnapOptions } from "./utils";

export type { SnapOptions, SnapResult, SnapTarget } from "./utils";
export {
  snapToValue,
  snapToGrid,
  snapToEdges,
  snapBoundsToGrid,
  snapToWindows,
  applySnapping
} from "./utils";

export interface SnapPluginOptions extends SnapOptions {
  /** Viewport bounds for edge snapping (required if edges=true) */
  getViewport?: () => Bounds | undefined;
}

export interface SnapAPI {
  /** Enable or disable snapping */
  setEnabled(enabled: boolean): void;
  /** Check if snapping is enabled */
  isEnabled(): boolean;
  /** Update snap options */
  setOptions(options: Partial<SnapOptions>): void;
  /** Get current snap options */
  getOptions(): SnapOptions;
}

export interface DesktopInstanceWithSnap extends DesktopInstance {
  snap?: SnapAPI;
}

/**
 * Create a snap plugin with the given options.
 */
export function createSnapPlugin(options: SnapPluginOptions = {}): Plugin {
  const defaultOptions: SnapPluginOptions = {
    edges: true,
    windows: true,
    gridSize: 0, // Disabled by default
    threshold: 10,
    ...options
  };

  return {
    name: "snap",
    install(desktop: DesktopInstance) {
      let enabled = true;
      let currentOptions: SnapOptions = { ...defaultOptions };
      const getViewport = defaultOptions.getViewport;

      // Store original updateBounds
      const originalUpdateBounds = desktop.updateBounds.bind(desktop);

      // Create wrapped updateBounds that applies snapping
      const wrappedUpdateBounds = (id: string, bounds: Bounds): boolean => {
        if (!enabled) {
          return originalUpdateBounds(id, bounds);
        }

        // Get viewport for edge snapping
        const viewport = getViewport?.();

        // Get other windows for window-to-window snapping
        const otherWindows = desktop.windows
          .filter((w) => w.id !== id && desktop.getMode(w.id!) !== "minimized")
          .map((w) => ({
            id: w.id!,
            bounds: desktop.getBounds(w.id!) ?? (w.initialBounds as Bounds)
          }))
          .filter((w) => w.bounds);

        // Apply snapping
        const result = applySnapping(bounds, id, {
          viewport,
          otherWindows,
          snapOptions: currentOptions
        });

        // Update with snapped bounds
        return originalUpdateBounds(id, result.bounds);
      };

      // Replace updateBounds on the instance
      (desktop as { updateBounds: typeof wrappedUpdateBounds }).updateBounds = wrappedUpdateBounds;

      // Expose snap API
      const snapAPI: SnapAPI = {
        setEnabled(value: boolean) {
          enabled = value;
        },
        isEnabled() {
          return enabled;
        },
        setOptions(opts: Partial<SnapOptions>) {
          currentOptions = { ...currentOptions, ...opts };
        },
        getOptions() {
          return { ...currentOptions };
        }
      };

      (desktop as DesktopInstanceWithSnap).snap = snapAPI;

      // Cleanup function
      return () => {
        // Restore original updateBounds
        (desktop as { updateBounds: typeof originalUpdateBounds }).updateBounds = originalUpdateBounds;
        delete (desktop as DesktopInstanceWithSnap).snap;
      };
    }
  };
}

/** Default snap plugin with edge and window snapping enabled */
export const SnapPlugin = createSnapPlugin();
