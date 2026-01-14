import { describe, it, expect } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import {
  createSnapPlugin,
  SnapPlugin,
  snapToValue,
  snapToGrid,
  snapToEdges,
  snapBoundsToGrid,
  snapToWindows,
  applySnapping,
  type DesktopInstanceWithSnap
} from "../src/plugins/snap";

describe("snapToValue", () => {
  it("snaps when within threshold", () => {
    const result = snapToValue(95, 100, 10);
    expect(result).toEqual({ value: 100, snapped: true });
  });

  it("does not snap when outside threshold", () => {
    const result = snapToValue(85, 100, 10);
    expect(result).toEqual({ value: 85, snapped: false });
  });

  it("snaps at exact threshold distance", () => {
    const result = snapToValue(90, 100, 10);
    expect(result).toEqual({ value: 100, snapped: true });
  });

  it("snaps when value is greater than target", () => {
    const result = snapToValue(105, 100, 10);
    expect(result).toEqual({ value: 100, snapped: true });
  });
});

describe("snapToGrid", () => {
  it("snaps to nearest grid line", () => {
    const result = snapToGrid(23, 20, 10);
    expect(result).toEqual({ value: 20, snapped: true });
  });

  it("snaps up to nearest grid line", () => {
    const result = snapToGrid(38, 20, 10);
    expect(result).toEqual({ value: 40, snapped: true });
  });

  it("does not snap when too far from grid line", () => {
    const result = snapToGrid(25, 20, 3);
    expect(result).toEqual({ value: 25, snapped: false });
  });
});

describe("snapToEdges", () => {
  const viewport = { x: 0, y: 0, width: 1000, height: 800 };

  it("snaps to left edge", () => {
    const bounds = { x: 5, y: 100, width: 200, height: 150 };
    const result = snapToEdges(bounds, viewport, 10);

    expect(result.bounds.x).toBe(0);
    expect(result.snappedX).toBe(true);
  });

  it("snaps to top edge", () => {
    const bounds = { x: 100, y: 8, width: 200, height: 150 };
    const result = snapToEdges(bounds, viewport, 10);

    expect(result.bounds.y).toBe(0);
    expect(result.snappedY).toBe(true);
  });

  it("snaps to right edge", () => {
    const bounds = { x: 795, y: 100, width: 200, height: 150 };
    const result = snapToEdges(bounds, viewport, 10);

    expect(result.bounds.x).toBe(800); // 1000 - 200
    expect(result.snappedX).toBe(true);
  });

  it("snaps to bottom edge", () => {
    const bounds = { x: 100, y: 645, width: 200, height: 150 };
    const result = snapToEdges(bounds, viewport, 10);

    expect(result.bounds.y).toBe(650); // 800 - 150
    expect(result.snappedY).toBe(true);
  });

  it("does not snap when far from edges", () => {
    const bounds = { x: 100, y: 100, width: 200, height: 150 };
    const result = snapToEdges(bounds, viewport, 10);

    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });
});

describe("snapBoundsToGrid", () => {
  it("snaps both axes to grid", () => {
    const bounds = { x: 22, y: 38, width: 200, height: 150 };
    const result = snapBoundsToGrid(bounds, 20, 10);

    expect(result.bounds.x).toBe(20);
    expect(result.bounds.y).toBe(40);
    expect(result.snappedX).toBe(true);
    expect(result.snappedY).toBe(true);
  });
});

describe("snapToWindows", () => {
  it("snaps to another window's right edge", () => {
    const bounds = { x: 205, y: 100, width: 200, height: 150 };
    const otherWindows = [{ id: "other", bounds: { x: 0, y: 100, width: 200, height: 150 } }];

    const result = snapToWindows(bounds, "current", otherWindows, 10);

    expect(result.bounds.x).toBe(200); // Snap to right edge of other window
    expect(result.snappedX).toBe(true);
  });

  it("snaps to another window's left edge", () => {
    const bounds = { x: 295, y: 100, width: 200, height: 150 };
    const otherWindows = [{ id: "other", bounds: { x: 500, y: 100, width: 200, height: 150 } }];

    const result = snapToWindows(bounds, "current", otherWindows, 10);

    expect(result.bounds.x).toBe(300); // 500 - 200, snap right edge to other's left
    expect(result.snappedX).toBe(true);
  });

  it("snaps to another window's bottom edge", () => {
    const bounds = { x: 100, y: 155, width: 200, height: 150 };
    const otherWindows = [{ id: "other", bounds: { x: 100, y: 0, width: 200, height: 150 } }];

    const result = snapToWindows(bounds, "current", otherWindows, 10);

    expect(result.bounds.y).toBe(150); // Snap to bottom of other window
    expect(result.snappedY).toBe(true);
  });

  it("does not snap to self", () => {
    const bounds = { x: 100, y: 100, width: 200, height: 150 };
    const otherWindows = [{ id: "current", bounds: { x: 100, y: 100, width: 200, height: 150 } }];

    const result = snapToWindows(bounds, "current", otherWindows, 10);

    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });
});

describe("applySnapping", () => {
  it("applies edge snapping with priority", () => {
    const bounds = { x: 5, y: 100, width: 200, height: 150 };
    const viewport = { x: 0, y: 0, width: 1000, height: 800 };

    const result = applySnapping(bounds, "win1", {
      viewport,
      snapOptions: { edges: true, threshold: 10 }
    });

    expect(result.bounds.x).toBe(0);
    expect(result.snappedX).toBe(true);
  });

  it("applies grid snapping when edges disabled", () => {
    const bounds = { x: 23, y: 100, width: 200, height: 150 };

    const result = applySnapping(bounds, "win1", {
      snapOptions: { edges: false, gridSize: 20, threshold: 10 }
    });

    expect(result.bounds.x).toBe(20);
    expect(result.snappedX).toBe(true);
  });

  it("combines multiple snap behaviors", () => {
    const bounds = { x: 5, y: 38, width: 200, height: 150 };
    const viewport = { x: 0, y: 0, width: 1000, height: 800 };

    const result = applySnapping(bounds, "win1", {
      viewport,
      snapOptions: { edges: true, gridSize: 20, threshold: 10 }
    });

    // X snaps to edge (0), Y snaps to grid (40)
    expect(result.bounds.x).toBe(0);
    expect(result.bounds.y).toBe(40);
  });
});

describe("SnapPlugin", () => {
  describe("installation", () => {
    it("installs successfully", () => {
      const d = createDesktop();
      const plugin = createSnapPlugin();

      const result = d.installPlugin(plugin);

      expect(result).toBe(true);
      expect(d.hasPlugin("snap")).toBe(true);
    });

    it("attaches snap API to desktop", () => {
      const d = createDesktop() as DesktopInstanceWithSnap;
      const plugin = createSnapPlugin();

      d.installPlugin(plugin);

      expect(d.snap).toBeDefined();
      expect(typeof d.snap?.setEnabled).toBe("function");
      expect(typeof d.snap?.isEnabled).toBe("function");
      expect(typeof d.snap?.setOptions).toBe("function");
      expect(typeof d.snap?.getOptions).toBe("function");
    });
  });

  describe("uninstallation", () => {
    it("uninstalls successfully", () => {
      const d = createDesktop() as DesktopInstanceWithSnap;
      const plugin = createSnapPlugin();
      d.installPlugin(plugin);

      const result = d.uninstallPlugin("snap");

      expect(result).toBe(true);
      expect(d.hasPlugin("snap")).toBe(false);
    });

    it("removes snap API on uninstall", () => {
      const d = createDesktop() as DesktopInstanceWithSnap;
      const plugin = createSnapPlugin();
      d.installPlugin(plugin);

      d.uninstallPlugin("snap");

      expect(d.snap).toBeUndefined();
    });
  });

  describe("snap API", () => {
    it("can enable and disable snapping", () => {
      const d = createDesktop() as DesktopInstanceWithSnap;
      d.installPlugin(createSnapPlugin());

      expect(d.snap?.isEnabled()).toBe(true);

      d.snap?.setEnabled(false);
      expect(d.snap?.isEnabled()).toBe(false);

      d.snap?.setEnabled(true);
      expect(d.snap?.isEnabled()).toBe(true);
    });

    it("can update snap options", () => {
      const d = createDesktop() as DesktopInstanceWithSnap;
      d.installPlugin(createSnapPlugin({ threshold: 10 }));

      d.snap?.setOptions({ threshold: 20, gridSize: 50 });

      const options = d.snap?.getOptions();
      expect(options?.threshold).toBe(20);
      expect(options?.gridSize).toBe(50);
    });
  });

  describe("bounds snapping", () => {
    it("snaps window bounds to edges when viewport provided", () => {
      const viewport = { x: 0, y: 0, width: 1000, height: 800 };
      const d = createDesktop() as DesktopInstanceWithSnap;
      d.installPlugin(
        createSnapPlugin({
          edges: true,
          threshold: 10,
          getViewport: () => viewport
        })
      );

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never,
        initialBounds: { x: 100, y: 100, width: 200, height: 150 }
      });

      // Move window near left edge
      d.updateBounds(win.id!, { x: 5, y: 100, width: 200, height: 150 });

      const bounds = d.getBounds(win.id!);
      expect(bounds?.x).toBe(0); // Snapped to left edge
    });

    it("does not snap when disabled", () => {
      const viewport = { x: 0, y: 0, width: 1000, height: 800 };
      const d = createDesktop() as DesktopInstanceWithSnap;
      d.installPlugin(
        createSnapPlugin({
          edges: true,
          threshold: 10,
          getViewport: () => viewport
        })
      );

      const win = d.createWindow({
        type: "test",
        title: "Test",
        component: {} as never,
        initialBounds: { x: 100, y: 100, width: 200, height: 150 }
      });

      d.snap?.setEnabled(false);

      // Move window near left edge
      d.updateBounds(win.id!, { x: 5, y: 100, width: 200, height: 150 });

      const bounds = d.getBounds(win.id!);
      expect(bounds?.x).toBe(5); // Not snapped
    });

    it("snaps windows to each other", () => {
      const d = createDesktop() as DesktopInstanceWithSnap;
      d.installPlugin(
        createSnapPlugin({
          edges: false,
          windows: true,
          threshold: 10
        })
      );

      const win1 = d.createWindow({
        type: "test",
        title: "Test 1",
        component: {} as never,
        initialBounds: { x: 0, y: 100, width: 200, height: 150 }
      });

      const win2 = d.createWindow({
        type: "test",
        title: "Test 2",
        component: {} as never,
        initialBounds: { x: 300, y: 100, width: 200, height: 150 }
      });

      // Move win2 near win1's right edge
      d.updateBounds(win2.id!, { x: 205, y: 100, width: 200, height: 150 });

      const bounds = d.getBounds(win2.id!);
      expect(bounds?.x).toBe(200); // Snapped to win1's right edge
    });
  });
});
