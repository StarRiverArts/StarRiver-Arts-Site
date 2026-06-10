/* global React, ReactDOM, window */
// App.jsx — root state for reserves + walls + lights + mode

const { useState, useMemo, useRef, useEffect } = React;
const C = window.SP_CONST;

const LS_KEY = "vgss-planner-scene-v1";

function loadScene() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== "object") return null;
    return s;
  } catch (e) { return null; }
}
function saveScene(scene) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(scene)); } catch (e) {}
}

function App() {
  const initial = loadScene();
  const [mode, setMode] = useState("reserve");
  const [tool, setTool] = useState(null);
  const [roomShape, setRoomShape] = useState(initial?.roomShape || "rect");

  // reserve mode
  const [reserves, setReserves] = useState(initial?.reserves || [
    { id: 1, size: "M",  x: 120, y:  10 },
    { id: 2, size: "M",  x: 320, y:  10 },
    { id: 3, size: "L",  x: 440, y: 280 },
    { id: 4, size: "XL", x: 680, y: 420 }
  ]);
  const [selectedId, setSelectedId] = useState(initial?.selectedId ?? 3);
  const [wall, setWall] = useState(initial?.wall || "N");

  // walls
  const [walls, setWalls] = useState(initial?.walls || [
    { id: 100, x1: 500, y1: 0,   x2: 500, y2: 350, material: "solid" }
  ]);
  const [wallMaterial, setWallMaterial] = useState("solid");

  // lights
  const [lights, setLights] = useState(initial?.lights || [
    { id: 200, x: 250, y: 200, z: 345, mount: "recessed", color: "key", intensity: "soft" },
    { id: 201, x: 250, y: 400, z: 345, mount: "recessed", color: "key", intensity: "soft" },
    { id: 202, x: 700, y: 200, z: 270, mount: "pendant",  color: "warm", intensity: "soft" },
    { id: 203, x: 850, y: 350, z: 200, mount: "sconceU",  color: "warm", intensity: "soft" }
  ]);
  const [lightColor, setLightColor] = useState("key");
  const [lightIntensity, setLightIntensity] = useState("soft");
  const [lightMount, setLightMount] = useState("recessed");
  const [lightZ, setLightZ] = useState(C.LIGHT_MOUNTS.recessed.z);

  const nextId = useRef(initial?.nextId || 1000);

  // ----- persist on every change -----
  useEffect(() => {
    saveScene({
      roomShape, reserves, walls, lights,
      selectedId, wall,
      nextId: nextId.current
    });
  }, [roomShape, reserves, walls, lights, selectedId, wall]);

  // ----- Import / export -----
  function exportScene() {
    const scene = { roomShape, reserves, walls, lights, selectedId, wall, nextId: nextId.current };
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vgss-scene-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function importScene(ev) {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = JSON.parse(r.result);
        if (s.roomShape) setRoomShape(s.roomShape);
        if (Array.isArray(s.reserves)) setReserves(s.reserves);
        if (Array.isArray(s.walls)) setWalls(s.walls);
        if (Array.isArray(s.lights)) setLights(s.lights);
        if (s.selectedId != null) setSelectedId(s.selectedId);
        if (s.wall) setWall(s.wall);
        if (s.nextId) nextId.current = s.nextId;
      } catch (e) {
        alert("Invalid scene file");
      }
    };
    r.readAsText(f);
    ev.target.value = "";
  }

  function addReserve({ size, x, y }) {
    const id = nextId.current++;
    setReserves(rs => [...rs, { id, size, x, y }]);
    setSelectedId(id);
  }
  function moveReserve(id, x, y) {
    setReserves(rs => rs.map(r => r.id === id ? { ...r, x, y } : r));
  }
  function addWall({ x1, y1, x2, y2, material }) {
    setWalls(ws => [...ws, { id: nextId.current++, x1, y1, x2, y2, material }]);
  }
  function removeWall(id) {
    setWalls(ws => ws.filter(w => w.id !== id));
  }
  function addLight(L) {
    // L already carries x,y,color,intensity,type from PlanView; respect explicit z if provided,
    // otherwise fall back to the mount's preset height.
    const mnt = C.LIGHT_MOUNTS[L.mount] || C.LIGHT_MOUNTS.recessed;
    const z = (L.z !== undefined && L.z !== null) ? L.z : mnt.z;
    setLights(ls => [...ls, { id: nextId.current++, ...L, z }]);
  }
  function moveLight(id, patch) {
    setLights(ls => ls.map(L => L.id === id ? { ...L, ...patch } : L));
  }
  function removeLight(id) {
    setLights(ls => ls.filter(L => L.id !== id));
  }
  function clearAll() {
    setReserves([]); setWalls([]); setLights([]); setSelectedId(null);
  }
  function applyPreset(kind) {
    if (kind === "clearLights") { setLights([]); return; }
    if (kind === "threePoint") {
      // simple 3-point on entire room: key + warm fill + back/rim
      const cx = C.ROOM_W / 2, cy = C.ROOM_D / 2;
      const seed = [
        { x: cx - 200, y: cy - 200, mount: "recessed", color: "key",  intensity: "key",  z: 345 },
        { x: cx + 200, y: cy - 200, mount: "recessed", color: "warm", intensity: "soft", z: 345 },
        { x: cx,       y: cy + 250, mount: "recessed", color: "cool", intensity: "soft", z: 345 }
      ];
      setLights(seed.map(s => ({ id: nextId.current++, ...s })));
    }
    if (kind === "wash") {
      // even ceiling wash — 5 recessed lights along the long axis
      const ys = [200, 400];
      const xs = [200, 400, 600, 800];
      const seed = [];
      for (const yy of ys) for (const xx of xs) {
        seed.push({ x: xx, y: yy, mount: "recessed", color: "key", intensity: "soft", z: 345 });
      }
      setLights(seed.map(s => ({ id: nextId.current++, ...s })));
    }
    if (kind === "hero") {
      // single spot on selected reserve + low cool ambient cove
      const sel = reserves.find(r => r.id === selectedId);
      const seed = [];
      if (sel) {
        const sz = C.RESERVES[sel.size];
        seed.push({
          x: sel.x + sz.w/2, y: sel.y + sz.d/2 + 150,
          mount: "track", color: "warm", intensity: "loud", z: 335
        });
      }
      seed.push({ x: 100,  y: 100,  mount: "cove", color: "cool", intensity: "soft", z: 320 });
      seed.push({ x: 900,  y: 600,  mount: "cove", color: "cool", intensity: "soft", z: 320 });
      setLights(seed.map(s => ({ id: nextId.current++, ...s })));
    }
  }

  const selected = useMemo(
    () => reserves.find(r => r.id === selectedId) || null,
    [reserves, selectedId]
  );

  return (
    <div className="app">
      <header className="appbar">
        <div>
          <div className="appbar__id mono">VGSS · 002 · SPATIAL PLANNER</div>
          <h1 className="appbar__t">Spatial Planner <span className="appbar__cn">空間規劃工具</span></h1>
        </div>
        <div className="appbar__tools">
          <button className="chip chip--ghost" onClick={exportScene}>↧ export scene</button>
          <label className="chip chip--ghost" style={{cursor:"pointer"}}>
            ↥ import
            <input type="file" accept="application/json,.json" onChange={importScene} style={{display:"none"}}/>
          </label>
          <span className="appbar__hint">
            Auto-saves locally. Drag in plan or elevation.
          </span>
        </div>
      </header>

      <window.Toolbar
        mode={mode} setMode={setMode}
        tool={tool} setTool={setTool}
        roomShape={roomShape} setRoomShape={setRoomShape}
        lightColor={lightColor} setLightColor={setLightColor}
        lightIntensity={lightIntensity} setLightIntensity={setLightIntensity}
        lightMount={lightMount} setLightMount={setLightMount}
        lightZ={lightZ} setLightZ={setLightZ}
        wallMaterial={wallMaterial} setWallMaterial={setWallMaterial}
        wall={wall} setWall={setWall}
        count={{ reserves: reserves.length, walls: walls.length, lights: lights.length }}
        onClear={clearAll}
        onPreset={applyPreset}
      />

      <main className="grid">
        <window.PlanView
          mode={mode} tool={tool}
          roomShape={roomShape}
          reserves={reserves} selectedId={selectedId} setSelectedId={setSelectedId}
          addReserve={addReserve} moveReserve={moveReserve}
          walls={walls} wallMaterial={wallMaterial} addWall={addWall} removeWall={removeWall}
          lights={lights} lightColor={lightColor} lightIntensity={lightIntensity}
          lightMount={lightMount} lightZ={lightZ}
          addLight={addLight} moveLight={moveLight} removeLight={removeLight}
        />
        <window.ElevationView
          mode={mode}
          reserves={reserves} selectedId={selectedId}
          walls={walls}
          lights={lights} moveLight={moveLight} removeLight={removeLight}
          wall={wall}
        />
        <window.ValidationPanel
          reserve={selected}
          reserves={reserves}
          lights={lights}
          walls={walls}
        />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
