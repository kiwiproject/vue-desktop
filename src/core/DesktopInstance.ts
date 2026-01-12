import { Component } from "vue";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowDefinition<Props = unknown> {
  id?: string;
  type: string;
  title: string;
  component: Component;
  props?: Props;
}

export class DesktopInstance {
  windows: WindowDefinition[] = [];

  createWindow(def: WindowDefinition) {
    this.windows.push(def);
    return def;
  }
}

export const createDesktop = () => new DesktopInstance();
