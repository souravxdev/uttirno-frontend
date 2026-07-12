export interface SparkPoint {
  x: number;
  y: number;
}

const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * Maps a series of values to evenly-spaced points inside a width×height box,
 * auto-scaling the vertical axis to the data range. Pure — unit-tested.
 */
export function sparklinePoints(
  values: number[],
  width: number,
  height: number,
  pad = 2,
): SparkPoint[] {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [{ x: round(width / 2), y: round(height / 2) }];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const innerH = height - pad * 2;

  return values.map((value, i) => ({
    x: round((i / (n - 1)) * width),
    // Flat series (span 0) renders along the mid line rather than the floor.
    y:
      span === 0
        ? round(height / 2)
        : round(pad + innerH * (1 - (value - min) / span)),
  }));
}

/** SVG polyline `points` attribute string. */
export function toPolyline(points: SparkPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}
