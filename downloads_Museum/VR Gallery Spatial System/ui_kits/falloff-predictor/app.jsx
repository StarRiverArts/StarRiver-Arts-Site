/* global React, ReactDOM */
// Falloff Predictor — predict illuminance, rendered colour, drift, and a verdict.

const { useMemo, useState } = React;

// ---------- Presets ----------
const LIGHT_PRESETS = {
  warm:    { color: "#FFD18A", label: "3200K · warm",  cn: "暖光" },
  key:     { color: "#FFE7B5", label: "5000K · key",   cn: "主光" },
  cool:    { color: "#BFD3EF", label: "5600K · cool",  cn: "冷光" },
  env:     { color: "#9CC069", label: "env tint",      cn: "自然" }
};

const SURFACE_PRESETS = {
  body:  { color: "#EEEEEE", label: "body limestone", cn: "本體・石灰岩" },
  oak:   { color: "#E8D9B0", label: "warm oak",       cn: "暖・橡木" },
  marble:{ color: "#DEE0EA", label: "cool marble",    cn: "冷・大理石" },
  moss:  { color: "#5E8D34", label: "env moss",       cn: "自然・苔" }
};

const MODELS = [
  { id: "isq",    label: "inverse-square", note: "Unity HDRP / URP physical" },
  { id: "smooth", label: "smooth",         note: "Unreal · URP smooth"       },
  { id: "linear", label: "linear",         note: "Unity Built-in · lilToon"  },
  { id: "const",  label: "constant",       note: "baked-emission flats"      }
];

const MODEL_COLOR = { isq: "#1A1A1A", smooth: "#B47B2E", linear: "#6FA8C6", const: "#9C6FA8" };

// ---------- math ----------
function hexToRgb(h) {
  const x = h.replace("#",""); return [parseInt(x.slice(0,2),16), parseInt(x.slice(2,4),16), parseInt(x.slice(4,6),16)];
}
function rgbToHex(r, g, b) {
  const c = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return "#" + (c(r) + c(g) + c(b)).toUpperCase();
}
function srgbToLin(c) { c /= 255; return c <= 0.04045 ? c/12.92 : Math.pow((c + 0.055)/1.055, 2.4); }
function linToSrgb(c) { c = c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c, 1/2.4) - 0.055; return c * 255; }
function rgbToLab(r, g, b) {
  // sRGB → linear → XYZ (D65) → Lab
  const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
  let X = R*0.4124564 + G*0.3575761 + B*0.1804375;
  let Y = R*0.2126729 + G*0.7151522 + B*0.0721750;
  let Z = R*0.0193339 + G*0.1191920 + B*0.9503041;
  X/=0.95047; Y/=1.00000; Z/=1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787*t + 16/116);
  const L = 116*f(Y) - 16, a = 500*(f(X) - f(Y)), bb = 200*(f(Y) - f(Z));
  return [L, a, bb];
}
function deltaE(c1, c2) {
  const a = rgbToLab(...c1), b = rgbToLab(...c2);
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

// Δ vector in Lab — used to drive the step-by-step verdict.
function labDelta(c1, c2) {
  const a = rgbToLab(...c1), b = rgbToLab(...c2);
  return { dL: b[0] - a[0], da: b[1] - a[1], db: b[2] - a[2] };
}

// f(d) — relative attenuation, normalized so f(1m) ≈ 1.
function falloff(model, d, R) {
  if (d < 0.05) d = 0.05;
  switch (model) {
    case "isq":    return 1 / (d * d);
    case "linear": {
      // f(d) = max(0, (R - d) / (R - 1))
      if (R <= 1) return d < R ? 1 : 0;
      return Math.max(0, (R - d) / (R - 1));
    }
    case "smooth": {
      const w = Math.max(0, 1 - Math.pow(d / R, 4));
      return (w * w) / (d * d);
    }
    case "const":  return d <= R ? 1 : 0;
  }
  return 0;
}

// Illuminance at distance for a given I0 (lux at 1m reference).
function illuminance(model, I0, d, R) { return I0 * falloff(model, d, R); }

// Render: surface albedo × light tint × exposure
function rendered(albedoHex, lightHex, illum, ref) {
  const A = hexToRgb(albedoHex);
  const L = hexToRgb(lightHex);
  // Light tint = light colour normalized so brightest channel = 1; preserves chromaticity
  const m = Math.max(L[0], L[1], L[2]) || 1;
  const tint = [L[0]/m, L[1]/m, L[2]/m];
  // Exposure: clamp to a soft curve so very bright doesn't just clip to white
  const expo = Math.min(2.4, Math.max(0, illum / ref));
  // Apply: per-channel multiplicative in linear, then back to srgb
  const out = [0,1,2].map(i => {
    const albLin = srgbToLin(A[i]);
    const tintLin = tint[i]; // tint already linear-ish for our hue-pure presets; OK approx
    let v = albLin * tintLin * expo;
    // soft clip
    v = v / (1 + v * 0.3);
    return linToSrgb(v);
  });
  return out;
}

// ---------- components ----------
function Pick({ items, value, onChange, swatch }) {
  return (
    <div className="ctrl__row">
      {Object.entries(items).map(([k, v]) => (
        <button key={k} className={"pick" + (value === k ? " is-on" : "") + (swatch ? " pick--sw" : "")}
                onClick={() => onChange(k)}>
          {swatch && <span className="sw" style={{ background: v.color }}></span>}
          <span>{v.label || k}</span>
          {v.cn && <span className="pick__d">{v.cn}</span>}
        </button>
      ))}
    </div>
  );
}

function CurvePlot({ I0, R, refLux, model, d }) {
  // d ranges 0.3..8m
  const dMin = 0.3, dMax = 8;
  const W = 100, H = 100;
  // log-y illuminance axis: 1..3000 lux
  const Imin = 1, Imax = 3000;
  const yOf = (v) => {
    const ly = (Math.log10(Math.max(Imin, v)) - Math.log10(Imin)) / (Math.log10(Imax) - Math.log10(Imin));
    return H - ly * H;
  };
  const xOf = (dd) => ((dd - dMin) / (dMax - dMin)) * W;

  const N = 60;
  const paths = MODELS.map(m => {
    let pts = [];
    for (let i = 0; i <= N; i++) {
      const dd = dMin + (dMax - dMin) * (i / N);
      const v = illuminance(m.id, I0, dd, R);
      pts.push(`${xOf(dd).toFixed(2)},${yOf(Math.max(0.5, v)).toFixed(2)}`);
    }
    return { id: m.id, d: "M " + pts.join(" L ") };
  });

  // ref line
  const yRef = yOf(refLux);
  // gridlines at 50, 200, 500, 1500 lux
  const yLines = [50, 200, 500, 1500];

  // current-d marker
  const xCur = xOf(d);
  const curV = illuminance(model, I0, d, R);
  const yCur = yOf(Math.max(0.5, curV));

  return (
    <div className="plot">
      <svg viewBox={`-6 -6 ${W + 18} ${H + 16}`} preserveAspectRatio="none">
        {/* gridlines */}
        {yLines.map(v => (
          <g key={v}>
            <line x1={0} y1={yOf(v)} x2={W} y2={yOf(v)} stroke="#E0DED7" strokeWidth="0.3"/>
            <text x={-2} y={yOf(v) + 1.6} textAnchor="end"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "3px", fill: "#8A8985" }}>{v}</text>
          </g>
        ))}
        {/* x ticks */}
        {[1, 2, 3, 4, 5, 6, 7].map(dd => (
          <g key={dd}>
            <line x1={xOf(dd)} y1={0} x2={xOf(dd)} y2={H} stroke="#E0DED7" strokeWidth="0.3"/>
            <text x={xOf(dd)} y={H + 5} textAnchor="middle"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "3px", fill: "#8A8985" }}>{dd} m</text>
          </g>
        ))}
        {/* reference (target band) */}
        <line x1={0} y1={yRef} x2={W} y2={yRef} stroke="#B47B2E" strokeWidth="0.4" strokeDasharray="1 1.2"/>

        {/* curves */}
        {paths.map(p => (
          <path key={p.id} d={p.d}
                fill="none"
                stroke={MODEL_COLOR[p.id]}
                strokeWidth={p.id === model ? 0.9 : 0.4}
                strokeOpacity={p.id === model ? 1 : 0.5}/>
        ))}

        {/* current marker */}
        <circle cx={xCur} cy={yCur} r="1.5" fill={MODEL_COLOR[model]} stroke="#FAFAF7" strokeWidth="0.4"/>
        <text x={xCur} y={yCur - 3} textAnchor="middle"
              style={{ fontFamily: "var(--font-mono)", fontSize: "3px", fill: "#1A1A1A", fontWeight: 500 }}>
          {curV >= 1 ? curV.toFixed(0) : curV.toFixed(2)} lx
        </text>
      </svg>
    </div>
  );
}

function App() {
  const [light, setLight] = useState("key");
  const [surface, setSurface] = useState("body");
  const [model, setModel] = useState("isq");
  const [I0, setI0] = useState(800);    // lux at 1m
  const [R, setR] = useState(6);        // range m
  const [d, setD] = useState(1.5);      // viewing distance m
  const [refLux, setRefLux] = useState(300);  // reference illuminance lux (gallery default ~300)

  const L = LIGHT_PRESETS[light];
  const S = SURFACE_PRESETS[surface];

  const stats = useMemo(() => {
    const illum = illuminance(model, I0, d, R);
    const renderedRgb = rendered(S.color, L.color, illum, refLux);
    const renderedHex = rgbToHex(...renderedRgb);
    const dE = deltaE(hexToRgb(S.color), renderedRgb);
    const delta = labDelta(hexToRgb(S.color), renderedRgb);
    let band, bandClass;
    if (illum < 50)           { band = "under-lit",       bandClass = "bad";  }
    else if (illum < 200)     { band = "dim · silhouette",bandClass = "warn"; }
    else if (illum < 500)     { band = "standard",        bandClass = "ok";   }
    else if (illum < 1500)    { band = "bright · hero",   bandClass = "ok";   }
    else                      { band = "over-lit",        bandClass = "bad";  }
    let driftClass = dE <= 3 ? "ok" : dE <= 8 ? "warn" : "bad";
    return { illum, renderedHex, dE, delta, band, bandClass, driftClass };
  }, [light, surface, model, I0, R, d, refLux]);

  // ---- Step-by-step verdict ----
  // Each step optionally carries an `apply` thunk; the UI renders an "apply"
  // button that runs the thunk and reports the resulting state.
  const verdict = useMemo(() => {
    const { illum, dE, delta, band, bandClass, driftClass } = stats;
    const steps = []; let cls = "ok"; let head = "";
    const targetLux = refLux;

    // -------- exposure issues first --------
    if (illum < 50) {
      cls = "bad";
      head = `Under-lit · ${Math.round(illum)} lx (target ${targetLux} lx)`;
      const f = falloff(model, d, R) || 1e-6;
      const I0new = Math.min(3000, Math.ceil((targetLux / f) / 10) * 10);
      let dnew = d;
      if (model === "isq")    dnew = Math.sqrt(I0 / targetLux);
      else if (model === "linear") dnew = R - (targetLux / I0) * (R - 1);
      else if (model === "smooth") dnew = Math.sqrt(I0 / targetLux);
      else                    dnew = R / 2;
      dnew = Math.max(0.3, Math.min(8, dnew));
      steps.push({ tag: "LIGHT", t: `Raise I₀ to ${I0new} lx @ 1 m`, h: `${I0} → ${I0new} brings d = ${d.toFixed(1)} m into band`,
                   apply: () => setI0(I0new) });
      steps.push({ tag: "LIGHT", t: `Or move closer · d = ${dnew.toFixed(1)} m`, h: `keeps current I₀ ${I0} lx`,
                   apply: () => setD(+dnew.toFixed(2)) });
      steps.push({ tag: "GUARD", t: "Do not bake yet", h: "Material adjustment cannot save under-lit surfaces" });
    }
    else if (illum > 1500) {
      cls = "bad";
      head = `Over-lit · ${Math.round(illum)} lx (target ${targetLux} lx)`;
      const f = falloff(model, d, R) || 1e-6;
      const I0new = Math.max(50, Math.floor((targetLux / f) / 10) * 10);
      let dnew = d;
      if (model === "isq")    dnew = Math.sqrt(I0 / targetLux);
      else if (model === "linear") dnew = R - (targetLux / I0) * (R - 1);
      else if (model === "smooth") dnew = Math.sqrt(I0 / targetLux);
      else                    dnew = R;
      dnew = Math.max(0.3, Math.min(8, dnew));
      steps.push({ tag: "LIGHT", t: `Drop I₀ to ${I0new} lx @ 1 m`, h: `removes the highlight clip`,
                   apply: () => setI0(I0new) });
      steps.push({ tag: "LIGHT", t: `Or move back · d = ${dnew.toFixed(1)} m`, h: `keeps current I₀ but exposure falls to target`,
                   apply: () => setD(+dnew.toFixed(2)) });
      steps.push({ tag: "GUARD", t: "Material tint is useless here", h: "When illuminance clips, no albedo change reads — re-light first" });
    }
    else if (driftClass === "bad" || driftClass === "warn") {
      cls = driftClass;
      head = `Drift ${dE.toFixed(1)} ΔE · cast ${delta.da > 4 ? "warm" : delta.da < -4 ? "cool" : delta.db > 4 ? "yellow" : delta.db < -4 ? "blue" : "neutral"}`;
      const isWarm = (delta.da + delta.db) > 0;
      // Pick a neighbouring light preset based on cast direction.
      let nextLight = light;
      if (isWarm) {
        if (light === "warm") nextLight = "key";
        else if (light === "key") nextLight = "cool";
        else if (light === "env") nextLight = "key";
        else nextLight = "cool";
      } else {
        if (light === "cool") nextLight = "key";
        else if (light === "key") nextLight = "warm";
        else nextLight = "warm";
      }
      const nextLightLabel = LIGHT_PRESETS[nextLight].label;
      steps.push({
        tag: "LIGHT",
        t: `Switch light to ${nextLightLabel}`,
        h: `${LIGHT_PRESETS[light].label} → ${nextLightLabel} compensates ${Math.abs(delta.db).toFixed(1)} ${isWarm ? "warm" : "cool"} cast`,
        apply: () => setLight(nextLight)
      });
      // Material direction
      const matShiftHueA = isWarm ? "cool · −a / −b" : "warm · +a / +b";
      const pct = Math.min(8, Math.max(2, Math.round(dE * 0.6)));
      steps.push({
        tag: "MATL",
        t: `Or shift albedo ${matShiftHueA} by ${pct}%`,
        h: `locks to this lighting only — re-do if light changes`
      });
      if (driftClass === "bad") {
        steps.push({
          tag: "BOTH",
          t: `Best result · combine: light −1 step + material ${Math.floor(pct/2)}% counter-tint`,
          h: `each path halves the drift; together brings ΔE under 3`
        });
      }
      steps.push({
        tag: "VERIFY",
        t: `Re-bake only after ΔE < 3 and illuminance in band`,
        h: `current: ${dE.toFixed(1)} ΔE · ${Math.round(illum)} lx · ${band}`
      });
    }
    else {
      cls = "ok";
      head = `On target · ${Math.round(illum)} lx · ΔE ${dE.toFixed(1)}`;
      steps.push({ tag: "OK", t: "Safe to bake", h: `surface drift ${dE.toFixed(2)} ΔE within just-noticeable threshold` });
      steps.push({ tag: "OK", t: "Lock the light + material", h: "version-pin both presets before exporting" });
    }
    return { cls, head, steps };
  }, [stats, refLux, model, I0, R, d, light]);

  return (
    <div className="grid">
      <div className="card-box">
        <div className="card-box__hd"><div className="card-box__t">control · 控制</div></div>
        <div className="card-box__body">

          <div className="ctrl">
            <div className="ctrl__lbl"><span>light · 光源</span><span className="val">{L.label}</span></div>
            <Pick items={LIGHT_PRESETS} value={light} onChange={setLight} swatch/>
          </div>

          <div className="ctrl">
            <div className="ctrl__lbl"><span>surface · 材質</span><span className="val">{S.label}</span></div>
            <Pick items={SURFACE_PRESETS} value={surface} onChange={setSurface} swatch/>
          </div>

          <div className="ctrl">
            <div className="ctrl__lbl"><span>falloff · 衰減模型</span><span className="val">{MODELS.find(m=>m.id===model).note}</span></div>
            <Pick items={Object.fromEntries(MODELS.map(m => [m.id, { label: m.label, cn: m.note }]))} value={model} onChange={setModel}/>
          </div>

          <div className="ctrl">
            <div className="ctrl__lbl"><span>I₀ · 1m intensity</span><span className="val">{I0} lux @ 1 m</span></div>
            <input type="range" min="50" max="3000" step="10" value={I0} onChange={(e) => setI0(+e.target.value)}/>
          </div>

          <div className="ctrl">
            <div className="ctrl__lbl"><span>range · 衰減距離</span><span className="val">{R.toFixed(1)} m</span></div>
            <input type="range" min="1" max="15" step="0.5" value={R} onChange={(e) => setR(+e.target.value)}/>
          </div>

          <div className="ctrl">
            <div className="ctrl__lbl"><span>d · 觀看距離</span><span className="val">{d.toFixed(2)} m</span></div>
            <input type="range" min="0.3" max="8" step="0.05" value={d} onChange={(e) => setD(+e.target.value)}/>
          </div>

          <div className="ctrl">
            <div className="ctrl__lbl"><span>target illum · 目標照度</span><span className="val">{refLux} lux</span></div>
            <input type="range" min="50" max="1500" step="10" value={refLux} onChange={(e) => setRefLux(+e.target.value)}/>
          </div>
        </div>
      </div>

      <div>
        <div className="card-box">
          <div className="card-box__hd">
            <div className="card-box__t">render preview · 即時渲染</div>
            <div className="card-box__d">albedo × light × falloff</div>
          </div>
          <div className="card-box__body">
            <div className="outs">
              <div className="stage" style={{ background: stats.renderedHex }}>
                <div className="stage__lbl" style={{ color: "#FFF", mixBlendMode: "difference" }}>{stats.renderedHex}</div>
              </div>
              <div>
                <div className="stats">
                  <div><div className="k">target</div><div className="v">{S.color}</div></div>
                  <div><div className="k">rendered</div><div className="v">{stats.renderedHex}</div></div>
                  <div><div className="k">illuminance</div><div className={"v " + stats.bandClass}>{stats.illum.toFixed(0)} lx</div></div>
                  <div><div className="k">ΔE drift</div><div className={"v " + stats.driftClass}>{stats.dE.toFixed(2)}</div></div>
                  <div style={{ gridColumn: "1 / -1" }}><div className="k">band</div><div className={"v " + stats.bandClass}>{stats.band}</div></div>
                </div>
                <div className={"verdict " + verdict.cls}>
                  <div className="verdict__hd">{verdict.head}</div>
                  <ol className="verdict__steps">
                    {verdict.steps.map((s, i) => (
                      <li key={i} className={`step step--${s.tag.toLowerCase()}`}>
                        <span className="step__n">{s.tag}</span>
                        <div>
                          <div className="step__t">{s.t}</div>
                          <div className="step__h">{s.h}</div>
                        </div>
                        {s.apply && (
                          <button className="step__apply" onClick={s.apply}>apply →</button>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-box" style={{ marginTop: 16 }}>
          <div className="card-box__hd">
            <div className="card-box__t">falloff curves · 衰減曲線</div>
            <div className="card-box__d">log lux · 0.3–8 m</div>
          </div>
          <div className="card-box__body">
            <CurvePlot I0={I0} R={R} refLux={refLux} model={model} d={d}/>
            <div className="legend">
              {MODELS.map(m => (
                <span key={m.id}>
                  <i style={{ background: MODEL_COLOR[m.id] }}></i>
                  <b style={{ color: model === m.id ? "var(--ink)" : "var(--ink-3)" }}>{m.label}</b>
                </span>
              ))}
              <span><i style={{ background: "#B47B2E" }}></i>target illum reference</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
