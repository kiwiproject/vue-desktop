import { defineComponent, h, ref, onMounted, onUnmounted } from "vue";

/**
 * ClockOverlay - A simple Vue component that displays the current time.
 *
 * This component demonstrates:
 * - Using Vue's Composition API with render functions
 * - Reactive state management with `ref()`
 * - Lifecycle hooks for setup/cleanup
 */
export default defineComponent({
  name: "ClockOverlay",
  setup() {
    const time = ref(new Date().toLocaleTimeString());
    let intervalId: ReturnType<typeof setInterval>;

    onMounted(() => {
      // Update time every second
      intervalId = setInterval(() => {
        time.value = new Date().toLocaleTimeString();
      }, 1000);
    });

    onUnmounted(() => {
      // Clean up interval when component is destroyed
      clearInterval(intervalId);
    });

    return () =>
      h(
        "div",
        {
          class: "clock-overlay",
          style: {
            position: "fixed",
            bottom: "48px", // Above taskbar
            right: "12px",
            padding: "8px 16px",
            background: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "14px",
            zIndex: 9999,
            pointerEvents: "none"
          }
        },
        time.value
      );
  }
});
