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
        { class: "vd-switcher-overlay" },
        [
          h(
            "div",
            { class: "vd-switcher-container" },
            windows.value.map((win) =>
              h(
                "div",
                {
                  key: win.id,
                  class: [
                    "vd-switcher-tile",
                    selectedId.value === win.id && "vd-selected"
                  ],
                  onClick: () => {
                    desktop.closeSwitcher(true);
                  }
                },
                [
                  win.icon
                    ? h("div", { class: "vd-switcher-icon" }, win.icon)
                    : h("div", { class: "vd-switcher-icon vd-switcher-icon-default" }, "\u25A1"),
                  h("div", { class: "vd-switcher-title" }, win.title)
                ]
              )
            )
          )
        ]
      );
    };
  }
});
