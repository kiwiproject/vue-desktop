export type PluginInstall = (app: any, options?: any) => void

export interface Plugin {
  name: string
  install: PluginInstall
}

export * from './TaskbarPlugin'
