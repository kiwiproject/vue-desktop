import { defineComponent, h, ref, onUnmounted, type PropType } from "vue";
import type { Bounds, WindowBehaviors, WindowConstraints, WindowMode, MenuBarDefinition } from "./types";
import { calcResize, type ResizeDirection } from "./bounds";
import MenuBar from "./MenuBar";

const RESIZE_DIRECTIONS: ResizeDirection[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

export default defineComponent({
  name: "WindowShell",
  props: {
    windowId: { type: String, required: true },
    title: { type: String, default: "" },
    bounds: { type: Object as PropType<Bounds>, required: true },
    behaviors: { type: Object as PropType<WindowBehaviors>, default: () => ({}) },
    constraints: { type: Object as PropType<WindowConstraints>, default: () => ({}) },
    mode: { type: String as PropType<WindowMode>, default: "normal" },
    zIndex: { type: Number, default: 100 },
    focused: { type: Boolean, default: false },
    menuBar: { type: Array as PropType<MenuBarDefinition>, default: undefined }
  },
  emits: ["close", "focus", "updateBounds", "minimize", "maximize", "restore", "contextmenu"],
  setup(props, { slots, emit }) {
    const isDragging = ref(false);
    const isResizing = ref(false);
    const dragStart = ref({ x: 0, y: 0, bounds: { x: 0, y: 0, width: 0, height: 0 } });
    const resizeDir = ref<ResizeDirection>("se");

    const movable = () => props.behaviors?.movable !== false && props.mode !== "maximized";
    const resizable = () => props.behaviors?.resizable !== false && props.mode !== "maximized";
    const closable = () => props.behaviors?.closable !== false;
    const minimizable = () => props.behaviors?.minimizable !== false;
    const maximizable = () => props.behaviors?.maximizable !== false;

    const handleWindowMouseDown = () => {
      emit("focus");
    };

    const handleClose = (e: Event) => {
      e.stopPropagation();
      emit("close");
    };

    const handleMinimize = (e: Event) => {
      e.stopPropagation();
      emit("minimize");
    };

    const handleMaximizeRestore = (e: Event) => {
      e.stopPropagation();
      if (props.mode === "maximized") {
        emit("restore");
      } else {
        emit("maximize");
      }
    };

    const handleHeaderDblClick = () => {
      if (!maximizable()) return;
      if (props.mode === "maximized") {
        emit("restore");
      } else {
        emit("maximize");
      }
    };

    const handleHeaderContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      emit("contextmenu", { x: e.clientX, y: e.clientY });
    };

    // Drag handling
    const startDrag = (e: PointerEvent) => {
      if (!movable()) return;
      e.preventDefault();
      isDragging.value = true;
      dragStart.value = {
        x: e.clientX,
        y: e.clientY,
        bounds: { ...props.bounds }
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onDragMove = (e: PointerEvent) => {
      if (!isDragging.value) return;
      const deltaX = e.clientX - dragStart.value.x;
      const deltaY = e.clientY - dragStart.value.y;
      emit("updateBounds", {
        ...props.bounds,
        x: dragStart.value.bounds.x + deltaX,
        y: dragStart.value.bounds.y + deltaY
      });
    };

    const onDragEnd = () => {
      isDragging.value = false;
    };

    // Resize handling
    const startResize = (direction: ResizeDirection, e: PointerEvent) => {
      if (!resizable()) return;
      e.preventDefault();
      e.stopPropagation();
      isResizing.value = true;
      resizeDir.value = direction;
      dragStart.value = {
        x: e.clientX,
        y: e.clientY,
        bounds: { ...props.bounds }
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onResizeMove = (e: PointerEvent) => {
      if (!isResizing.value) return;
      const deltaX = e.clientX - dragStart.value.x;
      const deltaY = e.clientY - dragStart.value.y;
      const newBounds = calcResize(
        resizeDir.value,
        dragStart.value.bounds,
        deltaX,
        deltaY,
        props.constraints
      );
      emit("updateBounds", newBounds);
    };

    const onResizeEnd = () => {
      isResizing.value = false;
    };

    // Global pointer handlers for drag/resize
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging.value) onDragMove(e);
      else if (isResizing.value) onResizeMove(e);
    };

    const onPointerUp = () => {
      if (isDragging.value) onDragEnd();
      if (isResizing.value) onResizeEnd();
    };

    // Render resize handles
    const renderResizeHandles = () => {
      if (!resizable()) return [];
      return RESIZE_DIRECTIONS.map((dir) =>
        h("div", {
          class: `vd-resize-handle vd-resize-${dir}`,
          "aria-hidden": true,
          onPointerdown: (e: PointerEvent) => startResize(dir, e),
          onPointermove: onPointerMove,
          onPointerup: onPointerUp
        })
      );
    };

    onUnmounted(() => {
      isDragging.value = false;
      isResizing.value = false;
    });

    return () =>
      h(
        "div",
        {
          class: [
            "vd-window-shell",
            isDragging.value && "vd-dragging",
            isResizing.value && "vd-resizing",
            props.mode === "maximized" && "vd-maximized",
            props.focused && "vd-focused"
          ],
          style: {
            position: "absolute",
            left: `${props.bounds.x}px`,
            top: `${props.bounds.y}px`,
            width: `${props.bounds.width}px`,
            height: `${props.bounds.height}px`,
            zIndex: props.zIndex
          },
          role: "dialog",
          "aria-labelledby": `vd-window-title-${props.windowId}`,
          "aria-modal": false,
          onMousedown: handleWindowMouseDown
        },
        [
          h(
            "header",
            {
              class: "vd-window-header",
              onPointerdown: startDrag,
              onPointermove: onPointerMove,
              onPointerup: onPointerUp,
              onDblclick: handleHeaderDblClick,
              onContextmenu: handleHeaderContextMenu
            },
            [
              h("span", { class: "vd-window-title", id: `vd-window-title-${props.windowId}` }, props.title),
              h("div", { class: "vd-window-controls" }, [
                minimizable() &&
                  h(
                    "button",
                    {
                      class: "vd-window-btn vd-window-minimize",
                      onClick: handleMinimize,
                      type: "button",
                      "aria-label": "Minimize window"
                    },
                    "\u2212"
                  ),
                maximizable() &&
                  h(
                    "button",
                    {
                      class: "vd-window-btn vd-window-maximize",
                      onClick: handleMaximizeRestore,
                      type: "button",
                      "aria-label": props.mode === "maximized" ? "Restore window" : "Maximize window"
                    },
                    props.mode === "maximized" ? "\u2752" : "\u25A1"
                  ),
                closable() &&
                  h(
                    "button",
                    {
                      class: "vd-window-btn vd-window-close",
                      onClick: handleClose,
                      type: "button",
                      "aria-label": "Close window"
                    },
                    "\u00D7"
                  )
              ])
            ]
          ),
          props.menuBar && props.menuBar.length > 0 && h(MenuBar, { menus: props.menuBar }),
          h(
            "div",
            {
              class: "vd-window-body",
              style: isDragging.value || isResizing.value ? { pointerEvents: "none" } : {}
            },
            slots.default && slots.default()
          ),
          ...renderResizeHandles()
        ]
      );
  }
});
