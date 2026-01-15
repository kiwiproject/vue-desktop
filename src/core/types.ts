import { Component } from "vue";
import type { DesktopInstance } from "./DesktopInstance";

export interface Plugin {
  name: string;
  install(desktop: DesktopInstance): void | (() => void);
}

export interface UIRegistration {
  id: string;
  slot: string;
  component: Component;
  props?: Record<string, unknown>;
  order?: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WindowBehaviors {
  resizable?: boolean;
  movable?: boolean;
  closable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
}

/** A menu item within a dropdown */
export interface MenuBarItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon (emoji or string) */
  icon?: string;
  /** Keyboard shortcut hint (display only) */
  shortcut?: string;
  /** Action when clicked */
  action?: () => void;
  /** Nested submenu items */
  children?: MenuBarItem[];
  /** Whether item is disabled */
  disabled?: boolean;
  /** Separator after this item */
  separator?: boolean;
}

/** A top-level menu (e.g., "File", "Edit", "View") */
export interface MenuBarMenu {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Menu items - can be static array or function for dynamic items */
  items: MenuBarItem[] | (() => MenuBarItem[]);
}

/** Menu bar definition for a window */
export type MenuBarDefinition = MenuBarMenu[];

export interface WindowDefinition<Props = unknown> {
  id?: string;
  type: string;
  title: string;
  component: Component;
  props?: Props;
  singletonKey?: string;
  icon?: string;
  initialBounds?: Partial<Bounds>;
  constraints?: WindowConstraints;
  behaviors?: WindowBehaviors;
  menuBar?: MenuBarDefinition;
  meta?: Record<string, unknown>;
}

export type WindowId = string;

export type WindowMode = "normal" | "minimized" | "maximized";
