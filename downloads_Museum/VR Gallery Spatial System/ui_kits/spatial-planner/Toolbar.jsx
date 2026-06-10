/* global React, window */
// Toolbar.jsx — mode tabs + per-mode pickers (reserve / wall / light)

const C = window.SP_CONST;

function Toolbar({
  mode, setMode,
  tool, setTool,
  roomShape, setRoomShape,
  lightColor, setLightColor,
  lightIntensity, setLightIntensity,
  lightMount, setLightMount,
  lightZ, setLightZ,
  wallMaterial, setWallMaterial,
  wall, setWall,
  count, onClear, onPreset
}) {
  const modes = [
    { id: "reserve", label: "Reserve", cn: "預留" },
    { id: "wall",    label: "Wall",    cn: "牆"   },
    { id: "light",   label: "Light",   cn: "光"   }
  ];

  return (
    <div className="toolbar">
      {/* Mode tabs */}
      <div className="tb__sec">
        <div className="tb__label">mode · 模式</div>
        <div className="tb__row">
          {modes.map(m => (
            <button key={m.id}
              className={"tab" + (mode === m.id ? " is-on" : "")}
              onClick={() => { setMode(m.id); setTool(null); }}>
              <span className="tab__l">{m.label}</span>
              <span className="tab__d">{m.cn}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tb__sec">
        <div className="tb__label">room · 平面</div>
        <div className="tb__row tb__row--wrap">
          {Object.entries(C.ROOM_SHAPES).map(([k, v]) => (
            <button key={k}
              className={"chip chip--sm" + (roomShape === k ? " is-on" : "")}
              onClick={() => setRoomShape(k)}>
              <span className="chip__l">{v.label}</span>
              <span className="chip__d">{v.cn}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === "reserve" && (
        <div className="tb__sec">
          <div className="tb__label">size · 尺寸</div>
          <div className="tb__row">
            {["S","M","L","XL"].map(s => (
              <button key={s}
                className={"chip" + (tool === s ? " is-on" : "")}
                onClick={() => setTool(tool === s ? null : s)}>
                <span className="chip__l">{s}</span>
                <span className="chip__d">{C.RESERVES[s].w}×{C.RESERVES[s].d}×{C.RESERVES[s].h}</span>
              </button>
            ))}
          </div>
          <div className="tb__hint">{tool ? "Click plan to place · 點擊放置" : "Select a size · 選尺寸"}</div>
        </div>
      )}

      {mode === "wall" && (
        <div className="tb__sec">
          <div className="tb__label">material · 材質</div>
          <div className="tb__row">
            {Object.entries(C.WALL_MATERIALS).map(([k, v]) => (
              <button key={k}
                className={"chip" + (wallMaterial === k ? " is-on" : "")}
                onClick={() => setWallMaterial(k)}>
                <span className="chip__l">{v.label}</span>
                <span className="chip__d">{v.cn} · ρ {v.reflect.toFixed(2)}</span>
              </button>
            ))}
          </div>
          <div className="tb__hint">Click 2 points in plan · 點兩點畫牆</div>
        </div>
      )}

      {mode === "light" && (
        <>
          <div className="tb__sec">
            <div className="tb__label">mount · 燈具類型</div>
            <div className="tb__row tb__row--wrap">
              {Object.entries(C.LIGHT_MOUNTS).map(([k, v]) => (
                <button key={k}
                  className={"chip chip--mount" + (lightMount === k ? " is-on" : "")}
                  onClick={() => { setLightMount(k); setLightZ(v.z); }}>
                  <span className="chip__g">{v.glyph}</span>
                  <span className="chip__l">{v.label}</span>
                  <span className="chip__d">{v.cn} · {v.z} cm</span>
                </button>
              ))}
            </div>
          </div>
          <div className="tb__sec">
            <div className="tb__label">height · 高度 (cm)</div>
            <div className="tb__row">
              <input type="number" className="zinput" min="0" max={C.CEIL_H} step="5"
                value={lightZ}
                onChange={(e) => setLightZ(Math.max(0, Math.min(C.CEIL_H, +e.target.value || 0)))}/>
              <button className="chip chip--ghost"
                      onClick={() => setLightZ(C.LIGHT_MOUNTS[lightMount].z)}>
                reset · 預設
              </button>
            </div>
            <div className="tb__hint">Default = mount preset · 預設值來自燈具類型，可自訂</div>
          </div>
          <div className="tb__sec">
            <div className="tb__label">colour · 色溫</div>
            <div className="tb__row">
              {Object.entries(C.LIGHT_PRESETS).map(([k, v]) => (
                <button key={k}
                  className={"chip chip--sw" + (lightColor === k ? " is-on" : "")}
                  style={{ "--sw": v.color }}
                  onClick={() => setLightColor(k)}>
                  <span className="chip__sw"></span>
                  <span className="chip__d">{v.cn}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="tb__sec">
            <div className="tb__label">intensity · 強度</div>
            <div className="tb__row">
              {Object.entries(C.LIGHT_INTENSITY).map(([k, v]) => (
                <button key={k}
                  className={"chip" + (lightIntensity === k ? " is-on" : "")}
                  onClick={() => setLightIntensity(k)}>
                  <span className="chip__l">{v.label}</span>
                  <span className="chip__d">{v.v} · r {v.r}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="tb__sec">
            <div className="tb__label">presets · 一鍵</div>
            <div className="tb__row">
              <button className="chip chip--ghost" onClick={() => onPreset("threePoint")}>3-point</button>
              <button className="chip chip--ghost" onClick={() => onPreset("wash")}>wash</button>
              <button className="chip chip--ghost" onClick={() => onPreset("hero")}>hero</button>
              <button className="chip chip--ghost" onClick={() => onPreset("clearLights")}>clear lights</button>
            </div>
          </div>
        </>
      )}

      {mode === "reserve" && (
        <div className="tb__sec">
          <div className="tb__label">elev. wall · 立面</div>
          <div className="tb__row">
            {[{id:"N",l:"N · 北"},{id:"S",l:"S · 南"},{id:"E",l:"E · 東"},{id:"W",l:"W · 西"}].map(w => (
              <button key={w.id}
                className={"chip chip--sm" + (wall === w.id ? " is-on" : "")}
                onClick={() => setWall(w.id)}>
                <span className="chip__l">{w.l}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="tb__sec tb__sec--end">
        <div className="tb__label">scene</div>
        <div className="tb__row">
          <span className="counter mono">{count.reserves} R · {count.walls} W · {count.lights} L</span>
          <button className="chip chip--ghost" onClick={onClear}>clear all</button>
        </div>
      </div>
    </div>
  );
}

window.Toolbar = Toolbar;
