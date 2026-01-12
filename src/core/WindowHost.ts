import { defineComponent, h, computed } from "vue";
import { useDesktop } from "./DesktopInstance";
import WindowShell from "./WindowShell";
import type { Bounds } from "./types";

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
              bounds: desktop.getBounds(win.id!) ?? (win.initialBounds as Bounds),
              behaviors: win.behaviors,
              constraints: win.constraints,
              zIndex: 100 + index,
              onClose: () => desktop.closeWindow(win.id!),
              onFocus: () => desktop.focusWindow(win.id!),
              onUpdateBounds: (bounds: Bounds) => desktop.updateBounds(win.id!, bounds)
            },
            () => h(win.component, win.props)
          )
        )
      );
  }
});
