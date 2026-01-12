import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'WindowHost',
  setup(_, { slots }) {
    return () => h('div', { class: 'vd-window-host' }, slots.default && slots.default())
  }
})
