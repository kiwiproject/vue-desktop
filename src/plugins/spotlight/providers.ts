import type { DesktopInstance } from "../../core/DesktopInstance";
import type { DesktopInstanceWithStartMenu } from "../start-menu";
import type { SpotlightProvider, SpotlightItem } from "./types";

/**
 * Create a provider that sources items from the StartMenu plugin.
 * Returns empty array if StartMenuPlugin is not installed.
 */
export function createAppsProvider(desktop: DesktopInstance): SpotlightProvider {
  return {
    id: "apps",
    getItems(): SpotlightItem[] {
      const startMenu = (desktop as DesktopInstanceWithStartMenu).startMenu;
      if (!startMenu) return [];

      return startMenu.getApps().map((app) => ({
        id: `app:${app.id}`,
        label: app.label,
        icon: app.icon,
        category: "Apps",
        description: app.category,
        keywords: app.shortcut ? [app.shortcut] : undefined,
        action: () => {
          // Smart behavior: check for existing singleton window
          if (app.factory) {
            const def = app.factory();

            // If singleton, check if window already exists
            if (def.singletonKey) {
              const existing = desktop.windows.find(
                (w) => w.singletonKey === def.singletonKey
              );
              if (existing) {
                // Focus existing window
                if (desktop.getMode(existing.id!) === "minimized") {
                  desktop.restoreWindow(existing.id!);
                }
                desktop.focusWindow(existing.id!);
                return;
              }
            }

            // Create new window
            desktop.createWindow(def);
          }
        }
      }));
    }
  };
}

/**
 * Create a provider that sources items from open windows.
 */
export function createWindowsProvider(desktop: DesktopInstance): SpotlightProvider {
  return {
    id: "windows",
    getItems(): SpotlightItem[] {
      return desktop.windows.map((win) => ({
        id: `window:${win.id}`,
        label: win.title,
        icon: win.icon ?? "▢",
        category: "Windows",
        description: desktop.getMode(win.id!) === "minimized" ? "Minimized" : undefined,
        action: () => {
          // Restore if minimized, then focus
          if (desktop.getMode(win.id!) === "minimized") {
            desktop.restoreWindow(win.id!);
          }
          desktop.focusWindow(win.id!);
        }
      }));
    }
  };
}
