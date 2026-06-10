/* global window */
// Shared constants for the Spatial Planner.
// Distances in cm. Eye height = avatar total height = 130 cm per brief.

window.SP_CONST = {
  GRID_CM: 10,
  AVATAR_H: 130,
  EYE_H:    130,

  // room
  ROOM_W: 1000, // cm
  ROOM_D:  700, // cm
  CEIL_H: 350,  // cm

  // reserves
  RESERVES: {
    S:  { w:  30, d:  30, h:  50, clearance:  60, label: "S",  cn: "小型"   },
    M:  { w:  60, d:  60, h: 100, clearance:  90, label: "M",  cn: "中型"   },
    L:  { w: 120, d: 120, h: 150, clearance: 150, label: "L",  cn: "大型"   },
    XL: { w: 240, d: 240, h: 240, clearance: 300, label: "XL", cn: "特大"   }
  },

  // viewing
  DIST_STANDARD: 150,        // cm
  CONE_FOCUS:    15,         // degrees
  CONE_COMFORT:  30,

  // lights — color, label, used for emit & light placement
  LIGHT_PRESETS: {
    warm:    { color: "#FFD18A", label: "3200K · warm",  cn: "暖光" },
    key:     { color: "#FFE7B5", label: "5000K · key",   cn: "主光" },
    cool:    { color: "#BFD3EF", label: "5600K · cool",  cn: "冷光" },
    env:     { color: "#9CC069", label: "env tint",      cn: "自然" },
    magenta: { color: "#C66FA8", label: "magenta",       cn: "洋紅" }
  },
  // intensity bands map to luminous radius (cm) in plan
  LIGHT_INTENSITY: {
    soft: { v: 0.4, r: 300, label: "soft", cn: "柔"  },
    key:  { v: 1.0, r: 550, label: "key",  cn: "主"  },
    loud: { v: 2.5, r: 850, label: "loud", cn: "強"  }
  },
  // Mount type drives physical placement on a vertical axis +
  // a default beam direction. Heights are cm from floor.
  // beam: 'down' | 'up' | 'lateral' | 'omni'
  LIGHT_MOUNTS: {
    recessed: { z: 345, beam: "down",    cone: 60,  glyph: "▽", label: "recessed",  cn: "嵌燈"   },
    track:    { z: 335, beam: "down",    cone: 30,  glyph: "↧", label: "track",     cn: "軌道燈" },
    pendant:  { z: 270, beam: "down",    cone: 90,  glyph: "◉", label: "pendant",   cn: "吊燈"   },
    sconceD:  { z: 200, beam: "down",    cone: 110, glyph: "↧", label: "sconce-dn", cn: "壁燈下" },
    sconceU:  { z: 200, beam: "up",      cone: 110, glyph: "↥", label: "sconce-up", cn: "壁燈上" },
    cove:     { z: 320, beam: "up",      cone: 140, glyph: "↥", label: "cove",      cn: "天溝光" },
    floorUp:  { z:  20, beam: "up",      cone: 100, glyph: "↥", label: "floor-up",  cn: "地面上射" },
    table:    { z:  80, beam: "omni",    cone: 360, glyph: "◌", label: "table",     cn: "桌燈"   }
  },

  // walls — material affects light reflectance hint (0..1)
  WALL_MATERIALS: {
    solid:  { reflect: 0.45, opacity: 1.0, label: "solid",  cn: "實牆"    },
    glass:  { reflect: 0.05, opacity: 0.15, label: "glass", cn: "玻璃"    },
    voile:  { reflect: 0.20, opacity: 0.55, label: "voile", cn: "半透"    }
  },

  /**
   * Room shape presets — each is a closed polygon of {x,y} points in cm.
   * The bounding box is always [0..ROOM_W, 0..ROOM_D]. Shapes that don't
   * fill the box leave the surrounding area as "outside the room".
   */
  ROOM_SHAPES: {
    rect: {
      label: "Rectangle", cn: "矩形",
      points: [{x:0,y:0},{x:1000,y:0},{x:1000,y:700},{x:0,y:700}]
    },
    L: {
      label: "L-shape",   cn: "L 形",
      points: [{x:0,y:0},{x:1000,y:0},{x:1000,y:400},{x:600,y:400},{x:600,y:700},{x:0,y:700}]
    },
    T: {
      label: "T-shape",   cn: "T 形",
      points: [{x:0,y:0},{x:1000,y:0},{x:1000,y:300},{x:700,y:300},{x:700,y:700},{x:300,y:700},{x:300,y:300},{x:0,y:300}]
    },
    hex: {
      label: "Hexagon",   cn: "六角",
      points: [{x:500,y:0},{x:970,y:175},{x:970,y:525},{x:500,y:700},{x:30,y:525},{x:30,y:175}]
    },
    oval: {
      label: "Oval",      cn: "橢圓",
      points: (function() {
        const cx = 500, cy = 350, rx = 480, ry = 330, N = 24;
        const pts = [];
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          pts.push({ x: Math.round(cx + rx * Math.cos(a)), y: Math.round(cy + ry * Math.sin(a)) });
        }
        return pts;
      })()
    },
    corridor: {
      label: "Corridor",  cn: "走廊",
      points: [{x:0,y:250},{x:1000,y:250},{x:1000,y:450},{x:0,y:450}]
    },
    circle: {
      label: "Circle",  cn: "圓形建築",
      // Full disc — the building's outer architectural envelope is a circle.
      // Internal fan-corridors are formed by user-placed partition walls.
      points: (function () {
        const cx = 500, cy = 350, r = 340, N = 40;
        const pts = [];
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          pts.push({ x: Math.round(cx + r * Math.cos(a)), y: Math.round(cy + r * Math.sin(a)) });
        }
        return pts;
      })()
    },
    fan: {
      label: "Half-fan",  cn: "半扇形",
      // Single annular-segment corridor (180°). Standalone fan room — used
      // when only one fan corridor is needed, not part of a circular building.
      points: (function () {
        const cx = 500, cy = 670, rOut = 480, rIn = 200, N = 22;
        const pts = [];
        for (let i = 0; i <= N; i++) {
          const a = Math.PI + (i / N) * Math.PI;
          pts.push({ x: Math.round(cx + rOut * Math.cos(a)), y: Math.round(cy + rOut * Math.sin(a)) });
        }
        for (let i = N; i >= 0; i--) {
          const a = Math.PI + (i / N) * Math.PI;
          pts.push({ x: Math.round(cx + rIn * Math.cos(a)), y: Math.round(cy + rIn * Math.sin(a)) });
        }
        return pts;
      })()
    }
  },

  // palette
  COL: {
    env:  "#689F38",
    body: "#EEEEEE",
    cool: "#E8EAF6",
    warm: "#FFF8E1",
    ink:  "#1A1A1A",
    dim:  "#B47B2E",
    paper:"#FAFAF7",
    paper2:"#F2F1EB",
    rule: "#E0DED7",
    ok:   "#467B1E",
    bad:  "#B33"
  }
};
