/* global window */
// Lighting.jsx — shadow polygon math + light pool rendering.
// All coords in cm in the room space (0..ROOM_W, 0..ROOM_D).

const SPC = window.SP_CONST;

const FAR_CM = 3000;   // shadow-projection distance — covers the room from any vantage

/**
 * For a light at L and a wall segment (A,B), compute the shadow polygon
 * cast onto the floor plane. Returns 4 points [A, A', B', B] forming a
 * quadrilateral that should be masked out of the light's reach.
 */
function shadowPolygon(L, A, B) {
  const dxA = A.x - L.x, dyA = A.y - L.y;
  const dxB = B.x - L.x, dyB = B.y - L.y;
  const lenA = Math.hypot(dxA, dyA) || 1;
  const lenB = Math.hypot(dxB, dyB) || 1;
  const Ap = { x: A.x + (dxA / lenA) * FAR_CM, y: A.y + (dyA / lenA) * FAR_CM };
  const Bp = { x: B.x + (dxB / lenB) * FAR_CM, y: B.y + (dyB / lenB) * FAR_CM };
  return [A, Ap, Bp, B];
}

/**
 * For a "voile" or "glass" wall the shadow is softened: we still cast it,
 * but its opacity is < 1 — handled by setting the polygon's fill-opacity
 * to (1 - wall.material.opacity) of black.
 */
function wallShadowOpacity(wall) {
  const m = SPC.WALL_MATERIALS[wall.material || "solid"];
  return m.opacity; // 0 transparent → 1 fully blocking
}

/**
 * Approximate "ambient" colour at a point — sum of every light's contribution
 * weighted by inverse distance, clipped at light's radius. Returns a hex string.
 * Used by ValidationPanel to report colour spill on a reserve.
 */
function sampleAmbient(point, lights, walls) {
  // r,g,b accumulators, weight
  let r = 0, g = 0, b = 0, w = 0;
  for (const L of lights) {
    const dx = point.x - L.x, dy = point.y - L.y;
    const dist = Math.hypot(dx, dy);
    const preset = SPC.LIGHT_PRESETS[L.color];
    const intens = SPC.LIGHT_INTENSITY[L.intensity];
    if (!preset || !intens) continue;
    if (dist > intens.r) continue;
    if (isOccluded(L, point, walls)) continue;
    // falloff: linear from 1 at center to 0 at radius
    const f = (1 - dist / intens.r) * intens.v;
    const c = hexToRgb(preset.color);
    r += c.r * f;
    g += c.g * f;
    b += c.b * f;
    w += f;
  }
  if (w === 0) return null;
  // Average + clip
  const rr = Math.min(255, Math.round(r / Math.max(1, w) * w));
  const gg = Math.min(255, Math.round(g / Math.max(1, w) * w));
  const bb = Math.min(255, Math.round(b / Math.max(1, w) * w));
  return rgbToHex(Math.min(255,Math.round(r)), Math.min(255,Math.round(g)), Math.min(255,Math.round(b)));
}

/**
 * Is the line from light L to point P blocked by any wall segment?
 * Glass/voile walls are treated as transparent for the occlusion test
 * (their reduced opacity is handled when rendering shadow polygons).
 */
function isOccluded(L, P, walls) {
  for (const wall of walls) {
    const m = SPC.WALL_MATERIALS[wall.material || "solid"];
    if (m.opacity < 0.5) continue; // glass/voile let light through
    if (segmentsIntersect(L.x, L.y, P.x, P.y, wall.x1, wall.y1, wall.x2, wall.y2)) {
      return true;
    }
  }
  return false;
}

function segmentsIntersect(ax,ay,bx,by, cx,cy,dx,dy) {
  const d1x = bx - ax, d1y = by - ay;
  const d2x = dx - cx, d2y = dy - cy;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-9) return false;
  const t = ((cx - ax) * d2y - (cy - ay) * d2x) / denom;
  const s = ((cx - ax) * d1y - (cy - ay) * d1x) / denom;
  return t > 0.001 && t < 0.999 && s > 0.001 && s < 0.999;
}

/**
 * Closest point on segment (a,b) from point p.
 */
function closestPointOnSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const lensq = dx * dx + dy * dy;
  if (lensq < 1e-6) return { x: a.x, y: a.y };
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lensq;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + dx * t, y: a.y + dy * t };
}

/**
 * For a light L, compute the set of single-bounce reflections off each wall.
 * Returns an array of { x, y, color, strength (0..1), radius (cm) }.
 * Reflection is rendered as a secondary, smaller, dimmer pool at the closest
 * point on each wall — a first-order approximation suitable for the planner.
 */
function computeReflections(light, walls, allWalls) {
  const intens = SPC.LIGHT_INTENSITY[light.intensity];
  if (!intens) return [];
  const out = [];
  for (const wall of walls) {
    const mat = SPC.WALL_MATERIALS[wall.material || "solid"];
    if (!mat || mat.reflect < 0.05) continue;
    const A = { x: wall.x1, y: wall.y1 };
    const B = { x: wall.x2, y: wall.y2 };
    const P = closestPointOnSegment(light, A, B);
    const dist = Math.hypot(P.x - light.x, P.y - light.y);
    if (dist > intens.r) continue;
    // occlusion: check if any OTHER wall blocks the light-to-bounce-point ray
    const others = allWalls.filter(w => w !== wall);
    if (isOccluded(light, P, others)) continue;
    const f = Math.max(0, 1 - dist / intens.r);
    const strength = intens.v * mat.reflect * f;
    if (strength < 0.03) continue;
    out.push({
      x: P.x, y: P.y,
      color: light.color,
      strength,
      radius: Math.max(80, intens.r * 0.45 * Math.sqrt(mat.reflect))
    });
  }
  return out;
}

function hexToRgb(h) {
  const x = h.replace("#","");
  return {
    r: parseInt(x.slice(0,2),16),
    g: parseInt(x.slice(2,4),16),
    b: parseInt(x.slice(4,6),16)
  };
}
function rgbToHex(r,g,b) {
  return "#" + [r,g,b].map(n => n.toString(16).padStart(2,"0")).join("").toUpperCase();
}

/**
 * Point-in-polygon test (ray-casting).
 */
function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > p.y) !== (yj > p.y))
      && (p.x < (xj - xi) * (p.y - yi) / ((yj - yi) || 1e-9) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Convert a polygon to a list of wall segments (closed loop edges).
 */
function polyToWalls(poly, material) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, material: material || "solid" });
  }
  return out;
}

window.SP_LIGHT = {
  shadowPolygon, wallShadowOpacity, sampleAmbient,
  isOccluded, segmentsIntersect, closestPointOnSegment,
  computeReflections,
  pointInPolygon, polyToWalls,
  hexToRgb, rgbToHex, FAR_CM
};
