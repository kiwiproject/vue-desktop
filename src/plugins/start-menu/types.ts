import type { WindowDefinition } from "../../core/types";
import type { DesktopInstance } from "../../core/DesktopInstance";

/** Definition for an app in the start menu */
export interface StartMenuApp {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon (emoji or text) */
  icon?: string;
  /** Category for grouping (e.g., "Utilities", "Games") */
  category?: string;
  /** Optional keyboard shortcut hint (e.g., "Ctrl+N") */
  shortcut?: string;
  /** Factory function that returns WindowDefinition to open */
  factory: () => WindowDefinition;
}

/** Options for the start menu plugin */
export interface StartMenuPluginOptions {
  /** Initial apps to register */
  apps?: StartMenuApp[];
  /** Button label (default: "Start") */
  buttonLabel?: string;
  /** Button icon (default: "☰") */
  buttonIcon?: string;
}

/** API exposed on desktop.startMenu */
export interface StartMenuAPI {
  /** Register an app, returns unregister function */
  registerApp(app: StartMenuApp): () => void;
  /** Unregister an app by id */
  unregisterApp(id: string): boolean;
  /** Get all registered apps */
  getApps(): StartMenuApp[];
  /** Get apps grouped by category */
  getAppsByCategory(): Map<string | undefined, StartMenuApp[]>;
  /** Open the menu */
  open(): void;
  /** Close the menu */
  close(): void;
  /** Toggle the menu */
  toggle(): void;
  /** Check if menu is open */
  isOpen(): boolean;
}

/** Desktop instance with start menu API */
export interface DesktopInstanceWithStartMenu extends DesktopInstance {
  startMenu?: StartMenuAPI;
}
