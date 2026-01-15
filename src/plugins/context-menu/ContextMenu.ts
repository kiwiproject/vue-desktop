import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  type PropType
} from 'vue'
import type { ContextMenuItem, ContextMenuAPI } from './types'

/** Calculate menu position to stay within viewport */
function calculatePosition(
  clickPos: { x: number; y: number },
  menuSize: { width: number; height: number }
): { x: number; y: number } {
  let x = clickPos.x
  let y = clickPos.y

  // Flip horizontally if too close to right edge
  if (x + menuSize.width > window.innerWidth) {
    x = Math.max(0, clickPos.x - menuSize.width)
  }

  // Flip vertically if too close to bottom
  if (y + menuSize.height > window.innerHeight) {
    y = Math.max(0, clickPos.y - menuSize.height)
  }

  return { x, y }
}

/** Calculate submenu position */
function calculateSubmenuPosition(
  parentRect: DOMRect,
  submenuSize: { width: number; height: number }
): { x: number; y: number; flipX: boolean } {
  let x = parentRect.right
  let y = parentRect.top
  let flipX = false

  // Flip horizontally if too close to right edge
  if (x + submenuSize.width > window.innerWidth) {
    x = parentRect.left - submenuSize.width
    flipX = true
  }

  // Adjust vertically if too close to bottom
  if (y + submenuSize.height > window.innerHeight) {
    y = Math.max(0, window.innerHeight - submenuSize.height)
  }

  return { x: Math.max(0, x), y: Math.max(0, y), flipX }
}

/** Recursive menu item component */
const ContextMenuItemComponent = defineComponent({
  name: 'ContextMenuItem',
  props: {
    item: {
      type: Object as PropType<ContextMenuItem>,
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
    onSubmenuOpen: {
      type: Function as PropType<(el: HTMLElement) => void>,
      default: undefined
    },
    onSubmenuClose: {
      type: Function as PropType<() => void>,
      default: undefined
    },
    showSubmenu: {
      type: Boolean,
      default: false
    },
    submenuPosition: {
      type: Object as PropType<{ x: number; y: number }>,
      default: () => ({ x: 0, y: 0 })
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
      type: Function as PropType<(item: ContextMenuItem) => void>,
      default: undefined
    }
  },
  setup(props) {
    const itemRef = ref<HTMLElement | null>(null)
    const submenuRef = ref<HTMLElement | null>(null)
    const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

    const hasChildren = computed(() =>
      props.item.children && props.item.children.length > 0
    )

    const handleMouseEnter = () => {
      props.onSelect()
      if (hasChildren.value && !props.item.disabled) {
        // Delay opening submenu
        hoverTimeout.value = setTimeout(() => {
          if (itemRef.value && props.onSubmenuOpen) {
            props.onSubmenuOpen(itemRef.value)
          }
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
          h('span', { class: 'vd-context-menu-item-icon' }, props.item.icon)
        )
      } else {
        children.push(h('span', { class: 'vd-context-menu-item-icon' }))
      }

      // Label
      children.push(
        h('span', { class: 'vd-context-menu-item-label' }, props.item.label)
      )

      // Shortcut hint
      if (props.item.shortcut) {
        children.push(
          h('span', { class: 'vd-context-menu-item-shortcut' }, props.item.shortcut)
        )
      }

      // Submenu arrow
      if (hasChildren.value) {
        children.push(
          h('span', { class: 'vd-context-menu-item-arrow' }, '\u25B6')
        )
      }

      const elements: ReturnType<typeof h>[] = [
        h(
          'div',
          {
            ref: itemRef,
            class: [
              'vd-context-menu-item',
              props.isSelected && 'vd-selected',
              props.item.disabled && 'vd-context-menu-item-disabled'
            ],
            onMouseenter: handleMouseEnter,
            onMouseleave: handleMouseLeave,
            onClick: handleClick
          },
          children
        )
      ]

      // Separator
      if (props.item.separator) {
        elements.push(h('div', { class: 'vd-context-menu-separator' }))
      }

      // Submenu
      if (hasChildren.value && props.showSubmenu && props.item.children) {
        const submenuItems = props.item.children.map((child, index) =>
          h(ContextMenuItemComponent, {
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
              ref: submenuRef,
              class: 'vd-context-menu vd-context-menu-submenu',
              style: {
                position: 'fixed',
                left: `${props.submenuPosition.x}px`,
                top: `${props.submenuPosition.y}px`
              }
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
  name: 'ContextMenuOverlay',
  props: {
    api: {
      type: Object as PropType<ContextMenuAPI>,
      required: true
    },
    items: {
      type: Array as PropType<ContextMenuItem[]>,
      default: () => []
    },
    position: {
      type: Object as PropType<{ x: number; y: number }>,
      default: () => ({ x: 0, y: 0 })
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const menuRef = ref<HTMLElement | null>(null)
    const selectedIndex = ref(-1)
    const openSubmenuIndex = ref(-1)
    const submenuPosition = ref({ x: 0, y: 0 })
    const selectedSubmenuIndex = ref(-1)
    const adjustedPosition = ref({ x: 0, y: 0 })

    // Reset state when menu opens/closes
    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          selectedIndex.value = -1
          openSubmenuIndex.value = -1
          selectedSubmenuIndex.value = -1
          // Calculate initial position after render
          nextTick(() => {
            if (menuRef.value) {
              const rect = menuRef.value.getBoundingClientRect()
              adjustedPosition.value = calculatePosition(props.position, {
                width: rect.width,
                height: rect.height
              })
            } else {
              adjustedPosition.value = { ...props.position }
            }
          })
        }
      },
      { immediate: true }
    )

    // Update position when props.position changes
    watch(
      () => props.position,
      (newPos) => {
        if (props.visible) {
          nextTick(() => {
            if (menuRef.value) {
              const rect = menuRef.value.getBoundingClientRect()
              adjustedPosition.value = calculatePosition(newPos, {
                width: rect.width,
                height: rect.height
              })
            } else {
              adjustedPosition.value = { ...newPos }
            }
          })
        }
      }
    )

    const handleKeydown = (e: KeyboardEvent) => {
      if (!props.visible) return

      const items = props.items
      const hasSubmenuOpen = openSubmenuIndex.value >= 0
      const currentItem = items[selectedIndex.value]
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
            selectedIndex.value = Math.min(selectedIndex.value + 1, items.length - 1)
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
            selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
            openSubmenuIndex.value = -1
            selectedSubmenuIndex.value = -1
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          e.stopPropagation()
          if (currentItem?.children && currentItem.children.length > 0 && !currentItem.disabled) {
            openSubmenuIndex.value = selectedIndex.value
            selectedSubmenuIndex.value = 0
          }
          break

        case 'ArrowLeft':
          e.preventDefault()
          e.stopPropagation()
          if (hasSubmenuOpen) {
            openSubmenuIndex.value = -1
            selectedSubmenuIndex.value = -1
          }
          break

        case 'Enter':
          e.preventDefault()
          e.stopPropagation()
          if (hasSubmenuOpen && submenuItems && selectedSubmenuIndex.value >= 0) {
            const submenuItem = submenuItems[selectedSubmenuIndex.value]
            if (submenuItem && !submenuItem.disabled && submenuItem.action) {
              submenuItem.action()
              props.api.hide()
            }
          } else if (currentItem && !currentItem.disabled) {
            if (currentItem.children && currentItem.children.length > 0) {
              openSubmenuIndex.value = selectedIndex.value
              selectedSubmenuIndex.value = 0
            } else if (currentItem.action) {
              currentItem.action()
              props.api.hide()
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
            props.api.hide()
          }
          break
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!props.visible) return
      const target = e.target as HTMLElement
      if (!target.closest('.vd-context-menu')) {
        props.api.hide()
      }
    }

    const handleSubmenuOpen = (index: number, itemEl: HTMLElement) => {
      const item = props.items[index]
      if (!item?.children) return

      openSubmenuIndex.value = index
      selectedSubmenuIndex.value = -1

      // Calculate submenu position
      nextTick(() => {
        const itemRect = itemEl.getBoundingClientRect()
        // Estimate submenu size (will be adjusted if needed)
        const estimatedSize = {
          width: 180,
          height: item.children!.length * 36 + 8
        }
        const pos = calculateSubmenuPosition(itemRect, estimatedSize)
        submenuPosition.value = { x: pos.x, y: pos.y }
      })
    }

    const handleItemAction = (item: ContextMenuItem) => {
      if (!item.disabled && item.action) {
        item.action()
        props.api.hide()
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
      if (!props.visible || props.items.length === 0) return null

      const menuItems = props.items.map((item, index) =>
        h(ContextMenuItemComponent, {
          key: item.id,
          item,
          isSelected: index === selectedIndex.value,
          onSelect: () => {
            selectedIndex.value = index
          },
          onAction: () => handleItemAction(item),
          onSubmenuOpen: (el: HTMLElement) => handleSubmenuOpen(index, el),
          onSubmenuClose: () => {
            openSubmenuIndex.value = -1
            selectedSubmenuIndex.value = -1
          },
          showSubmenu: index === openSubmenuIndex.value,
          submenuPosition: submenuPosition.value,
          selectedSubmenuIndex: selectedSubmenuIndex.value,
          onSubmenuSelect: (subIndex: number) => {
            selectedSubmenuIndex.value = subIndex
          },
          onSubmenuAction: (subItem: ContextMenuItem) => handleItemAction(subItem)
        })
      )

      return h(
        'div',
        {
          ref: menuRef,
          class: 'vd-context-menu',
          style: {
            position: 'fixed',
            left: `${adjustedPosition.value.x}px`,
            top: `${adjustedPosition.value.y}px`
          }
        },
        menuItems
      )
    }
  }
})
