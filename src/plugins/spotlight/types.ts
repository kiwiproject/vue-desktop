import type { DesktopInstance } from "../../core/DesktopInstance";

/** A searchable item in Spotlight */
export interface SpotlightItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon (emoji or text) */
  icon?: string;
  /** Category for grouping (e.g., "Apps", "Windows", "Actions") */
  category: string;
  /** Optional description/subtitle */
  description?: string;
  /** Optional keywords for search matching */
  keywords?: string[];
  /** Action to perform when selected */
  action: () => void;
}

/** Search provider that supplies items to Spotlight */
export interface SpotlightProvider {
  /** Provider identifier */
  id: string;
  /** Get all items (filtering is done by spotlight) */
  getItems(): SpotlightItem[];
}

/** Options for the spotlight plugin */
export interface SpotlightPluginOptions {
  /** Placeholder text (default: "Search...") */
  placeholder?: string;
  /** Max results to show (default: 10) */
  maxResults?: number;
  /** Custom providers to register on init */
  providers?: SpotlightProvider[];
}

/** API exposed on desktop.spotlight */
export interface SpotlightAPI {
  /** Open the spotlight search */
  open(): void;
  /** Close the spotlight search */
  close(): void;
  /** Toggle spotlight */
  toggle(): void;
  /** Check if open */
  isOpen(): boolean;
  /** Register a custom search provider */
  registerProvider(provider: SpotlightProvider): () => void;
  /** Unregister a provider */
  unregisterProvider(id: string): boolean;
  /** Get all providers */
  getProviders(): SpotlightProvider[];
  /** Search and get filtered results */
  search(query: string): SpotlightItem[];
}

/** Desktop instance with spotlight API */
export interface DesktopInstanceWithSpotlight extends DesktopInstance {
  spotlight?: SpotlightAPI;
}
