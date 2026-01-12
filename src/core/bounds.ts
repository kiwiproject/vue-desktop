import type { Bounds, WindowConstraints } from "./types";

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function applyConstraints(bounds: Bounds, constraints?: WindowConstraints): Bounds {
  if (!constraints) return bounds;

  let { width, height } = bounds;

  if (constraints.minWidth !== undefined) {
    width = Math.max(width, constraints.minWidth);
  }
  if (constraints.maxWidth !== undefined) {
    width = Math.min(width, constraints.maxWidth);
  }
  if (constraints.minHeight !== undefined) {
    height = Math.max(height, constraints.minHeight);
  }
  if (constraints.maxHeight !== undefined) {
    height = Math.min(height, constraints.maxHeight);
  }

  return { ...bounds, width, height };
}

export function calcResize(
  direction: ResizeDirection,
  startBounds: Bounds,
  deltaX: number,
  deltaY: number,
  constraints?: WindowConstraints
): Bounds {
  let { x, y, width, height } = startBounds;

  // Horizontal resizing
  if (direction.includes("e")) {
    width = startBounds.width + deltaX;
  } else if (direction.includes("w")) {
    width = startBounds.width - deltaX;
    x = startBounds.x + deltaX;
  }

  // Vertical resizing
  if (direction.includes("s")) {
    height = startBounds.height + deltaY;
  } else if (direction.includes("n")) {
    height = startBounds.height - deltaY;
    y = startBounds.y + deltaY;
  }

  // Apply constraints
  const minWidth = constraints?.minWidth ?? 100;
  const minHeight = constraints?.minHeight ?? 50;
  const maxWidth = constraints?.maxWidth ?? Infinity;
  const maxHeight = constraints?.maxHeight ?? Infinity;

  // Clamp dimensions
  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width));
  const clampedHeight = Math.max(minHeight, Math.min(maxHeight, height));

  // Adjust position if clamping affected west/north resize
  if (direction.includes("w") && clampedWidth !== width) {
    x = startBounds.x + startBounds.width - clampedWidth;
  }
  if (direction.includes("n") && clampedHeight !== height) {
    y = startBounds.y + startBounds.height - clampedHeight;
  }

  return { x, y, width: clampedWidth, height: clampedHeight };
}
