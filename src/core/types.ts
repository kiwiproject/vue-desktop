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
  meta?: Record<string, unknown>;
}

export type WindowId = string;

export type WindowMode = "normal" | "minimized" | "maximized";
