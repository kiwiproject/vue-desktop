import { describe, it, expect } from "vitest";
import { defineComponent } from "vue";
import { createDesktop } from "../src/core/DesktopInstance";
import type { UIRegistration } from "../src/core/types";

const DummyComponent = defineComponent({ template: "<div>Test</div>" });

describe("UI Registry", () => {
  describe("registerUI", () => {
    it("registers a UI component", () => {
      const d = createDesktop();
      const registration: UIRegistration = {
        id: "test-ui",
        slot: "taskbar",
        component: DummyComponent
      };

      d.registerUI(registration);

      expect(d.getUIForSlot("taskbar")).toHaveLength(1);
      expect(d.getUIForSlot("taskbar")[0].id).toBe("test-ui");
    });

    it("returns an unregister function", () => {
      const d = createDesktop();
      const registration: UIRegistration = {
        id: "test-ui",
        slot: "taskbar",
        component: DummyComponent
      };

      const unregister = d.registerUI(registration);
      expect(d.getUIForSlot("taskbar")).toHaveLength(1);

      unregister();
      expect(d.getUIForSlot("taskbar")).toHaveLength(0);
    });

    it("allows multiple registrations in same slot", () => {
      const d = createDesktop();

      d.registerUI({ id: "ui-1", slot: "taskbar", component: DummyComponent });
      d.registerUI({ id: "ui-2", slot: "taskbar", component: DummyComponent });

      expect(d.getUIForSlot("taskbar")).toHaveLength(2);
    });

    it("allows registrations in different slots", () => {
      const d = createDesktop();

      d.registerUI({ id: "ui-1", slot: "taskbar", component: DummyComponent });
      d.registerUI({ id: "ui-2", slot: "overlay", component: DummyComponent });

      expect(d.getUIForSlot("taskbar")).toHaveLength(1);
      expect(d.getUIForSlot("overlay")).toHaveLength(1);
    });
  });

  describe("unregisterUI", () => {
    it("removes a registration by id", () => {
      const d = createDesktop();
      d.registerUI({ id: "test-ui", slot: "taskbar", component: DummyComponent });

      const result = d.unregisterUI("test-ui");

      expect(result).toBe(true);
      expect(d.getUIForSlot("taskbar")).toHaveLength(0);
    });

    it("returns false for non-existent id", () => {
      const d = createDesktop();
      const result = d.unregisterUI("non-existent");
      expect(result).toBe(false);
    });

    it("only removes the specified registration", () => {
      const d = createDesktop();
      d.registerUI({ id: "ui-1", slot: "taskbar", component: DummyComponent });
      d.registerUI({ id: "ui-2", slot: "taskbar", component: DummyComponent });

      d.unregisterUI("ui-1");

      expect(d.getUIForSlot("taskbar")).toHaveLength(1);
      expect(d.getUIForSlot("taskbar")[0].id).toBe("ui-2");
    });
  });

  describe("getUIForSlot", () => {
    it("returns empty array for unused slot", () => {
      const d = createDesktop();
      expect(d.getUIForSlot("empty-slot")).toEqual([]);
    });

    it("sorts by order ascending", () => {
      const d = createDesktop();
      d.registerUI({ id: "ui-3", slot: "taskbar", component: DummyComponent, order: 30 });
      d.registerUI({ id: "ui-1", slot: "taskbar", component: DummyComponent, order: 10 });
      d.registerUI({ id: "ui-2", slot: "taskbar", component: DummyComponent, order: 20 });

      const result = d.getUIForSlot("taskbar");

      expect(result.map((r) => r.id)).toEqual(["ui-1", "ui-2", "ui-3"]);
    });

    it("treats undefined order as 0", () => {
      const d = createDesktop();
      d.registerUI({ id: "ui-2", slot: "taskbar", component: DummyComponent, order: 10 });
      d.registerUI({ id: "ui-1", slot: "taskbar", component: DummyComponent }); // no order

      const result = d.getUIForSlot("taskbar");

      expect(result.map((r) => r.id)).toEqual(["ui-1", "ui-2"]);
    });

    it("only returns registrations for the specified slot", () => {
      const d = createDesktop();
      d.registerUI({ id: "taskbar-ui", slot: "taskbar", component: DummyComponent });
      d.registerUI({ id: "overlay-ui", slot: "overlay", component: DummyComponent });

      const taskbarUIs = d.getUIForSlot("taskbar");
      const overlayUIs = d.getUIForSlot("overlay");

      expect(taskbarUIs).toHaveLength(1);
      expect(taskbarUIs[0].id).toBe("taskbar-ui");
      expect(overlayUIs).toHaveLength(1);
      expect(overlayUIs[0].id).toBe("overlay-ui");
    });
  });
});
