import { defineComponent, h, computed } from "vue";
import { useDesktop } from "./DesktopInstance";

export default defineComponent({
  name: "UISlot",
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const desktop = useDesktop();

    const registrations = computed(() => desktop.getUIForSlot(props.name));

    return () =>
      registrations.value.map((reg) =>
        h(reg.component, { key: reg.id, ...reg.props })
      );
  }
});
