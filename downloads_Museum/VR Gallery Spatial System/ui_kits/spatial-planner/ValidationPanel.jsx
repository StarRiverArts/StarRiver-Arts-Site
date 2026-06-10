/* global React, window */
// ValidationPanel.jsx — pass/fail checks for selected reserve

const C = window.SP_CONST;

function ValidationPanel({ reserve, reserves, lights, walls }) {
  if (!reserve) {
    return (
      <div className="panel">
        <div className="panel__hd">
          <div className="panel__t">validate · 驗證</div>
          <div className="panel__d mono">no selection</div>
        </div>
        <div className="panel__empty">
          Select a reserve in the plan view to validate.<br/>
          <span style={{fontFamily:"var(--font-tc)"}}>於平面圖選取一個展品預留量體以進行驗證。</span>
        </div>
      </div>
    );
  }

  const sz = C.RESERVES[reserve.size];
  const checks = [];

  // 1. Centroid at eye height — geometric centre of an exhibit sits at 130 cm.
  // The reserve volume's vertical centroid is sz.h / 2 above floor. Rule says
  // centroid should be at 130. So flag if sz.h > 260 (centroid would be above eye even if base on floor)
  // — for our reserves: S 50→25 (raised by plinth), M 100→50 (plinth), L 150→75 (plinth), XL 240→120 (plinth or floor)
  // We treat this as "plinth assumed to raise centroid to 130".
  checks.push({
    ok: sz.h <= 260,
    label: "Centroid achievable at 130 cm",
    hint: sz.h > 260
      ? `Volume too tall (${sz.h} cm) — centroid cannot reach eye height`
      : `Plinth height = ${130 - sz.h/2} cm raises centroid to eye`
  });

  // 2. Clearance — no other reserve within sz.clearance on any side
  const blocking = reserves.filter(r => {
    if (r.id === reserve.id) return false;
    const o = C.RESERVES[r.size];
    const ax1 = reserve.x - sz.clearance, ax2 = reserve.x + sz.w + sz.clearance;
    const ay1 = reserve.y - sz.clearance, ay2 = reserve.y + sz.d + sz.clearance;
    const bx1 = r.x, bx2 = r.x + o.w;
    const by1 = r.y, by2 = r.y + o.d;
    return !(ax2 <= bx1 || bx2 <= ax1 || ay2 <= by1 || by2 <= ay1);
  });
  checks.push({
    ok: blocking.length === 0,
    label: `Clearance ${sz.clearance} cm`,
    hint: blocking.length === 0
      ? `No conflicts within ${sz.clearance} cm`
      : `${blocking.length} neighbour(s) within clearance`
  });

  // 3. Wall proximity — reserve placed within reach of a wall (for hanging works ≤ M)
  // Or in centre (for L/XL room-scale works)
  const distN = reserve.y;
  const distS = C.ROOM_D - (reserve.y + sz.d);
  const distE = C.ROOM_W - (reserve.x + sz.w);
  const distW = reserve.x;
  const minWall = Math.min(distN, distS, distE, distW);
  const isHang = reserve.size === "S" || reserve.size === "M";
  const wallOk = isHang ? minWall <= 30 : true;
  checks.push({
    ok: wallOk,
    label: isHang ? "Wall-mounted (≤ 30 cm from wall)" : "Free-standing — no wall constraint",
    hint: isHang
      ? (wallOk ? `${minWall} cm from nearest wall` : `${minWall} cm from wall — move closer`)
      : `Centre of room placement OK`
  });

  // 4. Within ±15° focus cone at 150 cm distance for height direction
  // Half-angle 15° at 150 cm = 150 * tan(15°) = 40 cm vertical half-cone
  // Half height of reserve = sz.h / 2. Within cone if sz.h/2 <= 40
  const halfCone = C.DIST_STANDARD * Math.tan(C.CONE_FOCUS * Math.PI / 180);
  const inFocus = sz.h / 2 <= halfCone + 0.5;
  checks.push({
    ok: inFocus,
    label: `Within ±${C.CONE_FOCUS}° focus cone @ ${C.DIST_STANDARD} cm`,
    hint: inFocus
      ? `Half-height ${sz.h/2} cm ≤ ${halfCone.toFixed(0)} cm cone limit`
      : `Half-height ${sz.h/2} cm > cone limit — increase distance to ≥ ${(sz.h/2 / Math.tan(C.CONE_FOCUS * Math.PI/180)).toFixed(0)} cm`
  });

  // 5. Light coverage — is the reserve centre lit by at least one light?
  const LM = window.SP_LIGHT;
  if (LM && Array.isArray(lights)) {
    const centre = { x: reserve.x + sz.w / 2, y: reserve.y + sz.d / 2 };
    const hits = lights.filter(L => {
      const intens = C.LIGHT_INTENSITY[L.intensity];
      if (!intens) return false;
      const dx = centre.x - L.x, dy = centre.y - L.y;
      if (Math.hypot(dx, dy) > intens.r) return false;
      return !LM.isOccluded(L, centre, walls || []);
    });
    const ambient = LM.sampleAmbient(centre, lights, walls || []);
    checks.push({
      ok: hits.length > 0,
      label: hits.length > 0
        ? `Lit by ${hits.length} light${hits.length > 1 ? "s" : ""}`
        : "No light reaches centroid",
      hint: hits.length > 0
        ? `Ambient ≈ ${ambient || "—"} · sources: ${hits.map(L => C.LIGHT_PRESETS[L.color].cn).join(", ")}`
        : "Place a light within range, or move reserve out of shadow"
    });
  }

  return (
    <div className="panel">
      <div className="panel__hd">
        <div className="panel__t">validate · 驗證</div>
        <div className="panel__d mono">Reserve {sz.label} · {sz.w}×{sz.d}×{sz.h}</div>
      </div>

      <ul className="checks">
        {checks.map((c, i) => (
          <li key={i} className={"check" + (c.ok ? " ok" : " bad")}>
            <span className="check__m">{c.ok ? "✓" : "✗"}</span>
            <div>
              <div className="check__l">{c.label}</div>
              <div className="check__h">{c.hint}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="panel__foot">
        <div className="kvline"><span className="lbl">position</span><span className="mono">({reserve.x}, {reserve.y})</span></div>
        <div className="kvline"><span className="lbl">volume</span><span className="mono">{sz.w} × {sz.d} × {sz.h} cm</span></div>
        <div className="kvline"><span className="lbl">clearance</span><span className="mono">{sz.clearance} cm</span></div>
      </div>
    </div>
  );
}

window.ValidationPanel = ValidationPanel;
