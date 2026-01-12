import { App } from "vue";

export interface DesktopRootOptions {
  [key: string]: unknown;
}

export const install = (_app: App, _options?: DesktopRootOptions) => {
  void _app;
  void _options;
  // plugin installer for Vue apps
};

export default {
  install
};
