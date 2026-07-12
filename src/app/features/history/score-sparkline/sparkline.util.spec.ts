import { sparklinePoints, toPolyline } from './sparkline.util';

describe('sparklinePoints', () => {
  it('returns nothing for an empty series', () => {
    expect(sparklinePoints([], 100, 32)).toEqual([]);
  });

  it('centers a single value', () => {
    expect(sparklinePoints([0.5], 100, 32)).toEqual([{ x: 50, y: 16 }]);
  });

  it('spreads points evenly on x and inverts y (higher score → higher up)', () => {
    const points = sparklinePoints([0, 1], 100, 32, 2);
    expect(points[0].x).toBe(0);
    expect(points[1].x).toBe(100);
    // Lowest value sits at the bottom, highest at the top (small y).
    expect(points[0].y).toBeGreaterThan(points[1].y);
    expect(points[1].y).toBe(2); // max → top padding
    expect(points[0].y).toBe(30); // min → height - pad
  });

  it('draws a flat series along the mid line', () => {
    const points = sparklinePoints([0.4, 0.4, 0.4], 100, 32, 2);
    expect(points.map((p) => p.y)).toEqual([16, 16, 16]);
  });

  it('serializes to an SVG points string', () => {
    expect(toPolyline([{ x: 0, y: 30 }, { x: 100, y: 2 }])).toBe('0,30 100,2');
  });
});
