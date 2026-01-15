import type { DesktopInstance } from '../../core/DesktopInstance'

/** A single menu item */
export interface ContextMenuItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Optional icon (emoji or string) */
  icon?: string
  /** Optional keyboard shortcut hint (display only) */
  shortcut?: string
  /** Action when clicked (mutually exclusive with children) */
  action?: () => void
  /** Nested submenu items */
  children?: ContextMenuItem[]
  /** Whether item is disabled */
  disabled?: boolean
  /** Separator after this item */
  separator?: boolean
}

/** Context passed to dynamic menu builders */
export interface MenuContext {
  /** Where the menu was triggered */
  target: 'desktop' | 'window'
  /** Window ID if target is 'window' */
  windowId?: string
  /** Mouse position */
  position: { x: number; y: number }
  /** Desktop instance */
  desktop: DesktopInstance
}

/** Menu items or function returning menu items */
export type MenuItemsOrBuilder = ContextMenuItem[] | ((ctx: MenuContext) => ContextMenuItem[])

/** Plugin options */
export interface ContextMenuPluginOptions {
  /** Desktop background menu items */
  desktopMenu?: MenuItemsOrBuilder
  /** Window title bar menu items (right-click on header) */
  windowMenu?: MenuItemsOrBuilder
}

/** API exposed on desktop.contextMenu */
export interface ContextMenuAPI {
  /** Show menu at position */
  show(items: ContextMenuItem[], position: { x: number; y: number }): void
  /** Hide any open menu */
  hide(): void
  /** Check if menu is open */
  isOpen(): boolean
  /** Set desktop menu */
  setDesktopMenu(items: MenuItemsOrBuilder): void
  /** Set window menu */
  setWindowMenu(items: MenuItemsOrBuilder): void
}

/** Desktop instance with context menu API */
export interface DesktopInstanceWithContextMenu extends DesktopInstance {
  contextMenu: ContextMenuAPI
}
