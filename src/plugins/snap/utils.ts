import type { Bounds } from "../../core/types";

export interface SnapTarget {
  type: "edge" | "grid" | "window";
  axis: "x" | "y";
  position: number;
}

export interface SnapResult {
  bounds: Bounds;
  snappedX: boolean;
  snappedY: boolean;
  targets: SnapTarget[];
}

export interface SnapOptions {
  /** Snap to viewport edges */
  edges?: boolean;
  /** Snap to grid with this cell size */
  gridSize?: number;
  /** Snap to other windows */
  windows?: boolean;
  /** Distance threshold for snapping (default: 10) */
  threshold?: number;
}

/**
 * Snap a value to a target if within threshold.
 * Returns the snapped value and whether snapping occurred.
 */
export function snapToValue(
  value: number,
  target: number,
  threshold: number
): { value: number; snapped: boolean } {
  const distance = Math.abs(value - target);
  if (distance <= threshold) {
    return { value: target, snapped: true };
  }
  return { value, snapped: false };
}

/**
 * Snap a value to the nearest grid line.
 */
export function snapToGrid(
  value: number,
  gridSize: number,
  threshold: number
): { value: number; snapped: boolean } {
  const nearest = Math.round(value / gridSize) * gridSize;
  return snapToValue(value, nearest, threshold);
}

/**
 * Calculate snapped bounds for edge snapping.
 */
export function snapToEdges(
  bounds: Bounds,
  viewport: Bounds,
  threshold: number
): SnapResult {
  const result: SnapResult = {
    bounds: { ...bounds },
    snappedX: false,
    snappedY: false,
    targets: []
  };

  // Left edge
  const leftSnap = snapToValue(bounds.x, viewport.x, threshold);
  if (leftSnap.snapped) {
    result.bounds.x = leftSnap.value;
    result.snappedX = true;
    result.targets.push({ type: "edge", axis: "x", position: viewport.x });
  }

  // Right edge (window right to viewport right)
  if (!result.snappedX) {
    const rightEdge = viewport.x + viewport.width;
    const windowRight = bounds.x + bounds.width;
    const rightSnap = snapToValue(windowRight, rightEdge, threshold);
    if (rightSnap.snapped) {
      result.bounds.x = rightEdge - bounds.width;
      result.snappedX = true;
      result.targets.push({ type: "edge", axis: "x", position: rightEdge });
    }
  }

  // Top edge
  const topSnap = snapToValue(bounds.y, viewport.y, threshold);
  if (topSnap.snapped) {
    result.bounds.y = topSnap.value;
    result.snappedY = true;
    result.targets.push({ type: "edge", axis: "y", position: viewport.y });
  }

  // Bottom edge (window bottom to viewport bottom)
  if (!result.snappedY) {
    const bottomEdge = viewport.y + viewport.height;
    const windowBottom = bounds.y + bounds.height;
    const bottomSnap = snapToValue(windowBottom, bottomEdge, threshold);
    if (bottomSnap.snapped) {
      result.bounds.y = bottomEdge - bounds.height;
      result.snappedY = true;
      result.targets.push({ type: "edge", axis: "y", position: bottomEdge });
    }
  }

  return result;
}

/**
 * Calculate snapped bounds for grid snapping.
 */
export function snapBoundsToGrid(
  bounds: Bounds,
  gridSize: number,
  threshold: number
): SnapResult {
  const result: SnapResult = {
    bounds: { ...bounds },
    snappedX: false,
    snappedY: false,
    targets: []
  };

  const xSnap = snapToGrid(bounds.x, gridSize, threshold);
  if (xSnap.snapped) {
    result.bounds.x = xSnap.value;
    result.snappedX = true;
    result.targets.push({ type: "grid", axis: "x", position: xSnap.value });
  }

  const ySnap = snapToGrid(bounds.y, gridSize, threshold);
  if (ySnap.snapped) {
    result.bounds.y = ySnap.value;
    result.snappedY = true;
    result.targets.push({ type: "grid", axis: "y", position: ySnap.value });
  }

  return result;
}

/**
 * Calculate snapped bounds for window-to-window snapping.
 */
export function snapToWindows(
  bounds: Bounds,
  windowId: string,
  otherWindows: Array<{ id: string; bounds: Bounds }>,
  threshold: number
): SnapResult {
  const result: SnapResult = {
    bounds: { ...bounds },
    snappedX: false,
    snappedY: false,
    targets: []
  };

  for (const other of otherWindows) {
    if (other.id === windowId) continue;

    const otherBounds = other.bounds;

    // Snap left edge to other's right edge
    if (!result.snappedX) {
      const otherRight = otherBounds.x + otherBounds.width;
      const leftSnap = snapToValue(bounds.x, otherRight, threshold);
      if (leftSnap.snapped) {
        result.bounds.x = leftSnap.value;
        result.snappedX = true;
        result.targets.push({ type: "window", axis: "x", position: otherRight });
      }
    }

    // Snap right edge to other's left edge
    if (!result.snappedX) {
      const windowRight = bounds.x + bounds.width;
      const rightSnap = snapToValue(windowRight, otherBounds.x, threshold);
      if (rightSnap.snapped) {
        result.bounds.x = otherBounds.x - bounds.width;
        result.snappedX = true;
        result.targets.push({ type: "window", axis: "x", position: otherBounds.x });
      }
    }

    // Snap left edge to other's left edge (align)
    if (!result.snappedX) {
      const leftAlignSnap = snapToValue(bounds.x, otherBounds.x, threshold);
      if (leftAlignSnap.snapped) {
        result.bounds.x = leftAlignSnap.value;
        result.snappedX = true;
        result.targets.push({ type: "window", axis: "x", position: otherBounds.x });
      }
    }

    // Snap top edge to other's bottom edge
    if (!result.snappedY) {
      const otherBottom = otherBounds.y + otherBounds.height;
      const topSnap = snapToValue(bounds.y, otherBottom, threshold);
      if (topSnap.snapped) {
        result.bounds.y = topSnap.value;
        result.snappedY = true;
        result.targets.push({ type: "window", axis: "y", position: otherBottom });
      }
    }

    // Snap bottom edge to other's top edge
    if (!result.snappedY) {
      const windowBottom = bounds.y + bounds.height;
      const bottomSnap = snapToValue(windowBottom, otherBounds.y, threshold);
      if (bottomSnap.snapped) {
        result.bounds.y = otherBounds.y - bounds.height;
        result.snappedY = true;
        result.targets.push({ type: "window", axis: "y", position: otherBounds.y });
      }
    }

    // Snap top edge to other's top edge (align)
    if (!result.snappedY) {
      const topAlignSnap = snapToValue(bounds.y, otherBounds.y, threshold);
      if (topAlignSnap.snapped) {
        result.bounds.y = topAlignSnap.value;
        result.snappedY = true;
        result.targets.push({ type: "window", axis: "y", position: otherBounds.y });
      }
    }
  }

  return result;
}

/**
 * Apply all enabled snap behaviors to bounds.
 */
export function applySnapping(
  bounds: Bounds,
  windowId: string,
  options: {
    viewport?: Bounds;
    otherWindows?: Array<{ id: string; bounds: Bounds }>;
    snapOptions: SnapOptions;
  }
): SnapResult {
  const { viewport, otherWindows = [], snapOptions } = options;
  const threshold = snapOptions.threshold ?? 10;

  const result: SnapResult = {
    bounds: { ...bounds },
    snappedX: false,
    snappedY: false,
    targets: []
  };

  // Apply edge snapping first (highest priority)
  if (snapOptions.edges && viewport) {
    const edgeResult = snapToEdges(result.bounds, viewport, threshold);
    if (edgeResult.snappedX) {
      result.bounds.x = edgeResult.bounds.x;
      result.snappedX = true;
      result.targets.push(...edgeResult.targets.filter((t) => t.axis === "x"));
    }
    if (edgeResult.snappedY) {
      result.bounds.y = edgeResult.bounds.y;
      result.snappedY = true;
      result.targets.push(...edgeResult.targets.filter((t) => t.axis === "y"));
    }
  }

  // Apply window-to-window snapping
  if (snapOptions.windows && otherWindows.length > 0) {
    const windowResult = snapToWindows(result.bounds, windowId, otherWindows, threshold);
    if (!result.snappedX && windowResult.snappedX) {
      result.bounds.x = windowResult.bounds.x;
      result.snappedX = true;
      result.targets.push(...windowResult.targets.filter((t) => t.axis === "x"));
    }
    if (!result.snappedY && windowResult.snappedY) {
      result.bounds.y = windowResult.bounds.y;
      result.snappedY = true;
      result.targets.push(...windowResult.targets.filter((t) => t.axis === "y"));
    }
  }

  // Apply grid snapping (lowest priority)
  if (snapOptions.gridSize && snapOptions.gridSize > 0) {
    const gridResult = snapBoundsToGrid(result.bounds, snapOptions.gridSize, threshold);
    if (!result.snappedX && gridResult.snappedX) {
      result.bounds.x = gridResult.bounds.x;
      result.snappedX = true;
      result.targets.push(...gridResult.targets.filter((t) => t.axis === "x"));
    }
    if (!result.snappedY && gridResult.snappedY) {
      result.bounds.y = gridResult.bounds.y;
      result.snappedY = true;
      result.targets.push(...gridResult.targets.filter((t) => t.axis === "y"));
    }
  }

  return result;
}
