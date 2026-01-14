import type { Bounds, WindowMode, WindowDefinition } from "../../core/types";

/** Persisted state for a single window */
export interface PersistedWindowState {
  bounds?: Bounds;
  mode?: WindowMode;
}

/** Serializable window info for session restoration */
export interface PersistedWindowInfo {
  /** Persist key for this window */
  key: string;
  /** Window type */
  type: string;
  /** Window title */
  title: string;
  /** Singleton key if any */
  singletonKey?: string;
  /** Window props (must be JSON-serializable) */
  props?: Record<string, unknown>;
  /** Any additional metadata */
  meta?: Record<string, unknown>;
}

/** Full persisted state */
export interface PersistedState {
  windows: Record<string, PersistedWindowState>;
  /** List of open windows for session restoration */
  openWindows?: PersistedWindowInfo[];
  zOrder?: string[];
}

/** Storage adapter interface for persistence */
export interface StorageAdapter {
  /** Load persisted state */
  load(): PersistedState | null;
  /** Save state to storage */
  save(state: PersistedState): void;
  /** Clear all persisted state */
  clear(): void;
}

/** Options for the persistence plugin */
export interface PersistencePluginOptions {
  /** Storage adapter (defaults to localStorage adapter) */
  storage?: StorageAdapter;
  /** Storage key for localStorage (default: "vue-desktop-state") */
  storageKey?: string;
  /** Debounce delay in ms for saving (default: 300) */
  debounceMs?: number;
  /** Whether to persist window bounds (default: true) */
  persistBounds?: boolean;
  /** Whether to persist window mode (default: true) */
  persistMode?: boolean;
  /** Whether to persist z-order (default: false) */
  persistZOrder?: boolean;
  /**
   * Whether to persist the list of open windows for session restoration (default: false).
   * Requires windowFactory to be provided.
   */
  persistSession?: boolean;
  /**
   * Function to get persist key for a window.
   * By default uses window.id, but you can use singletonKey or custom logic.
   */
  getWindowKey?: (windowId: string, windowType: string, singletonKey?: string) => string | null;
  /**
   * Factory function to recreate windows from persisted info.
   * Required for session restoration (persistSession: true).
   * Should return a WindowDefinition with the component, or null to skip.
   */
  windowFactory?: (info: PersistedWindowInfo) => WindowDefinition | null;
}

/**
 * Create a localStorage-based storage adapter.
 */
export function createLocalStorageAdapter(key: string): StorageAdapter {
  return {
    load(): PersistedState | null {
      if (typeof localStorage === "undefined") return null;
      try {
        const data = localStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data) as PersistedState;
      } catch {
        return null;
      }
    },
    save(state: PersistedState): void {
      if (typeof localStorage === "undefined") return;
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // Storage quota exceeded or other error
      }
    },
    clear(): void {
      if (typeof localStorage === "undefined") return;
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore errors
      }
    }
  };
}

/**
 * Create an in-memory storage adapter (useful for testing).
 */
export function createMemoryStorageAdapter(): StorageAdapter & { getData(): PersistedState | null } {
  let data: PersistedState | null = null;
  return {
    load(): PersistedState | null {
      return data;
    },
    save(state: PersistedState): void {
      data = JSON.parse(JSON.stringify(state)); // Deep clone
    },
    clear(): void {
      data = null;
    },
    getData(): PersistedState | null {
      return data;
    }
  };
}

/**
 * Create a chained storage adapter that delegates to multiple adapters.
 * - load(): Returns the first non-null result from adapters (in order)
 * - save(): Saves to all adapters
 * - clear(): Clears all adapters
 *
 * Useful for combining localStorage with server sync, or wrapping adapters.
 *
 * @example
 * ```ts
 * const adapter = createChainedAdapter(
 *   createLocalStorageAdapter('vue-desktop'),
 *   serverStorageAdapter
 * );
 * ```
 */
export function createChainedAdapter(...adapters: StorageAdapter[]): StorageAdapter {
  return {
    load(): PersistedState | null {
      for (const adapter of adapters) {
        const state = adapter.load();
        if (state) return state;
      }
      return null;
    },
    save(state: PersistedState): void {
      for (const adapter of adapters) {
        adapter.save(state);
      }
    },
    clear(): void {
      for (const adapter of adapters) {
        adapter.clear();
      }
    }
  };
}
