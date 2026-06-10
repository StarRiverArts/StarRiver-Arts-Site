/* global React, window */
// ElevationView.jsx — side view of selected wall.
//   Reserves projected to the wall, centred at eye-height 130.
//   Lights drawn at their physical mount height with beam cone.
//   Lights are DRAGGABLE: drag along the wall (x) and vertically (z).
//
// Wall projections (which plan axis becomes "along" in elevation):
//   N: along = plan.x          (left→right in plan = left→right in elev)
//   S: along = ROOM_W - plan.x (mirrored — we look "south" facing north)
//   E: along = plan.y          (top→bottom in plan = left→right in elev, looking west)
//   W: along = ROOM_D - plan.y (mirrored)

const { useRef, useState, useEffect } = React;
const C = window.SP_CONST;

const PX_PER_CM_E = 0.55;     // 1 cm = 0.55 px → 10 m wall = 550 px
const PAD_E = 50;

function wallAlong(item, wall, isLight) {
  // item is either a reserve (with x,y,size) or light (with x,y)
  const x = item.x, y = item.y;
  switch (wall) {
    case "N": return x;
    case "S": return C.ROOM_W - x;
    case "E": return y;
    case "W": return C.ROOM_D - y;
    default:  return x;
  }
}
function alongToPlan(along, wall, otherCoord) {
  // inverse — given along position, return updated {x, y}
  switch (wall) {
    case "N": return { x: along, y: otherCoord };
    case "S": return { x: C.ROOM_W - along, y: otherCoord };
    case "E": return { x: otherCoord, y: along };
    case "W": return { x: otherCoord, y: C.ROOM_D - along };
    default:  return { x: along, y: otherCoord };
  }
}
function reserveProjW(r, wall) {
  // visible width on the wall: w if N/S, d if E/W
  const sz = C.RESERVES[r.size];
  return (wall === "N" || wall === "S") ? sz.w : sz.d;
}

function ElevationView({ mode, reserves, selectedId, walls, lights, moveLight, removeLight, wall }) {
  const wallLen = (wall === "N" || wall === "S") ? C.ROOM_W : C.ROOM_D;
  const wallLenPx = wallLen * PX_PER_CM_E;
  const ceilPx    = C.CEIL_H * PX_PER_CM_E;
  const eyePx     = C.EYE_H  * PX_PER_CM_E;
  const VBW = wallLenPx + PAD_E * 2;
  const VBH = ceilPx + 110;

  const floorY = PAD_E + ceilPx;
  const eyeY   = floorY - eyePx;

  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);  // { id, dx, dz, otherCoord }

  function ptToCm(e) {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM().inverse();
    const local = pt.matrixTransform(ctm);
    const along = (local.x - PAD_E) / PX_PER_CM_E;
    const z = (floorY - local.y) / PX_PER_CM_E;
    return { along, z };
  }

  function onLightDown(e, L) {
    if (mode !== "light") return;
    e.stopPropagation();
    const { along, z } = ptToCm(e);
    const Lalong = wallAlong(L, wall);
    const otherCoord = (wall === "N" || wall === "S") ? L.y : L.x;
    setDrag({ id: L.id, dAlong: along - Lalong, dz: z - L.z, otherCoord });
  }
  function onMove(e) {
    if (!drag) return;
    const { along, z } = ptToCm(e);
    const newAlong = Math.round(Math.max(0, Math.min(wallLen, along - drag.dAlong)) / 5) * 5;
    const newZ     = Math.round(Math.max(0, Math.min(C.CEIL_H, z - drag.dz)) / 5) * 5;
    const planXY   = alongToPlan(newAlong, wall, drag.otherCoord);
    moveLight(drag.id, { x: planXY.x, y: planXY.y, z: newZ });
  }
  function onUp() { setDrag(null); }
  useEffect(() => {
    if (!drag) return;
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [drag]);

  // ceiling / floor grid
  const grid = [];
  for (let g = 100; g < wallLen; g += 100) {
    const x = PAD_E + g * PX_PER_CM_E;
    grid.push(<line key={"gx"+g} x1={x} y1={PAD_E} x2={x} y2={floorY}
                    stroke={C.COL.rule} strokeWidth="0.4"/>);
  }
  for (let g = 50; g < C.CEIL_H; g += 50) {
    const y = floorY - g * PX_PER_CM_E;
    grid.push(<line key={"gy"+g} x1={PAD_E} y1={y} x2={PAD_E + wallLenPx} y2={y}
                    stroke={C.COL.rule} strokeWidth={g === 200 || g === 100 ? "0.8" : "0.3"}/>);
  }

  // standing avatar at selected reserve's location (if any)
  const sel = reserves.find(r => r.id === selectedId);
  let avatarAlong = wallLen / 2;
  if (sel) avatarAlong = wallAlong(sel, wall) + reserveProjW(sel, wall) / 2;
  const avatarX = PAD_E + avatarAlong * PX_PER_CM_E;

  return (
    <div className="canvas">
      <div className="canvas__hd">
        <div className="canvas__t">立面圖 · Elevation · Wall {wall}</div>
        <div className="canvas__d mono">
          {wallLen/100} m wide · ceiling {C.CEIL_H} cm
          {mode === "light" ? " · drag any light · 拖弋光源" : ""}
        </div>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${VBW} ${VBH}`}
           className="svg svg--elev"
           onMouseMove={onMove}>

        {/* defs: per-light beam gradient */}
        <defs>
          {lights.map(L => {
            const preset = C.LIGHT_PRESETS[L.color];
            const intens = C.LIGHT_INTENSITY[L.intensity];
            if (!preset || !intens) return null;
            return (
              <radialGradient key={"ge"+L.id} id={`elev-grad-${L.id}`}>
                <stop offset="0%"  stopColor={preset.color} stopOpacity={Math.min(0.7, 0.5 * intens.v)}/>
                <stop offset="50%" stopColor={preset.color} stopOpacity={Math.min(0.35, 0.25 * intens.v)}/>
                <stop offset="100%" stopColor={preset.color} stopOpacity="0"/>
              </radialGradient>
            );
          })}
        </defs>

        {/* wall body fill */}
        <rect x={PAD_E} y={PAD_E} width={wallLenPx} height={ceilPx}
              fill={C.COL.body} fillOpacity="0.45"/>
        {grid}

        {/* ceiling + floor + ends */}
        <line x1={PAD_E} y1={PAD_E} x2={PAD_E + wallLenPx} y2={PAD_E} stroke={C.COL.ink} strokeWidth="2"/>
        <line x1={PAD_E} y1={floorY} x2={PAD_E + wallLenPx} y2={floorY} stroke={C.COL.ink} strokeWidth="2"/>
        <line x1={PAD_E} y1={PAD_E} x2={PAD_E} y2={floorY} stroke={C.COL.ink} strokeWidth="1.5"/>
        <line x1={PAD_E + wallLenPx} y1={PAD_E} x2={PAD_E + wallLenPx} y2={floorY} stroke={C.COL.ink} strokeWidth="1.5"/>

        {/* eye datum */}
        <line x1={PAD_E} y1={eyeY} x2={PAD_E + wallLenPx} y2={eyeY}
              stroke={C.COL.dim} strokeWidth="0.6" strokeDasharray="4 3"/>
        <text x={PAD_E + 4} y={eyeY - 4} className="lbl ink">EYE · 130</text>

        {/* reserves projected */}
        {reserves.map(r => {
          const sz = C.RESERVES[r.size];
          const a = wallAlong(r, wall);
          const w = reserveProjW(r, wall);
          const x = PAD_E + a * PX_PER_CM_E;
          const wPx = w * PX_PER_CM_E;
          const hPx = sz.h * PX_PER_CM_E;
          const y = eyeY - hPx / 2;
          const isSel = r.id === selectedId;
          return (
            <g key={r.id}>
              <rect x={x} y={y} width={wPx} height={hPx}
                    fill={C.COL.body} stroke={C.COL.ink}
                    strokeWidth={isSel ? "1.5" : "1"}/>
              <text x={x + wPx/2} y={y - 4} textAnchor="middle" className="lbl ink">{sz.label}</text>
            </g>
          );
        })}

        {/* light beams (cones drawn from each light) */}
        {lights.map(L => {
          const mount = C.LIGHT_MOUNTS[L.mount];
          const preset = C.LIGHT_PRESETS[L.color];
          const intens = C.LIGHT_INTENSITY[L.intensity];
          if (!mount || !preset || !intens) return null;
          const a = wallAlong(L, wall);
          const cx = PAD_E + a * PX_PER_CM_E;
          const cy = floorY - L.z * PX_PER_CM_E;
          // beam: draw cone shape based on mount.beam direction
          const halfAng = (mount.cone / 2) * Math.PI / 180;
          const reachCm = Math.min(intens.r, 500);
          const reachPx = reachCm * PX_PER_CM_E;
          let coneShape = null;
          if (mount.beam === "down") {
            const x1 = cx - reachPx * Math.sin(halfAng);
            const y1 = cy + reachPx * Math.cos(halfAng);
            const x2 = cx + reachPx * Math.sin(halfAng);
            coneShape = `M ${cx} ${cy} L ${x1} ${y1} L ${x2} ${y1} Z`;
          } else if (mount.beam === "up") {
            const x1 = cx - reachPx * Math.sin(halfAng);
            const y1 = cy - reachPx * Math.cos(halfAng);
            const x2 = cx + reachPx * Math.sin(halfAng);
            coneShape = `M ${cx} ${cy} L ${x1} ${y1} L ${x2} ${y1} Z`;
          } else if (mount.beam === "omni") {
            // circle
            coneShape = null;
          }
          return (
            <g key={"beam"+L.id}>
              {coneShape ? (
                <path d={coneShape}
                      fill={preset.color}
                      fillOpacity={Math.min(0.45, 0.25 + intens.v * 0.10)}
                      stroke={preset.color}
                      strokeOpacity="0.3" strokeWidth="0.5"/>
              ) : (
                <circle cx={cx} cy={cy} r={reachPx * 0.6}
                        fill={`url(#elev-grad-${L.id})`}/>
              )}
            </g>
          );
        })}

        {/* light fixtures (drawn last, on top of beams) */}
        {lights.map(L => {
          const mount = C.LIGHT_MOUNTS[L.mount];
          const preset = C.LIGHT_PRESETS[L.color];
          if (!mount || !preset) return null;
          const a = wallAlong(L, wall);
          const cx = PAD_E + a * PX_PER_CM_E;
          const cy = floorY - L.z * PX_PER_CM_E;
          return (
            <g key={"fix"+L.id}
               onMouseDown={(e) => onLightDown(e, L)}
               onClick={(e) => { e.stopPropagation(); }}
               style={{ cursor: mode === "light" ? "grab" : "default" }}>
              {/* mount-symbol */}
              {mount.label === "recessed" && (
                <g><line x1={cx-7} y1={cy} x2={cx+7} y2={cy} stroke={C.COL.ink} strokeWidth="2"/>
                   <circle cx={cx} cy={cy + 3} r="3" fill={preset.color} stroke={C.COL.ink} strokeWidth="0.6"/></g>
              )}
              {mount.label === "track" && (
                <g><line x1={cx-10} y1={cy-1} x2={cx+10} y2={cy-1} stroke={C.COL.ink} strokeWidth="2"/>
                   <rect x={cx-3} y={cy} width="6" height="5" fill={preset.color} stroke={C.COL.ink} strokeWidth="0.6"/></g>
              )}
              {mount.label === "pendant" && (
                <g><line x1={cx} y1={PAD_E} x2={cx} y2={cy-4} stroke={C.COL.ink} strokeWidth="0.8"/>
                   <circle cx={cx} cy={cy} r="5" fill={preset.color} stroke={C.COL.ink} strokeWidth="0.8"/></g>
              )}
              {mount.label === "sconce-dn" && (
                <g><rect x={cx-4} y={cy-3} width="8" height="6" fill={preset.color} stroke={C.COL.ink} strokeWidth="0.6"/></g>
              )}
              {mount.label === "sconce-up" && (
                <g><rect x={cx-4} y={cy-3} width="8" height="6" fill={preset.color} stroke={C.COL.ink} strokeWidth="0.6"/></g>
              )}
              {mount.label === "cove" && (
                <g><line x1={cx-12} y1={cy} x2={cx+12} y2={cy} stroke={C.COL.ink} strokeWidth="2"/>
                   <line x1={cx-12} y1={cy} x2={cx-12} y2={cy-4} stroke={C.COL.ink} strokeWidth="1.5"/></g>
              )}
              {mount.label === "floor-up" && (
                <g><rect x={cx-5} y={cy-2} width="10" height="4" fill={preset.color} stroke={C.COL.ink} strokeWidth="0.6"/></g>
              )}
              {mount.label === "table" && (
                <g><line x1={cx} y1={cy} x2={cx} y2={cy+12} stroke={C.COL.ink} strokeWidth="1"/>
                   <circle cx={cx} cy={cy} r="5" fill={preset.color} stroke={C.COL.ink} strokeWidth="0.6"/>
                   <line x1={cx-6} y1={cy+12} x2={cx+6} y2={cy+12} stroke={C.COL.ink} strokeWidth="1.5"/></g>
              )}
              {/* delete on shift-click handled by onclick on a small × outside fixture? for now: click in light mode removes via a Delete affordance */}
              {mode === "light" && (
                <g onClick={(e) => { e.stopPropagation(); removeLight(L.id); }} style={{ cursor: "pointer" }}>
                  <circle cx={cx + 14} cy={cy - 10} r="5" fill={C.COL.paper} stroke={C.COL.ink} strokeWidth="0.6"/>
                  <text x={cx + 14} y={cy - 8} textAnchor="middle" style={{ fontSize: "8px", fill: C.COL.ink, fontFamily: "var(--font-mono)" }}>×</text>
                </g>
              )}
            </g>
          );
        })}

        {/* avatar */}
        {sel && (
          <g stroke={C.COL.ink} strokeWidth="1.2" fill="none">
            <line x1={avatarX} y1={floorY} x2={avatarX} y2={floorY - C.AVATAR_H * PX_PER_CM_E + 10}/>
            <circle cx={avatarX} cy={floorY - C.AVATAR_H * PX_PER_CM_E + 4} r="6"/>
            <line x1={avatarX - 8} y1={floorY - 65} x2={avatarX + 8} y2={floorY - 65}/>
          </g>
        )}

        {/* floor + ceiling labels */}
        <text x={PAD_E + 4} y={floorY + 14} className="lbl ink">FLOOR · 0</text>
        <text x={PAD_E + 4} y={PAD_E - 6} className="lbl ink">CEILING · {C.CEIL_H}</text>

        {/* heights dim on right edge */}
        <g stroke={C.COL.dim} strokeWidth="0.4">
          <line x1={PAD_E + wallLenPx + 6} y1={floorY} x2={PAD_E + wallLenPx + 6} y2={PAD_E}/>
          {[100, 200, 300].map(z => {
            const y = floorY - z * PX_PER_CM_E;
            return <g key={z}>
              <line x1={PAD_E + wallLenPx + 3} y1={y} x2={PAD_E + wallLenPx + 9} y2={y}/>
              <text x={PAD_E + wallLenPx + 12} y={y + 3} className="lbl">{z}</text>
            </g>;
          })}
        </g>
      </svg>
    </div>
  );
}

window.ElevationView = ElevationView;
window.wallAlong = wallAlong;
window.reserveProjW = reserveProjW;
