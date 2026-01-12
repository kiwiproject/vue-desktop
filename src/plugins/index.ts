export type PluginInstall = (app: unknown, options?: unknown) => void;

export interface Plugin {
  name: string;
  install: PluginInstall;
}

export * from "./TaskbarPlugin";
