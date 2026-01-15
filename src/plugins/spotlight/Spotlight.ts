import { defineComponent, h, ref, computed, watch, nextTick, onMounted, onUnmounted, type PropType } from "vue";
import type { SpotlightAPI, SpotlightItem } from "./types";

export default defineComponent({
  name: "SpotlightOverlay",
  props: {
    api: {
      type: Object as PropType<SpotlightAPI>,
      required: true
    },
    placeholder: {
      type: String,
      default: "Search..."
    },
    maxResults: {
      type: Number,
      default: 10
    }
  },
  setup(props) {
    const query = ref("");
    const selectedIndex = ref(0);
    const inputRef = ref<HTMLInputElement | null>(null);

    const isOpen = computed(() => props.api.isOpen());

    const results = computed(() => {
      if (!isOpen.value) return [];
      return props.api.search(query.value).slice(0, props.maxResults);
    });

    // Group results by category
    const groupedResults = computed(() => {
      const groups = new Map<string, SpotlightItem[]>();
      for (const item of results.value) {
        const existing = groups.get(item.category) ?? [];
        groups.set(item.category, [...existing, item]);
      }
      return groups;
    });

    // Flat list for keyboard navigation
    const flatResults = computed(() => results.value);

    // Reset state when opening
    watch(isOpen, (open) => {
      if (open) {
        query.value = "";
        selectedIndex.value = 0;
        nextTick(() => {
          inputRef.value?.focus();
        });
      }
    });

    // Reset selection when results change
    watch(results, () => {
      selectedIndex.value = 0;
    });

    const handleKeydown = (e: KeyboardEvent) => {
      if (!isOpen.value) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          selectedIndex.value = Math.min(
            selectedIndex.value + 1,
            flatResults.value.length - 1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
          break;
        case "Enter":
          e.preventDefault();
          if (flatResults.value[selectedIndex.value]) {
            flatResults.value[selectedIndex.value].action();
            props.api.close();
          }
          break;
        case "Escape":
          e.preventDefault();
          props.api.close();
          break;
      }
    };

    const handleItemClick = (item: SpotlightItem) => {
      item.action();
      props.api.close();
    };

    const handleOverlayClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains("vd-spotlight-overlay")) {
        props.api.close();
      }
    };

    onMounted(() => {
      document.addEventListener("keydown", handleKeydown);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeydown);
    });

    return () => {
      if (!isOpen.value) return null;

      let itemIndex = 0;
      const resultElements: ReturnType<typeof h>[] = [];

      for (const [category, items] of groupedResults.value) {
        // Category header
        resultElements.push(
          h("div", { class: "vd-spotlight-category", key: `cat-${category}` }, category)
        );

        // Items in category
        for (const item of items) {
          const currentIndex = itemIndex++;
          const isSelected = currentIndex === selectedIndex.value;

          resultElements.push(
            h(
              "div",
              {
                class: ["vd-spotlight-item", isSelected && "vd-selected"],
                key: item.id,
                onClick: () => handleItemClick(item),
                onMouseenter: () => {
                  selectedIndex.value = currentIndex;
                }
              },
              [
                item.icon && h("span", { class: "vd-spotlight-icon" }, item.icon),
                h("div", { class: "vd-spotlight-item-content" }, [
                  h("div", { class: "vd-spotlight-item-label" }, item.label),
                  item.description &&
                    h("div", { class: "vd-spotlight-item-description" }, item.description)
                ])
              ]
            )
          );
        }
      }

      return h(
        "div",
        {
          class: "vd-spotlight-overlay",
          onClick: handleOverlayClick
        },
        [
          h("div", { class: "vd-spotlight-container" }, [
            h("input", {
              ref: inputRef,
              class: "vd-spotlight-input",
              type: "text",
              placeholder: props.placeholder,
              value: query.value,
              onInput: (e: Event) => {
                query.value = (e.target as HTMLInputElement).value;
              }
            }),
            results.value.length > 0 &&
              h("div", { class: "vd-spotlight-results" }, resultElements),
            results.value.length === 0 &&
              query.value.length > 0 &&
              h("div", { class: "vd-spotlight-empty" }, "No results found")
          ])
        ]
      );
    };
  }
});
