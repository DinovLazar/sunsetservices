/**
 * Phase M.01e — Web Mercator projection helper for the service-areas map.
 *
 * Maps `{lat, lng}` to `{x, y}` SVG coordinates inside a bounding box
 * computed from the input set of cities, then fits the projected points
 * into the SVG viewBox with a small padding so pins don't crash against
 * the frame edge.
 *
 * The Mercator projection (https://en.wikipedia.org/wiki/Web_Mercator_projection)
 * is the standard for online maps at small extents — over a ~70 km box
 * the linear approximation visually matches actual geography. No
 * dependency on a map library; the function is pure and runs at build
 * time when locations.ts is evaluated.
 */

export type LatLng = {lat: number; lng: number};
export type XY = {x: number; y: number};

/** Convert lat/lng → Mercator world coordinates (radians-scaled). */
function project(lat: number, lng: number): {wx: number; wy: number} {
  const x = (lng * Math.PI) / 180;
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return {wx: x, wy: y};
}

/**
 * Build an interpolator that maps lat/lng pairs into a target SVG viewBox
 * (default 600×500, padding 60). The bounding box is computed from the
 * input set so all pins land inside.
 *
 * @returns a function that takes `{lat, lng}` and returns `{x, y}` rounded
 *          to one decimal place (deterministic across builds).
 */
export function buildMercatorProjector(
  cities: ReadonlyArray<LatLng>,
  options: {
    viewBoxWidth?: number;
    viewBoxHeight?: number;
    padding?: number;
  } = {},
): (point: LatLng) => XY {
  const VW = options.viewBoxWidth ?? 600;
  const VH = options.viewBoxHeight ?? 500;
  const PAD = options.padding ?? 60;

  if (cities.length === 0) {
    return () => ({x: VW / 2, y: VH / 2});
  }

  const worlds = cities.map((c) => project(c.lat, c.lng));
  const minWx = Math.min(...worlds.map((w) => w.wx));
  const maxWx = Math.max(...worlds.map((w) => w.wx));
  const minWy = Math.min(...worlds.map((w) => w.wy));
  const maxWy = Math.max(...worlds.map((w) => w.wy));

  const wRange = Math.max(maxWx - minWx, 1e-9);
  const hRange = Math.max(maxWy - minWy, 1e-9);

  const innerW = VW - 2 * PAD;
  const innerH = VH - 2 * PAD;

  // Preserve aspect: pick the smaller scale so neither axis overflows.
  const scale = Math.min(innerW / wRange, innerH / hRange);

  const usedW = wRange * scale;
  const usedH = hRange * scale;
  const offsetX = (VW - usedW) / 2;
  const offsetY = (VH - usedH) / 2;

  return (point: LatLng): XY => {
    const {wx, wy} = project(point.lat, point.lng);
    const x = offsetX + (wx - minWx) * scale;
    // y axis is inverted: SVG y grows downward, Mercator wy grows upward
    const y = offsetY + (maxWy - wy) * scale;
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    };
  };
}
