import { defineComponent, h, computed, onMounted, onUnmounted, type PropType } from "vue";
import type { StartMenuAPI, StartMenuApp } from "./types";
import type { DesktopInstance } from "../../core/DesktopInstance";

export default defineComponent({
  name: "StartMenuPanel",
  props: {
    api: {
      type: Object as PropType<StartMenuAPI>,
      required: true
    },
    desktop: {
      type: Object as PropType<DesktopInstance>,
      required: true
    },
    buttonLabel: {
      type: String,
      default: "Start"
    },
    buttonIcon: {
      type: String,
      default: "☰"
    }
  },
  setup(props) {
    const isOpen = computed(() => props.api.isOpen());
    const appsByCategory = computed(() => props.api.getAppsByCategory());

    const handleToggle = () => {
      props.api.toggle();
    };

    const handleAppClick = (app: StartMenuApp) => {
      const windowDef = app.factory();
      props.desktop.createWindow(windowDef);
      props.api.close();
    };

    // Close on click outside
    const handleDocumentClick = (e: MouseEvent) => {
      if (!isOpen.value) return;

      const target = e.target as HTMLElement;
      // Check if click is inside the start menu or button
      if (target.closest(".vd-start-menu") || target.closest(".vd-start-button")) {
        return;
      }
      props.api.close();
    };

    // Close on Escape
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen.value) {
        props.api.close();
        e.stopPropagation();
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleDocumentClick);
      document.addEventListener("keydown", handleKeydown);
    });

    onUnmounted(() => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeydown);
    });

    return () => {
      const children: ReturnType<typeof h>[] = [];

      // Start button
      children.push(
        h(
          "button",
          {
            class: ["vd-start-button", isOpen.value && "vd-open"],
            onClick: handleToggle,
            type: "button",
            "aria-haspopup": "menu",
            "aria-expanded": isOpen.value,
            "aria-label": props.buttonLabel || "Start menu"
          },
          [
            h("span", { class: "vd-start-button-icon", "aria-hidden": true }, props.buttonIcon),
            props.buttonLabel && h("span", { class: "vd-start-button-label" }, props.buttonLabel)
          ]
        )
      );

      // Menu panel (only when open)
      if (isOpen.value) {
        const menuItems: ReturnType<typeof h>[] = [];

        // Group apps by category
        for (const [category, apps] of appsByCategory.value) {
          // Category header (if category exists)
          if (category) {
            menuItems.push(
              h("div", {
                class: "vd-start-menu-category",
                key: `cat-${category}`,
                role: "presentation",
                "aria-hidden": true
              }, category)
            );
          }

          // App items
          for (const app of apps) {
            menuItems.push(
              h(
                "button",
                {
                  class: "vd-start-menu-item",
                  key: app.id,
                  onClick: () => handleAppClick(app),
                  type: "button",
                  role: "menuitem"
                },
                [
                  app.icon && h("span", { class: "vd-start-menu-icon", "aria-hidden": true }, app.icon),
                  h("span", { class: "vd-start-menu-label" }, app.label),
                  app.shortcut && h("span", { class: "vd-start-menu-shortcut", "aria-hidden": true }, app.shortcut)
                ]
              )
            );
          }
        }

        children.push(
          h("div", { class: "vd-start-menu", role: "menu", "aria-label": "Applications" }, menuItems)
        );
      }

      return h("div", { class: "vd-start-menu-container" }, children);
    };
  }
});
