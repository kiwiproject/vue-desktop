import {
  defineComponent,
  h,
  ref,
  computed,
  onMounted,
  onUnmounted,
  type PropType
} from 'vue'
import type { MenuBarItem, MenuBarDefinition } from './types'

/** Resolve menu items (handle static array or function) */
function resolveItems(items: MenuBarItem[] | (() => MenuBarItem[])): MenuBarItem[] {
  return typeof items === 'function' ? items() : items
}

/** Dropdown menu item component */
const MenuDropdownItem = defineComponent({
  name: 'MenuDropdownItem',
  props: {
    item: {
      type: Object as PropType<MenuBarItem>,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    onSelect: {
      type: Function as PropType<() => void>,
      required: true
    },
    onAction: {
      type: Function as PropType<() => void>,
      required: true
    },
    showSubmenu: {
      type: Boolean,
      default: false
    },
    onSubmenuOpen: {
      type: Function as PropType<() => void>,
      default: undefined
    },
    selectedSubmenuIndex: {
      type: Number,
      default: -1
    },
    onSubmenuSelect: {
      type: Function as PropType<(index: number) => void>,
      default: undefined
    },
    onSubmenuAction: {
      type: Function as PropType<(item: MenuBarItem) => void>,
      default: undefined
    }
  },
  setup(props) {
    const itemRef = ref<HTMLElement | null>(null)
    const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

    const hasChildren = computed(() =>
      props.item.children && props.item.children.length > 0
    )

    const handleMouseEnter = () => {
      props.onSelect()
      if (hasChildren.value && !props.item.disabled) {
        hoverTimeout.value = setTimeout(() => {
          props.onSubmenuOpen?.()
        }, 150)
      }
    }

    const handleMouseLeave = () => {
      if (hoverTimeout.value) {
        clearTimeout(hoverTimeout.value)
        hoverTimeout.value = null
      }
    }

    const handleClick = () => {
      if (props.item.disabled) return
      if (!hasChildren.value && props.item.action) {
        props.onAction()
      }
    }

    onUnmounted(() => {
      if (hoverTimeout.value) {
        clearTimeout(hoverTimeout.value)
      }
    })

    return () => {
      const children: ReturnType<typeof h>[] = []

      // Icon
      if (props.item.icon) {
        children.push(
          h('span', { class: 'vd-menu-dropdown-icon' }, props.item.icon)
        )
      }

      // Label
      children.push(
        h('span', { class: 'vd-menu-dropdown-label' }, props.item.label)
      )

      // Shortcut hint
      if (props.item.shortcut) {
        children.push(
          h('span', { class: 'vd-menu-dropdown-shortcut' }, props.item.shortcut)
        )
      }

      // Submenu arrow
      if (hasChildren.value) {
        children.push(
          h('span', { class: 'vd-menu-dropdown-arrow' }, '\u25B6')
        )
      }

      const elements: ReturnType<typeof h>[] = [
        h(
          'div',
          {
            ref: itemRef,
            class: [
              'vd-menu-dropdown-item',
              props.isSelected && 'vd-selected',
              props.item.disabled && 'vd-menu-dropdown-item-disabled'
            ],
            role: 'menuitem',
            'aria-disabled': props.item.disabled || undefined,
            'aria-haspopup': hasChildren.value ? 'menu' : undefined,
            'aria-expanded': hasChildren.value && props.showSubmenu ? true : undefined,
            tabindex: -1,
            onMouseenter: handleMouseEnter,
            onMouseleave: handleMouseLeave,
            onClick: handleClick
          },
          children
        )
      ]

      // Separator
      if (props.item.separator) {
        elements.push(h('div', { class: 'vd-menu-dropdown-separator' }))
      }

      // Submenu
      if (hasChildren.value && props.showSubmenu && props.item.children) {
        const submenuItems = props.item.children.map((child, index) =>
          h(MenuDropdownItem, {
            key: child.id,
            item: child,
            isSelected: index === props.selectedSubmenuIndex,
            onSelect: () => props.onSubmenuSelect?.(index),
            onAction: () => props.onSubmenuAction?.(child)
          })
        )

        elements.push(
          h(
            'div',
            {
              class: 'vd-menu-dropdown vd-menu-dropdown-submenu',
              role: 'menu',
              'aria-label': props.item.label
            },
            submenuItems
          )
        )
      }

      return elements
    }
  }
})

export default defineComponent({
  name: 'MenuBar',
  props: {
    menus: {
      type: Array as PropType<MenuBarDefinition>,
      required: true
    }
  },
  setup(props) {
    const openMenuIndex = ref(-1)
    const selectedItemIndex = ref(-1)
    const openSubmenuIndex = ref(-1)
    const selectedSubmenuIndex = ref(-1)

    const currentMenuItems = computed(() => {
      if (openMenuIndex.value < 0) return []
      const menu = props.menus[openMenuIndex.value]
      return menu ? resolveItems(menu.items) : []
    })

    const handleMenuClick = (index: number) => {
      if (openMenuIndex.value === index) {
        // Close if clicking same menu
        closeMenu()
      } else {
        openMenuIndex.value = index
        selectedItemIndex.value = -1
        openSubmenuIndex.value = -1
        selectedSubmenuIndex.value = -1
      }
    }

    const handleMenuMouseEnter = (index: number) => {
      // If a menu is already open, switch to hovered menu
      if (openMenuIndex.value >= 0 && openMenuIndex.value !== index) {
        openMenuIndex.value = index
        selectedItemIndex.value = -1
        openSubmenuIndex.value = -1
        selectedSubmenuIndex.value = -1
      }
    }

    const closeMenu = () => {
      openMenuIndex.value = -1
      selectedItemIndex.value = -1
      openSubmenuIndex.value = -1
      selectedSubmenuIndex.value = -1
    }

    const handleItemAction = (item: MenuBarItem) => {
      if (!item.disabled && item.action) {
        item.action()
        closeMenu()
      }
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (openMenuIndex.value < 0) return

      const items = currentMenuItems.value
      const hasSubmenuOpen = openSubmenuIndex.value >= 0
      const currentItem = items[selectedItemIndex.value]
      const submenuItems = currentItem?.children

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          e.stopPropagation()
          if (hasSubmenuOpen && submenuItems) {
            selectedSubmenuIndex.value = Math.min(
              selectedSubmenuIndex.value + 1,
              submenuItems.length - 1
            )
          } else {
            selectedItemIndex.value = Math.min(
              selectedItemIndex.value + 1,
              items.length - 1
            )
            openSubmenuIndex.value = -1
            selectedSubmenuIndex.value = -1
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          e.stopPropagation()
          if (hasSubmenuOpen && submenuItems) {
            selectedSubmenuIndex.value = Math.max(selectedSubmenuIndex.value - 1, 0)
          } else {
            selectedItemIndex.value = Math.max(selectedItemIndex.value - 1, 0)
            openSubmenuIndex.value = -1
            selectedSubmenuIndex.value = -1
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          e.stopPropagation()
          if (currentItem?.children && currentItem.children.length > 0 && !currentItem.disabled) {
            // Open submenu
            openSubmenuIndex.value = selectedItemIndex.value
            selectedSubmenuIndex.value = 0
          } else if (!hasSubmenuOpen) {
            // Move to next menu
            const nextIndex = (openMenuIndex.value + 1) % props.menus.length
            openMenuIndex.value = nextIndex
            selectedItemIndex.value = -1
          }
          break

        case 'ArrowLeft':
          e.preventDefault()
          e.stopPropagation()
          if (hasSubmenuOpen) {
            // Close submenu
            openSubmenuIndex.value = -1
            selectedSubmenuIndex.value = -1
          } else {
            // Move to previous menu
            const prevIndex = (openMenuIndex.value - 1 + props.menus.length) % props.menus.length
            openMenuIndex.value = prevIndex
            selectedItemIndex.value = -1
          }
          break

        case 'Enter':
          e.preventDefault()
          e.stopPropagation()
          if (hasSubmenuOpen && submenuItems && selectedSubmenuIndex.value >= 0) {
            const submenuItem = submenuItems[selectedSubmenuIndex.value]
            if (submenuItem) {
              handleItemAction(submenuItem)
            }
          } else if (currentItem) {
            if (currentItem.children && currentItem.children.length > 0 && !currentItem.disabled) {
              openSubmenuIndex.value = selectedItemIndex.value
              selectedSubmenuIndex.value = 0
            } else {
              handleItemAction(currentItem)
            }
          }
          break

        case 'Escape':
          e.preventDefault()
          e.stopPropagation()
          if (hasSubmenuOpen) {
            openSubmenuIndex.value = -1
            selectedSubmenuIndex.value = -1
          } else {
            closeMenu()
          }
          break
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuIndex.value < 0) return
      const target = e.target as HTMLElement
      if (!target.closest('.vd-menu-bar')) {
        closeMenu()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown, true)
      document.addEventListener('mousedown', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown, true)
      document.removeEventListener('mousedown', handleClickOutside)
    })

    return () => {
      if (!props.menus || props.menus.length === 0) return null

      const menuBarItems = props.menus.map((menu, index) => {
        const isOpen = openMenuIndex.value === index
        const items = isOpen ? currentMenuItems.value : []

        return h(
          'div',
          {
            key: menu.id,
            class: [
              'vd-menu-bar-item',
              isOpen && 'vd-menu-bar-item-active'
            ],
            role: 'menuitem',
            'aria-haspopup': 'menu',
            'aria-expanded': isOpen,
            tabindex: 0,
            onClick: () => handleMenuClick(index),
            onMouseenter: () => handleMenuMouseEnter(index)
          },
          [
            menu.label,
            isOpen && items.length > 0 && h(
              'div',
              { class: 'vd-menu-dropdown', role: 'menu', 'aria-label': menu.label },
              items.map((item, itemIndex) =>
                h(MenuDropdownItem, {
                  key: item.id,
                  item,
                  isSelected: itemIndex === selectedItemIndex.value,
                  onSelect: () => {
                    selectedItemIndex.value = itemIndex
                  },
                  onAction: () => handleItemAction(item),
                  showSubmenu: itemIndex === openSubmenuIndex.value,
                  onSubmenuOpen: () => {
                    openSubmenuIndex.value = itemIndex
                    selectedSubmenuIndex.value = -1
                  },
                  selectedSubmenuIndex: selectedSubmenuIndex.value,
                  onSubmenuSelect: (subIndex: number) => {
                    selectedSubmenuIndex.value = subIndex
                  },
                  onSubmenuAction: (subItem: MenuBarItem) => handleItemAction(subItem)
                })
              )
            )
          ]
        )
      })

      return h('div', { class: 'vd-menu-bar', role: 'menubar' }, menuBarItems)
    }
  }
})
