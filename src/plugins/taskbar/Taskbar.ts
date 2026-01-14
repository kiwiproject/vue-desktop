import { defineComponent, h, computed } from "vue";
import { useDesktop } from "../../core/DesktopInstance";

export default defineComponent({
  name: "TaskbarPanel",
  setup() {
    const desktop = useDesktop();

    const windows = computed(() => desktop.windows);
    const focusedId = computed(() => desktop.getFocusedWindowId());

    const handleClick = (id: string) => {
      const mode = desktop.getMode(id);
      const isFocused = focusedId.value === id;

      if (mode === "minimized") {
        // Minimized: restore and focus
        desktop.restoreWindow(id);
        desktop.focusWindow(id);
      } else if (isFocused) {
        // Focused: minimize
        desktop.minimizeWindow(id);
      } else {
        // Not focused: focus
        desktop.focusWindow(id);
      }
    };

    return () =>
      h("div", { class: "vd-taskbar" }, [
        h(
          "div",
          { class: "vd-taskbar-items" },
          windows.value.map((win) => {
            const mode = desktop.getMode(win.id!);
            const isFocused = focusedId.value === win.id;

            return h(
              "button",
              {
                key: win.id,
                class: [
                  "vd-taskbar-item",
                  isFocused && "vd-taskbar-item-focused",
                  mode === "minimized" && "vd-taskbar-item-minimized"
                ],
                onClick: () => handleClick(win.id!),
                type: "button",
                title: win.title
              },
              [
                win.icon
                  ? h("span", { class: "vd-taskbar-icon" }, win.icon)
                  : h("span", { class: "vd-taskbar-icon vd-taskbar-icon-default" }, "▢"),
                h("span", { class: "vd-taskbar-label" }, win.title)
              ]
            );
          })
        )
      ]);
  }
});
