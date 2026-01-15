import { shallowRef, triggerRef, h } from 'vue'
import type { Plugin } from '../../core/types'
import type { DesktopInstance } from '../../core/DesktopInstance'
import type {
  ContextMenuItem,
  ContextMenuAPI,
  ContextMenuPluginOptions,
  MenuItemsOrBuilder,
  MenuContext,
  DesktopInstanceWithContextMenu
} from './types'
import ContextMenu from './ContextMenu'

export type {
  ContextMenuItem,
  ContextMenuAPI,
  ContextMenuPluginOptions,
  MenuItemsOrBuilder,
  MenuContext,
  DesktopInstanceWithContextMenu
} from './types'

export { default as ContextMenu } from './ContextMenu'

/** Build default desktop menu items */
function buildDefaultDesktopMenu(desktop: DesktopInstance): ContextMenuItem[] {
  const items: ContextMenuItem[] = []

  // Add apps submenu if StartMenu plugin is available
  const startMenu = (desktop as { startMenu?: { getApps(): Array<{ id: string; label: string; icon?: string; factory: () => unknown }> } }).startMenu
  if (startMenu) {
    const apps = startMenu.getApps()
    if (apps.length > 0) {
      items.push({
        id: 'new-window',
        label: 'New Window',
        icon: '\uD83D\uDCC4',
        children: apps.map(app => ({
          id: `app-${app.id}`,
          label: app.label,
          icon: app.icon,
          action: () => {
            const def = app.factory()
            if (def) desktop.createWindow(def as Parameters<typeof desktop.createWindow>[0])
          }
        }))
      })
    }
  }

  // Refresh
  items.push({
    id: 'refresh',
    label: 'Refresh',
    icon: '\uD83D\uDD04',
    shortcut: 'F5',
    action: () => {
      if (typeof location !== 'undefined') {
        location.reload()
      }
    },
    separator: items.length > 0
  })

  return items
}

/** Build default window menu items */
function buildDefaultWindowMenu(ctx: MenuContext): ContextMenuItem[] {
  const { desktop, windowId } = ctx
  if (!windowId) return []

  const mode = desktop.getMode(windowId)
  const win = desktop.getWindow(windowId)
  const behaviors = win?.behaviors

  const items: ContextMenuItem[] = []

  // Minimize
  if (behaviors?.minimizable !== false) {
    items.push({
      id: 'minimize',
      label: 'Minimize',
      icon: '\u2013',
      disabled: mode === 'minimized',
      action: () => desktop.minimizeWindow(windowId)
    })
  }

  // Maximize/Restore
  if (behaviors?.maximizable !== false) {
    items.push({
      id: 'maximize',
      label: mode === 'maximized' ? 'Restore' : 'Maximize',
      icon: mode === 'maximized' ? '\u29C9' : '\u25A1',
      action: () => {
        if (mode === 'maximized') {
          desktop.restoreWindow(windowId)
        } else {
          desktop.maximizeWindow(windowId)
        }
      }
    })
  }

  // Separator before close
  if (items.length > 0 && behaviors?.closable !== false) {
    items[items.length - 1].separator = true
  }

  // Close
  if (behaviors?.closable !== false) {
    items.push({
      id: 'close',
      label: 'Close',
      icon: '\u2715',
      shortcut: 'Ctrl+W',
      action: () => desktop.closeWindow(windowId)
    })
  }

  return items
}

/**
 * Create a context menu plugin with the given options.
 */
export function createContextMenuPlugin(options: ContextMenuPluginOptions = {}): Plugin {
  return {
    name: 'context-menu',
    install(desktop: DesktopInstance) {
      // Reactive state
      const isMenuOpen = shallowRef(false)
      const menuItems = shallowRef<ContextMenuItem[]>([])
      const menuPosition = shallowRef({ x: 0, y: 0 })

      // Menu definitions
      let desktopMenu: MenuItemsOrBuilder | undefined = options.desktopMenu
      let windowMenu: MenuItemsOrBuilder | undefined = options.windowMenu

      // Resolve menu items from definition
      const resolveItems = (def: MenuItemsOrBuilder | undefined, ctx: MenuContext): ContextMenuItem[] => {
        if (!def) {
          // Use defaults based on target
          if (ctx.target === 'desktop') {
            return buildDefaultDesktopMenu(desktop)
          } else if (ctx.target === 'window') {
            return buildDefaultWindowMenu(ctx)
          }
          return []
        }
        return typeof def === 'function' ? def(ctx) : def
      }

      // API implementation
      const api: ContextMenuAPI = {
        show(items: ContextMenuItem[], position: { x: number; y: number }): void {
          menuItems.value = items
          menuPosition.value = position
          isMenuOpen.value = true
          triggerRef(isMenuOpen)
          triggerRef(menuItems)
          triggerRef(menuPosition)
        },

        hide(): void {
          isMenuOpen.value = false
          triggerRef(isMenuOpen)
        },

        isOpen(): boolean {
          return isMenuOpen.value
        },

        setDesktopMenu(items: MenuItemsOrBuilder): void {
          desktopMenu = items
        },

        setWindowMenu(items: MenuItemsOrBuilder): void {
          windowMenu = items
        }
      }

      // Attach API to desktop
      ;(desktop as DesktopInstanceWithContextMenu).contextMenu = api

      // Handle desktop context menu
      const handleDesktopContextMenu = (payload: { x: number; y: number }) => {
        const position = payload
        const ctx: MenuContext = {
          target: 'desktop',
          position,
          desktop
        }
        const items = resolveItems(desktopMenu, ctx)
        if (items.length > 0) {
          api.show(items, position)
        }
      }

      // Handle window context menu
      const handleWindowContextMenu = (payload: { windowId: string; x: number; y: number }) => {
        const { windowId, x, y } = payload
        const ctx: MenuContext = {
          target: 'window',
          windowId,
          position: { x, y },
          desktop
        }
        const items = resolveItems(windowMenu, ctx)
        if (items.length > 0) {
          api.show(items, { x, y })
        }
      }

      // Listen for context menu events
      desktop.on('desktop:contextmenu', handleDesktopContextMenu)
      desktop.on('window:contextmenu', handleWindowContextMenu)

      // Register UI component
      const unregisterUI = desktop.registerUI({
        id: 'context-menu',
        slot: 'overlay',
        component: {
          name: 'ContextMenuWrapper',
          setup() {
            return () =>
              h(ContextMenu, {
                api,
                items: menuItems.value,
                position: menuPosition.value,
                visible: isMenuOpen.value
              })
          }
        },
        order: 100 // Above other overlays
      })

      // Cleanup
      return () => {
        desktop.off('desktop:contextmenu', handleDesktopContextMenu)
        desktop.off('window:contextmenu', handleWindowContextMenu)
        unregisterUI()
        delete (desktop as DesktopInstanceWithContextMenu).contextMenu
      }
    }
  }
}

/** Default context menu plugin (with default menus) */
export const ContextMenuPlugin = createContextMenuPlugin()
