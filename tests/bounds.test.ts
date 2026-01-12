import { describe, it, expect } from "vitest";
import { applyConstraints, calcResize } from "../src/core/bounds";

describe("applyConstraints", () => {
  it("returns bounds unchanged when no constraints", () => {
    const bounds = { x: 10, y: 20, width: 300, height: 200 };
    expect(applyConstraints(bounds)).toEqual(bounds);
    expect(applyConstraints(bounds, {})).toEqual(bounds);
  });

  it("applies minWidth constraint", () => {
    const bounds = { x: 0, y: 0, width: 50, height: 100 };
    const result = applyConstraints(bounds, { minWidth: 100 });
    expect(result.width).toBe(100);
  });

  it("applies maxWidth constraint", () => {
    const bounds = { x: 0, y: 0, width: 500, height: 100 };
    const result = applyConstraints(bounds, { maxWidth: 300 });
    expect(result.width).toBe(300);
  });

  it("applies minHeight constraint", () => {
    const bounds = { x: 0, y: 0, width: 100, height: 30 };
    const result = applyConstraints(bounds, { minHeight: 50 });
    expect(result.height).toBe(50);
  });

  it("applies maxHeight constraint", () => {
    const bounds = { x: 0, y: 0, width: 100, height: 500 };
    const result = applyConstraints(bounds, { maxHeight: 300 });
    expect(result.height).toBe(300);
  });

  it("applies all constraints together", () => {
    const bounds = { x: 0, y: 0, width: 50, height: 600 };
    const result = applyConstraints(bounds, {
      minWidth: 100,
      maxWidth: 400,
      minHeight: 100,
      maxHeight: 300
    });
    expect(result.width).toBe(100);
    expect(result.height).toBe(300);
  });
});

describe("calcResize", () => {
  const startBounds = { x: 100, y: 100, width: 200, height: 150 };

  it("resizes east (right edge)", () => {
    const result = calcResize("e", startBounds, 50, 0);
    expect(result).toEqual({ x: 100, y: 100, width: 250, height: 150 });
  });

  it("resizes west (left edge)", () => {
    const result = calcResize("w", startBounds, -30, 0);
    expect(result).toEqual({ x: 70, y: 100, width: 230, height: 150 });
  });

  it("resizes south (bottom edge)", () => {
    const result = calcResize("s", startBounds, 0, 40);
    expect(result).toEqual({ x: 100, y: 100, width: 200, height: 190 });
  });

  it("resizes north (top edge)", () => {
    const result = calcResize("n", startBounds, 0, -20);
    expect(result).toEqual({ x: 100, y: 80, width: 200, height: 170 });
  });

  it("resizes southeast corner", () => {
    const result = calcResize("se", startBounds, 30, 40);
    expect(result).toEqual({ x: 100, y: 100, width: 230, height: 190 });
  });

  it("resizes northwest corner", () => {
    const result = calcResize("nw", startBounds, -20, -30);
    expect(result).toEqual({ x: 80, y: 70, width: 220, height: 180 });
  });

  it("respects minWidth constraint", () => {
    const result = calcResize("e", startBounds, -150, 0, { minWidth: 100 });
    expect(result.width).toBe(100);
  });

  it("respects minHeight constraint", () => {
    const result = calcResize("s", startBounds, 0, -120, { minHeight: 50 });
    expect(result.height).toBe(50);
  });

  it("adjusts position when clamping west resize", () => {
    const result = calcResize("w", startBounds, 150, 0, { minWidth: 100 });
    expect(result.width).toBe(100);
    expect(result.x).toBe(200); // x should adjust to maintain right edge
  });

  it("adjusts position when clamping north resize", () => {
    const result = calcResize("n", startBounds, 0, 120, { minHeight: 50 });
    expect(result.height).toBe(50);
    expect(result.y).toBe(200); // y should adjust to maintain bottom edge
  });
});
