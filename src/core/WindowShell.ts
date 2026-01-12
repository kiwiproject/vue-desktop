import { defineComponent, h, ref, onUnmounted, type PropType } from "vue";
import type { Bounds, WindowBehaviors, WindowConstraints } from "./types";
import { calcResize, type ResizeDirection } from "./bounds";

const RESIZE_DIRECTIONS: ResizeDirection[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

export default defineComponent({
  name: "WindowShell",
  props: {
    windowId: { type: String, required: true },
    title: { type: String, default: "" },
    bounds: { type: Object as PropType<Bounds>, required: true },
    behaviors: { type: Object as PropType<WindowBehaviors>, default: () => ({}) },
    constraints: { type: Object as PropType<WindowConstraints>, default: () => ({}) },
    zIndex: { type: Number, default: 100 }
  },
  emits: ["close", "focus", "updateBounds"],
  setup(props, { slots, emit }) {
    const isDragging = ref(false);
    const isResizing = ref(false);
    const dragStart = ref({ x: 0, y: 0, bounds: { x: 0, y: 0, width: 0, height: 0 } });
    const resizeDir = ref<ResizeDirection>("se");

    const movable = () => props.behaviors?.movable !== false;
    const resizable = () => props.behaviors?.resizable !== false;
    const closable = () => props.behaviors?.closable !== false;

    const handleWindowMouseDown = () => {
      emit("focus");
    };

    const handleClose = (e: Event) => {
      e.stopPropagation();
      emit("close");
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
            isResizing.value && "vd-resizing"
          ],
          style: {
            position: "absolute",
            left: `${props.bounds.x}px`,
            top: `${props.bounds.y}px`,
            width: `${props.bounds.width}px`,
            height: `${props.bounds.height}px`,
            zIndex: props.zIndex
          },
          onMousedown: handleWindowMouseDown
        },
        [
          h(
            "header",
            {
              class: "vd-window-header",
              onPointerdown: startDrag,
              onPointermove: onPointerMove,
              onPointerup: onPointerUp
            },
            [
              h("span", { class: "vd-window-title" }, props.title),
              h("div", { class: "vd-window-controls" }, [
                closable() &&
                  h(
                    "button",
                    {
                      class: "vd-window-close",
                      onClick: handleClose,
                      type: "button"
                    },
                    "\u00D7"
                  )
              ])
            ]
          ),
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
