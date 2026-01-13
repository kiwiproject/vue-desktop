import { defineComponent, h, computed, ref, onMounted, onUnmounted, type PropType } from "vue";
import { useDesktop } from "./DesktopInstance";
import WindowShell from "./WindowShell";
import type { Bounds } from "./types";

export interface KeyboardShortcuts {
  escape?: boolean;
  altF4?: boolean;
  altTab?: boolean;
}

export default defineComponent({
  name: "WindowHost",
  props: {
    shortcuts: {
      type: Object as PropType<KeyboardShortcuts>,
      default: () => ({ escape: true, altF4: true, altTab: true })
    }
  },
  setup(props) {
    const desktop = useDesktop();
    const hostRef = ref<HTMLElement | null>(null);
    const viewport = ref<Bounds>({ x: 0, y: 0, width: 800, height: 600 });

    const updateViewport = () => {
      if (hostRef.value) {
        viewport.value = {
          x: 0,
          y: 0,
          width: hostRef.value.clientWidth,
          height: hostRef.value.clientHeight
        };
      }
    };

    onMounted(() => {
      updateViewport();
      window.addEventListener("resize", updateViewport);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateViewport);
    });

    const sortedWindows = computed(() => {
      const zOrder = desktop.zOrder;
      return [...desktop.windows].sort((a, b) => {
        const aIdx = zOrder.indexOf(a.id!);
        const bIdx = zOrder.indexOf(b.id!);
        return aIdx - bIdx;
      });
    });

    const visibleWindows = computed(() => {
      return sortedWindows.value.filter((win) => desktop.getMode(win.id!) !== "minimized");
    });

    const getBoundsForWindow = (winId: string): Bounds => {
      const mode = desktop.getMode(winId);
      if (mode === "maximized") {
        return viewport.value;
      }
      const win = desktop.getWindow(winId);
      return desktop.getBounds(winId) ?? (win?.initialBounds as Bounds);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const focusedId = desktop.getFocusedWindowId();

      // Escape - close focused window
      if (props.shortcuts.escape && e.key === "Escape" && focusedId) {
        const win = desktop.getWindow(focusedId);
        if (win?.behaviors?.closable !== false) {
          desktop.closeWindow(focusedId);
          e.preventDefault();
        }
        return;
      }

      // Alt+F4 - close focused window
      if (props.shortcuts.altF4 && e.key === "F4" && e.altKey && focusedId) {
        const win = desktop.getWindow(focusedId);
        if (win?.behaviors?.closable !== false) {
          desktop.closeWindow(focusedId);
          e.preventDefault();
        }
        return;
      }

      // Alt+Tab / Alt+Shift+Tab - cycle focus
      if (props.shortcuts.altTab && e.key === "Tab" && e.altKey) {
        desktop.cycleFocus(e.shiftKey);
        e.preventDefault();
        return;
      }
    };

    return () =>
      h(
        "div",
        {
          class: "vd-window-host",
          tabindex: -1,
          onKeydown: handleKeydown,
          ref: (el: unknown) => {
            hostRef.value = el as HTMLElement;
            if (el) updateViewport();
          }
        },
        visibleWindows.value.map((win, index) =>
          h(
            WindowShell,
            {
              key: win.id,
              windowId: win.id!,
              title: win.title,
              bounds: getBoundsForWindow(win.id!),
              behaviors: win.behaviors,
              constraints: win.constraints,
              mode: desktop.getMode(win.id!),
              zIndex: 100 + index,
              onClose: () => desktop.closeWindow(win.id!),
              onFocus: () => desktop.focusWindow(win.id!),
              onUpdateBounds: (bounds: Bounds) => desktop.updateBounds(win.id!, bounds),
              onMinimize: () => desktop.minimizeWindow(win.id!),
              onMaximize: () => desktop.maximizeWindow(win.id!),
              onRestore: () => desktop.restoreWindow(win.id!)
            },
            () => h(win.component, win.props)
          )
        )
      );
  }
});
