import { shallowRef, triggerRef, h } from "vue";
import type { Plugin } from "../../core/types";
import type { DesktopInstance } from "../../core/DesktopInstance";
import type {
  SpotlightItem,
  SpotlightProvider,
  SpotlightAPI,
  SpotlightPluginOptions,
  DesktopInstanceWithSpotlight
} from "./types";
import { createAppsProvider, createWindowsProvider } from "./providers";
import Spotlight from "./Spotlight";

export type {
  SpotlightItem,
  SpotlightProvider,
  SpotlightAPI,
  SpotlightPluginOptions,
  DesktopInstanceWithSpotlight
} from "./types";

export { createAppsProvider, createWindowsProvider } from "./providers";
export { default as Spotlight } from "./Spotlight";

/**
 * Create a spotlight plugin with the given options.
 */
export function createSpotlightPlugin(options: SpotlightPluginOptions = {}): Plugin {
  const { placeholder = "Search...", maxResults = 10 } = options;

  return {
    name: "spotlight",
    install(desktop: DesktopInstance) {
      // Reactive state
      const providers = shallowRef<SpotlightProvider[]>([]);
      const isSpotlightOpen = shallowRef(false);

      // Add built-in providers
      const appsProvider = createAppsProvider(desktop);
      const windowsProvider = createWindowsProvider(desktop);
      providers.value = [appsProvider, windowsProvider];

      // Add custom providers from options
      if (options.providers) {
        providers.value = [...providers.value, ...options.providers];
      }

      // Search function
      const search = (query: string): SpotlightItem[] => {
        const results: SpotlightItem[] = [];
        const lowerQuery = query.toLowerCase().trim();

        for (const provider of providers.value) {
          const items = provider.getItems();
          for (const item of items) {
            // If no query, show all items
            if (lowerQuery === "") {
              results.push(item);
              continue;
            }

            // Match against label, description, keywords
            const matches =
              item.label.toLowerCase().includes(lowerQuery) ||
              item.description?.toLowerCase().includes(lowerQuery) ||
              item.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));

            if (matches) {
              results.push(item);
            }
          }
        }

        // Sort: exact matches first, then by category, then by label
        results.sort((a, b) => {
          const aExact = a.label.toLowerCase() === lowerQuery;
          const bExact = b.label.toLowerCase() === lowerQuery;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          // Apps before Windows
          if (a.category === "Apps" && b.category !== "Apps") return -1;
          if (a.category !== "Apps" && b.category === "Apps") return 1;

          return a.label.localeCompare(b.label);
        });

        return results.slice(0, maxResults);
      };

      // API implementation
      const api: SpotlightAPI = {
        open(): void {
          isSpotlightOpen.value = true;
          triggerRef(isSpotlightOpen);
        },

        close(): void {
          isSpotlightOpen.value = false;
          triggerRef(isSpotlightOpen);
        },

        toggle(): void {
          isSpotlightOpen.value = !isSpotlightOpen.value;
          triggerRef(isSpotlightOpen);
        },

        isOpen(): boolean {
          return isSpotlightOpen.value;
        },

        registerProvider(provider: SpotlightProvider): () => void {
          // Check for duplicate id
          if (providers.value.some((p) => p.id === provider.id)) {
            console.warn(`Spotlight: Provider with id "${provider.id}" already registered`);
            return () => {};
          }

          providers.value = [...providers.value, provider];
          triggerRef(providers);

          return () => api.unregisterProvider(provider.id);
        },

        unregisterProvider(id: string): boolean {
          const idx = providers.value.findIndex((p) => p.id === id);
          if (idx === -1) return false;

          providers.value = providers.value.filter((p) => p.id !== id);
          triggerRef(providers);
          return true;
        },

        getProviders(): SpotlightProvider[] {
          return providers.value;
        },

        search
      };

      // Attach API to desktop
      (desktop as DesktopInstanceWithSpotlight).spotlight = api;

      // Keyboard shortcut handler (Ctrl+K / Cmd+K)
      const handleKeydown = (e: KeyboardEvent) => {
        const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        if (modifier && e.key.toLowerCase() === "k") {
          e.preventDefault();
          api.toggle();
        }
      };

      // Attach event listener (if document is available)
      const hasDocument = typeof document !== "undefined";
      if (hasDocument) {
        document.addEventListener("keydown", handleKeydown);
      }

      // Register UI component (renders when open)
      const unregisterUI = desktop.registerUI({
        id: "spotlight",
        slot: "overlay",
        component: {
          name: "SpotlightWrapper",
          setup() {
            return () =>
              h(Spotlight, {
                api,
                placeholder,
                maxResults
              });
          }
        },
        order: 0
      });

      // Cleanup
      return () => {
        if (hasDocument) {
          document.removeEventListener("keydown", handleKeydown);
        }
        unregisterUI();
        delete (desktop as DesktopInstanceWithSpotlight).spotlight;
      };
    }
  };
}

/** Default spotlight plugin */
export const SpotlightPlugin = createSpotlightPlugin();
