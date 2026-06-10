/* global React, window */
// PlanView.jsx — top-down SVG of the room
// Modes: reserve | wall | light
//   reserve: click to place / drag a reserve volume
//   wall:    click two points to draw a wall segment
//   light:   click to place a light source
// Lights cast shadow polygons through walls.

const { useRef, useState, useEffect } = React;
const C = window.SP_CONST;
const LM = window.SP_LIGHT;

const PX_PER_CM = 0.7;
const PAD = 50;
const VBW = C.ROOM_W * PX_PER_CM + PAD * 2;
const VBH = C.ROOM_D * PX_PER_CM + PAD * 2;

const cm2px = (cm) => cm * PX_PER_CM;
const snap  = (cm) => Math.round(cm / C.GRID_CM) * C.GRID_CM;

function PlanView(props) {
  const {
    mode, tool,
    reserves, selectedId, setSelectedId, addReserve, moveReserve,
    walls,    wallMaterial, addWall,    removeWall,
    lights,   lightColor, lightIntensity, addLight, removeLight
  } = props;

  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [pendingWall, setPendingWall] = useState(null);
  const [hover, setHover] = useState(null);    // current cursor cm coords

  function ptToCm(e) {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM().inverse();
    const local = pt.matrixTransform(ctm);
    return { x: (local.x - PAD) / PX_PER_CM, y: (local.y - PAD) / PX_PER_CM };
  }

  function onSvgClick(e) {
    const { x, y } = ptToCm(e);
    if (x < 0 || y < 0 || x > C.ROOM_W || y > C.ROOM_D) return;

    if (mode === "reserve") {
      if (!tool) return;
      const sz = C.RESERVES[tool];
      const nx = snap(Math.max(0, Math.min(C.ROOM_W - sz.w, x - sz.w / 2)));
      const ny = snap(Math.max(0, Math.min(C.ROOM_D - sz.d, y - sz.d / 2)));
      addReserve({ size: tool, x: nx, y: ny });
    } else if (mode === "wall") {
      const sx = snap(x), sy = snap(y);
      if (!pendingWall) {
        setPendingWall({ x1: sx, y1: sy });
      } else {
        if (Math.hypot(sx - pendingWall.x1, sy - pendingWall.y1) < 10) {
          setPendingWall(null); // cancel by clicking same spot
          return;
        }
        addWall({ x1: pendingWall.x1, y1: pendingWall.y1, x2: sx, y2: sy, material: wallMaterial });
        setPendingWall(null);
      }
    } else if (mode === "light") {
      addLight({ x: snap(x), y: snap(y), color: lightColor, intensity: lightIntensity, mount: props.lightMount, z: props.lightZ, type: "point" });
    }
  }

  function onReserveDown(e, r) {
    if (mode !== "reserve") return;
    e.stopPropagation();
    setSelectedId(r.id);
    const { x, y } = ptToCm(e);
    setDrag({ id: r.id, dx: x - r.x, dy: y - r.y });
  }
  function onMove(e) {
    const cur = ptToCm(e);
    setHover(cur);
    if (!drag) return;
    const r = reserves.find(rr => rr.id === drag.id);
    if (!r) return;
    const sz = C.RESERVES[r.size];
    const nx = snap(Math.max(0, Math.min(C.ROOM_W - sz.w, cur.x - drag.dx)));
    const ny = snap(Math.max(0, Math.min(C.ROOM_D - sz.d, cur.y - drag.dy)));
    moveReserve(drag.id, nx, ny);
  }
  function onUp() { setDrag(null); }

  useEffect(() => {
    if (!drag) return;
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [drag]);

  // grid 100cm
  const grid = [];
  for (let x = 0; x <= C.ROOM_W; x += 100) {
    grid.push(<line key={"vx"+x} x1={PAD + cm2px(x)} y1={PAD} x2={PAD + cm2px(x)} y2={PAD + cm2px(C.ROOM_D)} stroke={C.COL.rule} strokeWidth="0.4"/>);
  }
  for (let y = 0; y <= C.ROOM_D; y += 100) {
    grid.push(<line key={"hy"+y} x1={PAD} y1={PAD + cm2px(y)} x2={PAD + cm2px(C.ROOM_W)} y2={PAD + cm2px(y)} stroke={C.COL.rule} strokeWidth="0.4"/>);
  }

  // Outer-wall segments — derived from the chosen room shape polygon.
  const shapeKey = props.roomShape || "rect";
  const roomPoly = (C.ROOM_SHAPES[shapeKey] || C.ROOM_SHAPES.rect).points;
  const perimeter = LM.polyToWalls(roomPoly, "solid");
  const allWalls = [...walls, ...perimeter];
  const polyPointsAttr = roomPoly.map(p => `${PAD + cm2px(p.x)},${PAD + cm2px(p.y)}`).join(" ");

  return (
    <div className="canvas">
      <div className="canvas__hd">
        <div className="canvas__t">平面圖 · Plan</div>
        <div className="canvas__d mono">
          {C.ROOM_W/100}×{C.ROOM_D/100} m · 1:50 · grid 100 cm
          {hover ? ` · cursor (${Math.round(hover.x)}, ${Math.round(hover.y)})` : ""}
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VBW} ${VBH}`}
        className={"svg svg--plan" + (mode !== "reserve" || tool ? " is-placing" : "")}
        onClick={onSvgClick}
        onMouseMove={onMove}
      >
        <defs>
          {/* per-light gradient + mask + reflection gradients */}
          {lights.map(L => {
            const preset = C.LIGHT_PRESETS[L.color];
            const intens = C.LIGHT_INTENSITY[L.intensity];
            if (!preset || !intens) return null;
            const cx = PAD + cm2px(L.x), cy = PAD + cm2px(L.y);
            const rPx = cm2px(intens.r);
            const refl = LM.computeReflections(L, allWalls, allWalls);
            return (
              <React.Fragment key={"defs"+L.id}>
                <radialGradient id={`grad-${L.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%"  stopColor={preset.color} stopOpacity={Math.min(0.85, 0.55 * intens.v)}/>
                  <stop offset="50%" stopColor={preset.color} stopOpacity={Math.min(0.4, 0.25 * intens.v)}/>
                  <stop offset="100%" stopColor={preset.color} stopOpacity="0"/>
                </radialGradient>
                <mask id={`mask-${L.id}`} maskUnits="userSpaceOnUse"
                      x={cx - rPx} y={cy - rPx} width={rPx * 2} height={rPx * 2}>
                  <rect x={cx - rPx} y={cy - rPx} width={rPx * 2} height={rPx * 2} fill="white"/>
                  {allWalls.map((w, i) => {
                    const op = LM.wallShadowOpacity(w);
                    if (op < 0.05) return null;
                    const poly = LM.shadowPolygon(L, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 });
                    const pts = poly.map(p => `${PAD + cm2px(p.x)},${PAD + cm2px(p.y)}`).join(" ");
                    return <polygon key={`shadow-${L.id}-${i}`} points={pts}
                                    fill="black" fillOpacity={op}/>;
                  })}
                </mask>
                {/* reflection gradients — one per bounce */}
                {refl.map((r, ri) => (
                  <radialGradient key={`refl-grad-${L.id}-${ri}`} id={`refl-grad-${L.id}-${ri}`}
                                  cx="50%" cy="50%" r="50%">
                    <stop offset="0%"  stopColor={preset.color} stopOpacity={Math.min(0.45, 0.55 * r.strength)}/>
                    <stop offset="60%" stopColor={preset.color} stopOpacity={Math.min(0.2, 0.25 * r.strength)}/>
                    <stop offset="100%" stopColor={preset.color} stopOpacity="0"/>
                  </radialGradient>
                ))}
              </React.Fragment>
            );
          })}
        </defs>

        {/* env zone outside east */}
        <rect x={PAD + cm2px(C.ROOM_W)} y={PAD} width={PAD - 6}
              height={cm2px(C.ROOM_D)} fill={C.COL.env} fillOpacity="0.18"/>
        <text x={PAD + cm2px(C.ROOM_W) + 4} y={PAD + 12} className="lbl">ENV</text>

        {/* room body fill — polygon for non-rect shapes */}
        <polygon points={polyPointsAttr}
                 fill={C.COL.body} fillOpacity="0.35"/>

        {grid}

        {/* light pools — layered below walls/reserves so walls appear to occlude */}
        {lights.map(L => {
          const intens = C.LIGHT_INTENSITY[L.intensity];
          if (!intens) return null;
          const cx = PAD + cm2px(L.x), cy = PAD + cm2px(L.y);
          const rPx = cm2px(intens.r);
          return (
            <g key={"pool-"+L.id} mask={`url(#mask-${L.id})`}>
              <circle cx={cx} cy={cy} r={rPx} fill={`url(#grad-${L.id})`}/>
            </g>
          );
        })}

        {/* reflected light bounces — drawn after the direct pools, with their own
            short-radius gradients. Visually communicates how walls bounce light back. */}
        {lights.map(L => {
          const preset = C.LIGHT_PRESETS[L.color];
          if (!preset) return null;
          const refl = LM.computeReflections(L, allWalls, allWalls);
          return refl.map((r, ri) => {
            const cx = PAD + cm2px(r.x), cy = PAD + cm2px(r.y);
            const rPx = cm2px(r.radius);
            return (
              <g key={`refl-${L.id}-${ri}`}>
                <circle cx={cx} cy={cy} r={rPx} fill={`url(#refl-grad-${L.id}-${ri})`}/>
                {/* tiny tick on the wall marking the bounce origin */}
                <circle cx={cx} cy={cy} r="1.5" fill={preset.color}
                        stroke={C.COL.ink} strokeWidth="0.4"/>
              </g>
            );
          });
        })}

        {/* outer walls — 2px ink, polygon outline */}
        <polygon points={polyPointsAttr}
                 fill="none" stroke={C.COL.ink} strokeWidth="2"/>

        {/* door cut on east wall (visual) — only meaningful for rect / corridor */}
        {(shapeKey === "rect" || shapeKey === "corridor") && (
          <line x1={PAD + cm2px(C.ROOM_W)} y1={PAD + cm2px(300)}
                x2={PAD + cm2px(C.ROOM_W)} y2={PAD + cm2px(390)}
                stroke={C.COL.paper2} strokeWidth="3"/>
        )}

        {/* interior walls */}
        {walls.map(w => {
          const m = C.WALL_MATERIALS[w.material || "solid"];
          let stroke = C.COL.ink, dash = "0", sw = 2;
          if (w.material === "glass") { stroke = "#6FA8C6"; dash = "0"; sw = 1.5; }
          if (w.material === "voile") { dash = "3 3"; sw = 1.5; }
          return (
            <g key={"w"+w.id} onClick={(e) => { e.stopPropagation(); if (mode === "wall") removeWall(w.id); }}>
              <line x1={PAD + cm2px(w.x1)} y1={PAD + cm2px(w.y1)}
                    x2={PAD + cm2px(w.x2)} y2={PAD + cm2px(w.y2)}
                    stroke={stroke} strokeWidth={sw} strokeDasharray={dash}
                    style={{ cursor: mode === "wall" ? "pointer" : "default" }}/>
              {/* endpoints */}
              <circle cx={PAD + cm2px(w.x1)} cy={PAD + cm2px(w.y1)} r="2" fill={stroke}/>
              <circle cx={PAD + cm2px(w.x2)} cy={PAD + cm2px(w.y2)} r="2" fill={stroke}/>
            </g>
          );
        })}

        {/* pending wall preview */}
        {pendingWall && hover && (
          <g>
            <line x1={PAD + cm2px(pendingWall.x1)} y1={PAD + cm2px(pendingWall.y1)}
                  x2={PAD + cm2px(snap(hover.x))} y2={PAD + cm2px(snap(hover.y))}
                  stroke={C.COL.dim} strokeWidth="1.5" strokeDasharray="3 3"/>
            <circle cx={PAD + cm2px(pendingWall.x1)} cy={PAD + cm2px(pendingWall.y1)} r="3" fill={C.COL.dim}/>
          </g>
        )}

        {/* reserves */}
        {reserves.map(r => {
          const sz = C.RESERVES[r.size];
          const isSel = r.id === selectedId;
          return (
            <g key={r.id}
               transform={`translate(${PAD + cm2px(r.x)},${PAD + cm2px(r.y)})`}
               className={"resv" + (isSel ? " is-sel" : "")}
               onMouseDown={(e) => onReserveDown(e, r)}>
              {isSel && (
                <rect x={-cm2px(sz.clearance)} y={-cm2px(sz.clearance)}
                      width={cm2px(sz.w + sz.clearance * 2)}
                      height={cm2px(sz.d + sz.clearance * 2)}
                      fill="none" stroke={C.COL.dim} strokeWidth="0.5"
                      strokeDasharray="3 2"/>
              )}
              <rect x="0" y="0" width={cm2px(sz.w)} height={cm2px(sz.d)}
                    fill={C.COL.body} stroke={C.COL.ink}
                    strokeWidth={isSel ? "1.5" : "1"}/>
              <text x={cm2px(sz.w)/2} y={cm2px(sz.d)/2 + 3}
                    textAnchor="middle" className="resv__l">{sz.label}</text>
            </g>
          );
        })}

        {/* lights — sun-mark glyphs */}
        {lights.map(L => {
          const preset = C.LIGHT_PRESETS[L.color];
          const intens = C.LIGHT_INTENSITY[L.intensity];
          if (!preset || !intens) return null;
          const cx = PAD + cm2px(L.x), cy = PAD + cm2px(L.y);
          return (
            <g key={"L"+L.id} className="light"
               onClick={(e) => { e.stopPropagation(); if (mode === "light") removeLight(L.id); }}
               style={{ cursor: mode === "light" ? "pointer" : "default" }}>
              <circle cx={cx} cy={cy} r="6" fill={preset.color} stroke={C.COL.ink} strokeWidth="1"/>
              {/* spokes */}
              {[0,45,90,135].map(deg => {
                const a = deg * Math.PI / 180;
                return <line key={deg}
                  x1={cx + Math.cos(a)*7}   y1={cy + Math.sin(a)*7}
                  x2={cx + Math.cos(a)*11}  y2={cy + Math.sin(a)*11}
                  stroke={C.COL.ink} strokeWidth="0.8"/>;
              })}
              {[0,45,90,135].map(deg => {
                const a = (deg + 180) * Math.PI / 180;
                return <line key={"s"+deg}
                  x1={cx + Math.cos(a)*7}   y1={cy + Math.sin(a)*7}
                  x2={cx + Math.cos(a)*11}  y2={cy + Math.sin(a)*11}
                  stroke={C.COL.ink} strokeWidth="0.8"/>;
              })}
              <text x={cx + 14} y={cy + 3} className="lbl ink">{preset.cn} · {intens.label}</text>
            </g>
          );
        })}

        {/* north arrow */}
        <g transform={`translate(${VBW - 28},${VBH - 28})`}>
          <circle r="12" fill={C.COL.paper} stroke={C.COL.ink} strokeWidth="0.8"/>
          <path d="M0 -11 L4 6 L0 3 L-4 6 Z" fill={C.COL.ink}/>
          <text x="-3" y="-15" className="lbl">N</text>
        </g>

        {/* scale */}
        <g transform={`translate(${PAD},${VBH - 18})`}>
          <line x1="0" y1="0" x2={cm2px(300)} y2="0" stroke={C.COL.ink} strokeWidth="1"/>
          <line x1="0" y1="-3" x2="0" y2="3" stroke={C.COL.ink}/>
          <line x1={cm2px(100)} y1="-3" x2={cm2px(100)} y2="3" stroke={C.COL.ink}/>
          <line x1={cm2px(200)} y1="-3" x2={cm2px(200)} y2="3" stroke={C.COL.ink}/>
          <line x1={cm2px(300)} y1="-3" x2={cm2px(300)} y2="3" stroke={C.COL.ink}/>
          <text x="-3" y="-7" className="lbl">0</text>
          <text x={cm2px(300) - 12} y="-7" className="lbl">3 m</text>
        </g>
      </svg>
    </div>
  );
}

window.PlanView = PlanView;
