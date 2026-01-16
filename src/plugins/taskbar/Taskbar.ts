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
      h("div", { class: "vd-taskbar", role: "toolbar", "aria-label": "Window taskbar" }, [
        h(
          "div",
          { class: "vd-taskbar-items", role: "group" },
          windows.value.map((win) => {
            const mode = desktop.getMode(win.id!);
            const isFocused = focusedId.value === win.id;
            const isMinimized = mode === "minimized";

            return h(
              "button",
              {
                key: win.id,
                class: [
                  "vd-taskbar-item",
                  isFocused && "vd-taskbar-item-focused",
                  isMinimized && "vd-taskbar-item-minimized"
                ],
                onClick: () => handleClick(win.id!),
                type: "button",
                title: win.title,
                "aria-pressed": isFocused,
                "aria-label": `${win.title}${isMinimized ? " (minimized)" : isFocused ? " (focused)" : ""}`
              },
              [
                win.icon
                  ? h("span", { class: "vd-taskbar-icon", "aria-hidden": true }, win.icon)
                  : h("span", { class: "vd-taskbar-icon vd-taskbar-icon-default", "aria-hidden": true }, "▢"),
                h("span", { class: "vd-taskbar-label" }, win.title)
              ]
            );
          })
        )
      ]);
  }
});
