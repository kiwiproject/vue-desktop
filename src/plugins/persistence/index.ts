import type { Plugin, Bounds, WindowMode, WindowDefinition } from "../../core/types";
import type { DesktopInstance } from "../../core/DesktopInstance";
import {
  createLocalStorageAdapter,
  type PersistedWindowState,
  type PersistedWindowInfo,
  type PersistedState,
  type PersistencePluginOptions
} from "./types";

export type {
  StorageAdapter,
  PersistedState,
  PersistedWindowState,
  PersistedWindowInfo,
  PersistencePluginOptions
} from "./types";

export { createLocalStorageAdapter, createMemoryStorageAdapter, createChainedAdapter } from "./types";

export interface PersistenceAPI {
  /** Manually save current state */
  save(): void;
  /** Manually load and apply state */
  load(): void;
  /** Restore session (recreate windows from persisted state) */
  restoreSession(): void;
  /** Clear all persisted state */
  clear(): void;
  /** Get persisted state for a window */
  getWindowState(windowId: string): PersistedWindowState | undefined;
  /** Check if persistence is enabled */
  isEnabled(): boolean;
  /** Enable or disable persistence */
  setEnabled(enabled: boolean): void;
}

export interface DesktopInstanceWithPersistence extends DesktopInstance {
  persistence?: PersistenceAPI;
}

/**
 * Create a persistence plugin with the given options.
 */
export function createPersistencePlugin(options: PersistencePluginOptions = {}): Plugin {
  const {
    storageKey = "vue-desktop-state",
    debounceMs = 300,
    persistBounds = true,
    persistMode = true,
    persistZOrder = false,
    persistSession = false,
    getWindowKey = (windowId) => windowId,
    windowFactory
  } = options;

  const storage = options.storage ?? createLocalStorageAdapter(storageKey);

  return {
    name: "persistence",
    install(desktop: DesktopInstance) {
      let enabled = true;
      let saveTimeout: ReturnType<typeof setTimeout> | null = null;
      let currentState: PersistedState = { windows: {}, openWindows: [] };
      let isRestoring = false; // Flag to prevent re-persisting during restore

      // Load initial state
      const loadState = (): void => {
        const loaded = storage.load();
        if (loaded) {
          currentState = {
            windows: loaded.windows ?? {},
            openWindows: loaded.openWindows ?? [],
            zOrder: loaded.zOrder
          };
        }
      };

      // Save state with debouncing
      const saveState = (): void => {
        if (!enabled || isRestoring) return;

        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }

        saveTimeout = setTimeout(() => {
          storage.save(currentState);
          saveTimeout = null;
        }, debounceMs);
      };

      // Get the persistence key for a window
      const getPersistKey = (windowId: string): string | null => {
        const win = desktop.getWindow(windowId);
        if (!win) return null;
        return getWindowKey(windowId, win.type, win.singletonKey);
      };

      // Update state for a window
      const updateWindowState = (windowId: string, updates: Partial<PersistedWindowState>): void => {
        const key = getPersistKey(windowId);
        if (!key) return;

        const existing = currentState.windows[key] ?? {};
        currentState.windows[key] = { ...existing, ...updates };
        saveState();
      };

      // Get state for a window
      const getWindowState = (windowId: string): PersistedWindowState | undefined => {
        const key = getPersistKey(windowId);
        if (!key) return undefined;
        return currentState.windows[key];
      };

      // Apply persisted state to a window
      const applyPersistedState = (windowId: string): void => {
        if (!enabled) return;

        const state = getWindowState(windowId);
        if (!state) return;

        if (persistBounds && state.bounds) {
          desktop.updateBounds(windowId, state.bounds);
        }

        if (persistMode && state.mode) {
          switch (state.mode) {
            case "maximized":
              desktop.maximizeWindow(windowId);
              break;
            case "minimized":
              desktop.minimizeWindow(windowId);
              break;
            case "normal":
              desktop.restoreWindow(windowId);
              break;
          }
        }
      };

      // Update z-order in state
      const updateZOrder = (): void => {
        if (!persistZOrder) return;
        currentState.zOrder = [...desktop.zOrder];
        saveState();
      };

      // Add window to open windows list
      const addToOpenWindows = (windowId: string): void => {
        if (!persistSession) return;

        const win = desktop.getWindow(windowId);
        if (!win) return;

        const key = getPersistKey(windowId);
        if (!key) return;

        // Check if already in list
        if (currentState.openWindows?.some((w) => w.key === key)) return;

        const info: PersistedWindowInfo = {
          key,
          type: win.type,
          title: win.title,
          singletonKey: win.singletonKey,
          props: win.props as Record<string, unknown> | undefined,
          meta: win.meta
        };

        currentState.openWindows = [...(currentState.openWindows ?? []), info];
        saveState();
      };

      // Remove window from open windows list (takes window def since window is already removed)
      const removeFromOpenWindows = (win: WindowDefinition): void => {
        if (!persistSession) return;

        const key = getWindowKey(win.id!, win.type, win.singletonKey);
        if (!key) return;

        currentState.openWindows = (currentState.openWindows ?? []).filter((w) => w.key !== key);
        saveState();
      };

      // Restore session - recreate windows from persisted state
      const restoreSession = (): void => {
        if (!persistSession || !windowFactory) return;
        if (!currentState.openWindows?.length) return;

        isRestoring = true;

        // Track old keys to new keys for bounds/mode migration
        const keyMapping = new Map<string, string>();

        try {
          for (const info of currentState.openWindows) {
            // Check if window already exists (by key)
            const existingWindow = desktop.windows.find((w) => {
              const existingKey = getWindowKey(w.id!, w.type, w.singletonKey);
              return existingKey === info.key;
            });

            if (existingWindow) continue; // Skip if already open

            // Use factory to create window definition
            const def = windowFactory(info);
            if (!def) continue;

            // Get persisted bounds/mode
            const state = currentState.windows[info.key];

            // Create the window
            const win = desktop.createWindow({
              ...def,
              initialBounds: state?.bounds ?? def.initialBounds
            });

            // Track key mapping for bounds/mode migration
            const newKey = getWindowKey(win.id!, win.type, win.singletonKey);
            if (newKey && newKey !== info.key) {
              keyMapping.set(info.key, newKey);
            }

            // Apply mode after creation
            if (state?.mode && persistMode) {
              setTimeout(() => {
                switch (state.mode) {
                  case "maximized":
                    desktop.maximizeWindow(win.id!);
                    break;
                  case "minimized":
                    desktop.minimizeWindow(win.id!);
                    break;
                }
              }, 0);
            }
          }

          // Rebuild openWindows with new keys from current windows
          const newOpenWindows: PersistedWindowInfo[] = [];
          for (const win of desktop.windows) {
            const key = getWindowKey(win.id!, win.type, win.singletonKey);
            if (!key) continue;

            newOpenWindows.push({
              key,
              type: win.type,
              title: win.title,
              singletonKey: win.singletonKey,
              props: win.props as Record<string, unknown> | undefined,
              meta: win.meta
            });
          }
          currentState.openWindows = newOpenWindows;

          // Migrate window state (bounds/mode) to new keys
          for (const [oldKey, newKey] of keyMapping) {
            if (currentState.windows[oldKey] && !currentState.windows[newKey]) {
              currentState.windows[newKey] = currentState.windows[oldKey];
              delete currentState.windows[oldKey];
            }
          }

          // Save the updated state
          storage.save(currentState);
        } finally {
          isRestoring = false;
        }
      };

      // Event handlers
      const handleWindowCreated = (payload: unknown): void => {
        const win = payload as WindowDefinition;
        const id = win.id!;

        // Add to open windows list (for session restoration)
        // Skip if we're restoring - the entries already exist in openWindows
        if (!isRestoring) {
          addToOpenWindows(id);
        }

        // Apply persisted state after a brief delay to let initial bounds settle
        setTimeout(() => applyPersistedState(id), 0);
      };

      const handleBoundsChanged = (payload: unknown): void => {
        if (!persistBounds) return;
        const { windowId, bounds } = payload as { windowId: string; bounds: Bounds };
        updateWindowState(windowId, { bounds });
      };

      const handleWindowMaximized = (payload: unknown): void => {
        if (!persistMode) return;
        const { windowId } = payload as { windowId: string };
        updateWindowState(windowId, { mode: "maximized" as WindowMode });
      };

      const handleWindowMinimized = (payload: unknown): void => {
        if (!persistMode) return;
        const { windowId } = payload as { windowId: string };
        updateWindowState(windowId, { mode: "minimized" as WindowMode });
      };

      const handleWindowRestored = (payload: unknown): void => {
        if (!persistMode) return;
        const { windowId } = payload as { windowId: string };
        updateWindowState(windowId, { mode: "normal" as WindowMode });
      };

      const handleWindowFocused = (): void => {
        updateZOrder();
      };

      const handleWindowClosed = (payload: unknown): void => {
        const { window: win } = payload as { windowId: string; window: WindowDefinition };
        removeFromOpenWindows(win);
        updateZOrder();
      };

      // Load initial state
      loadState();

      // Subscribe to events
      const unsubscribers = [
        desktop.on("window:created", handleWindowCreated),
        desktop.on("window:bounds", handleBoundsChanged),
        desktop.on("window:maximized", handleWindowMaximized),
        desktop.on("window:minimized", handleWindowMinimized),
        desktop.on("window:restored", handleWindowRestored),
        desktop.on("window:focused", handleWindowFocused),
        desktop.on("window:closed", handleWindowClosed)
      ];

      // Expose persistence API
      const persistenceAPI: PersistenceAPI = {
        save(): void {
          if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
          }
          storage.save(currentState);
        },
        load(): void {
          loadState();
          // Apply to all existing windows
          for (const win of desktop.windows) {
            applyPersistedState(win.id!);
          }
        },
        restoreSession,
        clear(): void {
          currentState = { windows: {}, openWindows: [] };
          storage.clear();
        },
        getWindowState,
        isEnabled(): boolean {
          return enabled;
        },
        setEnabled(value: boolean): void {
          enabled = value;
        }
      };

      (desktop as DesktopInstanceWithPersistence).persistence = persistenceAPI;

      // Cleanup
      return () => {
        // Cancel pending save
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }

        // Unsubscribe from events
        for (const unsub of unsubscribers) {
          unsub();
        }

        delete (desktop as DesktopInstanceWithPersistence).persistence;
      };
    }
  };
}

/** Default persistence plugin with localStorage */
export const PersistencePlugin = createPersistencePlugin();
