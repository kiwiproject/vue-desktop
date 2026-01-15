import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createDesktop } from '../src/core/DesktopInstance'
import {
  createContextMenuPlugin,
  ContextMenuPlugin,
  type DesktopInstanceWithContextMenu,
  type ContextMenuItem
} from '../src/plugins/context-menu'
import {
  createStartMenuPlugin,
  type DesktopInstanceWithStartMenu
} from '../src/plugins/start-menu'

describe('ContextMenuPlugin', () => {
  describe('installation', () => {
    it('installs successfully', () => {
      const d = createDesktop()
      const plugin = createContextMenuPlugin()

      const result = d.installPlugin(plugin)

      expect(result).toBe(true)
      expect(d.hasPlugin('context-menu')).toBe(true)
    })

    it('attaches contextMenu API to desktop', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())

      expect(d.contextMenu).toBeDefined()
      expect(typeof d.contextMenu?.show).toBe('function')
      expect(typeof d.contextMenu?.hide).toBe('function')
      expect(typeof d.contextMenu?.isOpen).toBe('function')
      expect(typeof d.contextMenu?.setDesktopMenu).toBe('function')
      expect(typeof d.contextMenu?.setWindowMenu).toBe('function')
    })

    it('installs default plugin instance', () => {
      const d = createDesktop()
      const result = d.installPlugin(ContextMenuPlugin)

      expect(result).toBe(true)
      expect(d.hasPlugin('context-menu')).toBe(true)
    })
  })

  describe('uninstallation', () => {
    it('uninstalls successfully', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())

      const result = d.uninstallPlugin('context-menu')

      expect(result).toBe(true)
      expect(d.hasPlugin('context-menu')).toBe(false)
    })

    it('removes contextMenu API on uninstall', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())

      d.uninstallPlugin('context-menu')

      expect(d.contextMenu).toBeUndefined()
    })
  })

  describe('menu state', () => {
    let d: DesktopInstanceWithContextMenu

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())
    })

    it('starts closed', () => {
      expect(d.contextMenu?.isOpen()).toBe(false)
    })

    it('opens menu with show()', () => {
      const items: ContextMenuItem[] = [
        { id: 'item1', label: 'Item 1', action: () => {} }
      ]

      d.contextMenu?.show(items, { x: 100, y: 100 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('closes menu with hide()', () => {
      const items: ContextMenuItem[] = [
        { id: 'item1', label: 'Item 1', action: () => {} }
      ]

      d.contextMenu?.show(items, { x: 100, y: 100 })
      d.contextMenu?.hide()

      expect(d.contextMenu?.isOpen()).toBe(false)
    })
  })

  describe('menu items', () => {
    let d: DesktopInstanceWithContextMenu

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())
    })

    it('accepts menu items with all properties', () => {
      const action = vi.fn()
      const items: ContextMenuItem[] = [
        {
          id: 'item1',
          label: 'Item 1',
          icon: '📄',
          shortcut: 'Ctrl+N',
          action,
          disabled: false,
          separator: true
        }
      ]

      d.contextMenu?.show(items, { x: 0, y: 0 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('accepts nested menu items', () => {
      const items: ContextMenuItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          children: [
            { id: 'child1', label: 'Child 1', action: () => {} },
            { id: 'child2', label: 'Child 2', action: () => {} }
          ]
        }
      ]

      d.contextMenu?.show(items, { x: 0, y: 0 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })
  })

  describe('custom menus via options', () => {
    it('accepts static desktop menu items', () => {
      const action = vi.fn()
      const d = createDesktop() as DesktopInstanceWithContextMenu

      d.installPlugin(createContextMenuPlugin({
        desktopMenu: [
          { id: 'custom', label: 'Custom Item', action }
        ]
      }))

      // Emit desktop contextmenu event
      d.emit('desktop:contextmenu', { x: 100, y: 100 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('accepts function for desktop menu', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu

      d.installPlugin(createContextMenuPlugin({
        desktopMenu: (ctx) => [
          { id: 'pos', label: `Position: ${ctx.position.x},${ctx.position.y}`, action: () => {} }
        ]
      }))

      d.emit('desktop:contextmenu', { x: 50, y: 75 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('accepts static window menu items', () => {
      const action = vi.fn()
      const d = createDesktop() as DesktopInstanceWithContextMenu

      d.installPlugin(createContextMenuPlugin({
        windowMenu: [
          { id: 'custom', label: 'Custom Window Item', action }
        ]
      }))

      // Create a window first
      const win = d.createWindow({
        type: 'test',
        title: 'Test Window',
        component: {} as never
      })

      // Emit window contextmenu event
      d.emit('window:contextmenu', { windowId: win.id!, x: 100, y: 100 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('accepts function for window menu', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu

      d.installPlugin(createContextMenuPlugin({
        windowMenu: (ctx) => [
          { id: 'win', label: `Window: ${ctx.windowId}`, action: () => {} }
        ]
      }))

      const win = d.createWindow({
        type: 'test',
        title: 'Test Window',
        component: {} as never
      })

      d.emit('window:contextmenu', { windowId: win.id!, x: 100, y: 100 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })
  })

  describe('setDesktopMenu/setWindowMenu API', () => {
    let d: DesktopInstanceWithContextMenu

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())
    })

    it('setDesktopMenu updates desktop menu', () => {
      const action = vi.fn()
      d.contextMenu?.setDesktopMenu([
        { id: 'new-item', label: 'New Item', action }
      ])

      d.emit('desktop:contextmenu', { x: 0, y: 0 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('setWindowMenu updates window menu', () => {
      const action = vi.fn()
      d.contextMenu?.setWindowMenu([
        { id: 'new-item', label: 'New Item', action }
      ])

      const win = d.createWindow({
        type: 'test',
        title: 'Test',
        component: {} as never
      })

      d.emit('window:contextmenu', { windowId: win.id!, x: 0, y: 0 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })
  })

  describe('default menus', () => {
    it('provides default desktop menu with Refresh', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())

      d.emit('desktop:contextmenu', { x: 100, y: 100 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('provides default window menu with window controls', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())

      const win = d.createWindow({
        type: 'test',
        title: 'Test Window',
        component: {} as never
      })

      d.emit('window:contextmenu', { windowId: win.id!, x: 100, y: 100 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('integrates with StartMenu plugin for apps submenu', () => {
      const d = createDesktop() as DesktopInstanceWithContextMenu & DesktopInstanceWithStartMenu

      d.installPlugin(createStartMenuPlugin({
        apps: [
          {
            id: 'app1',
            label: 'Test App',
            factory: () => ({ type: 'test', title: 'Test', component: {} as never })
          }
        ]
      }))
      d.installPlugin(createContextMenuPlugin())

      d.emit('desktop:contextmenu', { x: 100, y: 100 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })
  })

  describe('event handling', () => {
    let d: DesktopInstanceWithContextMenu

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithContextMenu
      d.installPlugin(createContextMenuPlugin())
    })

    it('responds to desktop:contextmenu event', () => {
      d.emit('desktop:contextmenu', { x: 100, y: 200 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('responds to window:contextmenu event', () => {
      const win = d.createWindow({
        type: 'test',
        title: 'Test',
        component: {} as never
      })

      d.emit('window:contextmenu', { windowId: win.id!, x: 100, y: 200 })

      expect(d.contextMenu?.isOpen()).toBe(true)
    })

    it('closes menu when showing new menu', () => {
      d.contextMenu?.show([{ id: '1', label: 'First', action: () => {} }], { x: 0, y: 0 })
      expect(d.contextMenu?.isOpen()).toBe(true)

      d.contextMenu?.show([{ id: '2', label: 'Second', action: () => {} }], { x: 50, y: 50 })
      expect(d.contextMenu?.isOpen()).toBe(true)
    })
  })

  describe('window menu context', () => {
    let d: DesktopInstanceWithContextMenu

    beforeEach(() => {
      d = createDesktop() as DesktopInstanceWithContextMenu
    })

    it('provides window mode in context for menu builder', () => {
      let capturedMode: string | undefined

      d.installPlugin(createContextMenuPlugin({
        windowMenu: (ctx) => {
          capturedMode = ctx.desktop.getMode(ctx.windowId!)
          return [{ id: 'test', label: 'Test', action: () => {} }]
        }
      }))

      const win = d.createWindow({
        type: 'test',
        title: 'Test',
        component: {} as never
      })
      d.maximizeWindow(win.id!)

      d.emit('window:contextmenu', { windowId: win.id!, x: 100, y: 100 })

      expect(capturedMode).toBe('maximized')
    })

    it('respects window behaviors for default menu', () => {
      d.installPlugin(createContextMenuPlugin())

      const win = d.createWindow({
        type: 'test',
        title: 'Test',
        component: {} as never,
        behaviors: {
          closable: false,
          minimizable: false,
          maximizable: false
        }
      })

      // Menu should not open when no items are available
      d.emit('window:contextmenu', { windowId: win.id!, x: 100, y: 100 })

      // Default menu has no items when all behaviors are disabled
      expect(d.contextMenu?.isOpen()).toBe(false)
    })

    it('shows menu with partial behaviors enabled', () => {
      d.installPlugin(createContextMenuPlugin())

      const win = d.createWindow({
        type: 'test',
        title: 'Test',
        component: {} as never,
        behaviors: {
          closable: true,  // Only close enabled
          minimizable: false,
          maximizable: false
        }
      })

      d.emit('window:contextmenu', { windowId: win.id!, x: 100, y: 100 })

      // Menu should open with at least the close item
      expect(d.contextMenu?.isOpen()).toBe(true)
    })
  })
})
