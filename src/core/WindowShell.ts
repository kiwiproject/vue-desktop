import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'WindowShell',
  props: {
    title: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => h('div', { class: 'vd-window-shell' }, [
      h('header', { class: 'vd-window-header' }, props.title),
      h('div', { class: 'vd-window-body' }, slots.default && slots.default())
    ])
  }
})
