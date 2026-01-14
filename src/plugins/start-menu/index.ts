import { shallowRef, triggerRef } from "vue";
import type { Plugin } from "../../core/types";
import type { DesktopInstance } from "../../core/DesktopInstance";
import type {
  StartMenuApp,
  StartMenuAPI,
  StartMenuPluginOptions,
  DesktopInstanceWithStartMenu
} from "./types";
import StartMenu from "./StartMenu";

export type {
  StartMenuApp,
  StartMenuAPI,
  StartMenuPluginOptions,
  DesktopInstanceWithStartMenu
} from "./types";

export { default as StartMenu } from "./StartMenu";

/**
 * Create a start menu plugin with the given options.
 */
export function createStartMenuPlugin(options: StartMenuPluginOptions = {}): Plugin {
  const { buttonLabel = "Start", buttonIcon = "☰" } = options;

  return {
    name: "start-menu",
    install(desktop: DesktopInstance) {
      // Reactive state
      const apps = shallowRef<StartMenuApp[]>([...(options.apps ?? [])]);
      const isMenuOpen = shallowRef(false);

      // API implementation
      const api: StartMenuAPI = {
        registerApp(app: StartMenuApp): () => void {
          // Check for duplicate id
          if (apps.value.some((a) => a.id === app.id)) {
            console.warn(`StartMenu: App with id "${app.id}" already registered`);
            return () => {};
          }

          apps.value = [...apps.value, app];
          triggerRef(apps);

          return () => api.unregisterApp(app.id);
        },

        unregisterApp(id: string): boolean {
          const idx = apps.value.findIndex((a) => a.id === id);
          if (idx === -1) return false;

          apps.value = apps.value.filter((a) => a.id !== id);
          triggerRef(apps);
          return true;
        },

        getApps(): StartMenuApp[] {
          return apps.value;
        },

        getAppsByCategory(): Map<string | undefined, StartMenuApp[]> {
          const map = new Map<string | undefined, StartMenuApp[]>();

          // Sort apps: those with categories first, then by category name, then by label
          const sorted = [...apps.value].sort((a, b) => {
            // Apps without category go last
            if (a.category && !b.category) return -1;
            if (!a.category && b.category) return 1;

            // Same category status, sort by category name
            if (a.category !== b.category) {
              return (a.category ?? "").localeCompare(b.category ?? "");
            }

            // Same category, sort by label
            return a.label.localeCompare(b.label);
          });

          for (const app of sorted) {
            const category = app.category;
            const existing = map.get(category) ?? [];
            map.set(category, [...existing, app]);
          }

          return map;
        },

        open(): void {
          isMenuOpen.value = true;
          triggerRef(isMenuOpen);
        },

        close(): void {
          isMenuOpen.value = false;
          triggerRef(isMenuOpen);
        },

        toggle(): void {
          isMenuOpen.value = !isMenuOpen.value;
          triggerRef(isMenuOpen);
        },

        isOpen(): boolean {
          return isMenuOpen.value;
        }
      };

      // Attach API to desktop
      (desktop as DesktopInstanceWithStartMenu).startMenu = api;

      // Register UI component in taskbar slot
      const unregisterUI = desktop.registerUI({
        id: "start-menu",
        slot: "taskbar",
        component: StartMenu,
        order: -100, // Before other taskbar items
        props: {
          api,
          desktop,
          buttonLabel,
          buttonIcon
        }
      });

      // Cleanup
      return () => {
        unregisterUI();
        delete (desktop as DesktopInstanceWithStartMenu).startMenu;
      };
    }
  };
}

/** Default start menu plugin with no apps */
export const StartMenuPlugin = createStartMenuPlugin();
