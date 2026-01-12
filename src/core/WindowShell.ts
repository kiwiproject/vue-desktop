import { defineComponent, h, type PropType } from "vue";
import type { Bounds, WindowBehaviors } from "./types";

export default defineComponent({
  name: "WindowShell",
  props: {
    windowId: { type: String, required: true },
    title: { type: String, default: "" },
    bounds: { type: Object as PropType<Bounds>, required: true },
    behaviors: { type: Object as PropType<WindowBehaviors>, default: () => ({}) },
    zIndex: { type: Number, default: 100 }
  },
  emits: ["close", "focus"],
  setup(props, { slots, emit }) {
    const handleMouseDown = () => {
      emit("focus");
    };

    const handleClose = (e: Event) => {
      e.stopPropagation();
      emit("close");
    };

    const closable = props.behaviors?.closable !== false;

    return () =>
      h(
        "div",
        {
          class: "vd-window-shell",
          style: {
            position: "absolute",
            left: `${props.bounds.x}px`,
            top: `${props.bounds.y}px`,
            width: `${props.bounds.width}px`,
            height: `${props.bounds.height}px`,
            zIndex: props.zIndex
          },
          onMousedown: handleMouseDown
        },
        [
          h("header", { class: "vd-window-header" }, [
            h("span", { class: "vd-window-title" }, props.title),
            h("div", { class: "vd-window-controls" }, [
              closable &&
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
          ]),
          h("div", { class: "vd-window-body" }, slots.default && slots.default())
        ]
      );
  }
});
