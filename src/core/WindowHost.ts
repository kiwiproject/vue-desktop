import { defineComponent, h, computed } from "vue";
import { useDesktop } from "./DesktopInstance";
import WindowShell from "./WindowShell";

export default defineComponent({
  name: "WindowHost",
  setup() {
    const desktop = useDesktop();

    const sortedWindows = computed(() => {
      const zOrder = desktop.zOrder;
      return [...desktop.windows].sort((a, b) => {
        const aIdx = zOrder.indexOf(a.id!);
        const bIdx = zOrder.indexOf(b.id!);
        return aIdx - bIdx;
      });
    });

    return () =>
      h(
        "div",
        { class: "vd-window-host" },
        sortedWindows.value.map((win, index) =>
          h(
            WindowShell,
            {
              key: win.id,
              windowId: win.id!,
              title: win.title,
              bounds: win.initialBounds!,
              behaviors: win.behaviors,
              zIndex: 100 + index,
              onClose: () => desktop.closeWindow(win.id!),
              onFocus: () => desktop.focusWindow(win.id!)
            },
            () => h(win.component, win.props)
          )
        )
      );
  }
});
