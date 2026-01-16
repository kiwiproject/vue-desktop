import { defineComponent, h, computed } from "vue";
import { useDesktop } from "./DesktopInstance";

export default defineComponent({
  name: "WindowSwitcher",
  setup() {
    const desktop = useDesktop();

    const isActive = computed(() => desktop.switcherActive);
    const selectedId = computed(() => desktop.switcherSelectedId);
    const windows = computed(() => desktop.getSwitcherWindows());

    return () => {
      if (!isActive.value) return null;

      return h(
        "div",
        {
          class: "vd-switcher-overlay",
          role: "dialog",
          "aria-modal": true,
          "aria-label": "Window switcher"
        },
        [
          h(
            "div",
            {
              class: "vd-switcher-container",
              role: "listbox",
              "aria-label": "Open windows"
            },
            windows.value.map((win) => {
              const isSelected = selectedId.value === win.id;
              return h(
                "div",
                {
                  key: win.id,
                  class: [
                    "vd-switcher-tile",
                    isSelected && "vd-selected"
                  ],
                  role: "option",
                  "aria-selected": isSelected,
                  onClick: () => {
                    desktop.closeSwitcher(true);
                  }
                },
                [
                  win.icon
                    ? h("div", { class: "vd-switcher-icon", "aria-hidden": true }, win.icon)
                    : h("div", { class: "vd-switcher-icon vd-switcher-icon-default", "aria-hidden": true }, "\u25A1"),
                  h("div", { class: "vd-switcher-title" }, win.title)
                ]
              );
            })
          )
        ]
      );
    };
  }
});
