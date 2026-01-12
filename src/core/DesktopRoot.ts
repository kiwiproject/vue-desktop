import { App } from 'vue'

export interface DesktopRootOptions {
  // future options such as theme, initial plugins
}

export const install = (app: App, options?: DesktopRootOptions) => {
  // plugin installer for Vue apps
}

export default {
  install
}
