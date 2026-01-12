export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface WindowDefinition<Props = any> {
  id?: string
  type: string
  title: string
  component: any
  props?: Props
}

export class DesktopInstance {
  // minimal state placeholder
  windows: WindowDefinition[] = []

  createWindow(def: WindowDefinition) {
    this.windows.push(def)
    return def
  }
}

export const createDesktop = () => new DesktopInstance()
