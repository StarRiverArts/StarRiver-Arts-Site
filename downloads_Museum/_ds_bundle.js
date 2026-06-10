/* @ds-bundle: {"format":3,"namespace":"StarRiverArtsDesignSystem_a109a1","components":[],"sourceHashes":{"image-slot.js":"9309434cb09c","records-core.js":"735373a5f914","time-attack-data.js":"4c26581c4b58","time-attack.js":"0977f3a34096"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.StarRiverArtsDesignSystem_a109a1 = window.StarRiverArtsDesignSystem_a109a1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever you want the user to
 * supply an image. You control the slot's shape and size; the user fills it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The host bridge only allows sidecar writes at the project root, so the
 * HTML that uses this component is assumed to live at the project root too
 * (same constraint as design_canvas.jsx).
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          object-fit: cover | contain | fill.       (default 'cover')
 *                With cover (the default) double-clicking the filled slot
 *                enters a reframe mode: the whole image spills past the mask
 *                (translucent outside, opaque inside), drag to reposition,
 *                corner-drag to scale. The crop persists alongside the image
 *                in the sidecar. contain/fill stay static.
 *   position     object-position for fit=contain|fill.     (default '50% 50%')
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. A user drop overrides
 *                it; clearing the drop reveals src again.
 *
 * Size and layout come from ordinary CSS on the element — width/height
 * inline or from a parent grid — so it composes with any layout.
 *
 * Usage:
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet = ':host{display:inline-block;position:relative;vertical-align:top;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);width:240px;height:160px}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  '.spill{position:absolute;transform:translate(-50%,-50%);display:none;z-index:1;' + '  cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .spill{display:block}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls sit BELOW the mask (top:100%), absolutely positioned so the
  // author-declared slot height is unaffected. The gap is padding, not a
  // top offset, so the hover target stays contiguous with the frame.
  '.ctl{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:8px;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'src', 'id'];
    }
    constructor() {
      super();
      const root = this.attachShadow({
        mode: 'open'
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="ring" part="ring"></div>' + '</div>' + '<div class="spill">' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' + '<div class="ctl"><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="clear" title="Remove image">Remove</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') {
          this._exitReframe(true);
          this._input.click();
        }
        if (act === 'clear') {
          this._exitReframe(false);
          this._gen++;
          this._local = null;
          if (this.id) setSlot(this.id, null);else this._render();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      this._img.addEventListener('load', () => this._applyView());
      // Gated on editable + fit=cover so share links and contain/fill slots
      // stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const base = Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (commit) this._commitView();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is only meaningful for fit=cover — contain/fill
    // keep the old object-fit path and double-click is a no-op.
    _reframes() {
      return this.hasAttribute('data-filled') && (this.getAttribute('fit') || 'cover') === 'cover';
    }

    // Cover-baseline geometry, shared by clamp/apply/resize. Null until the
    // img has loaded (naturalWidth is 0 before that) or when the slot has no
    // layout box — ResizeObserver fires with a 0×0 rect under display:none,
    // and clamping against a degenerate 1×1 frame would silently pull the
    // stored pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      return {
        iw,
        ih,
        fw,
        fh,
        base: Math.max(fw / iw, fh / ih)
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      const fit = this.getAttribute('fit') || 'cover';
      if (fit !== 'cover' || !g) {
        // Non-cover, or dimensions not known yet (before img load).
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = fit;
        this._img.style.objectPosition = this.getAttribute('position') || '50% 50%';
        return;
      }
      // Cover baseline: img fills the frame on its tighter axis at s=1, so
      // pan works immediately on the overflowing axis without zooming first.
      // Width/height and left/top are all frame-% — depends only on the
      // frame aspect ratio, so a responsive resize keeps the same crop. The
      // spill layer mirrors the same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      this._spill.style.width = w;
      this._spill.style.height = h;
      this._spill.style.left = l;
      this._spill.style.top = t;
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      if (url) {
        if (this._img.getAttribute('src') !== url) {
          this._img.src = url;
          this._ghost.src = url;
        }
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "image-slot.js", error: String((e && e.message) || e) }); }

// records-core.js
try { (() => {
/* Driver / Vehicle records — aggregates the SAME window.TA_DATA used by Time Attack,
   re-centred on a person (車手榜) or a machine (車輛榜).
   The page sets window.REC_MODE = "driver" | "vehicle" before loading this file.
   Badge logic mirrors ta-core: per route → TR > CR (per vehicle) > PR (per driver). */
(function () {
  var DATA = window.TA_DATA;
  var MODE = window.REC_MODE === "vehicle" ? "vehicle" : "driver";
  var CFG = {
    driver: {
      key: "driver",
      other: "vehicle",
      otherLbl: "車輛 Vehicle",
      listLbl: "車手 Drivers",
      eyebrow: "車手 · DRIVER",
      slotShape: "circle",
      slotPh: "車手頭像",
      bannerPh: "個人橫幅 Banner",
      unit: "車手"
    },
    vehicle: {
      key: "vehicle",
      other: "driver",
      otherLbl: "車手 Driver",
      listLbl: "車輛 Vehicles",
      eyebrow: "車輛 · VEHICLE",
      slotShape: "rect",
      slotPh: "車輛照片",
      bannerPh: "車輛主視覺 Hero",
      unit: "車輛"
    }
  }[MODE];
  function fmt(ms) {
    if (ms == null) return "—";
    var m = Math.floor(ms / 60000),
      s = Math.floor(ms % 60000 / 1000),
      mm = ms % 1000;
    return m + ":" + (s < 10 ? "0" : "") + s + "." + ("00" + mm).slice(-3);
  }
  function gapTxt(ms, best) {
    var d = ms - best;
    if (d <= 0) return "—";
    var s = Math.floor(d / 1000);
    return "+" + s + "." + ("00" + d % 1000).slice(-3);
  }
  function slug(s) {
    return String(s).replace(/[^\w\u4e00-\u9fff]/g, "").slice(0, 24);
  }

  // per-route badges → flat record index
  function withBadges(records) {
    var sorted = records.slice().sort(function (a, b) {
      return a.ms - b.ms;
    });
    var seenV = {},
      seenP = {};
    sorted.forEach(function (r) {
      r.badge = "";
    });
    if (sorted.length) sorted[0].badge = "TR";
    sorted.forEach(function (r) {
      if (!(r.vehicle in seenV)) seenV[r.vehicle] = r;
      if (!(r.driver in seenP)) seenP[r.driver] = r;
    });
    Object.keys(seenV).forEach(function (v) {
      if (!seenV[v].badge) seenV[v].badge = "CR";
    });
    Object.keys(seenP).forEach(function (p) {
      if (!seenP[p].badge) seenP[p].badge = "PR";
    });
    return sorted;
  }
  var FLAT = [];
  DATA.variants.forEach(function (v) {
    v.routes.forEach(function (r) {
      if (!r.records.length) return;
      var sorted = withBadges(r.records),
        trBest = sorted[0].ms;
      sorted.forEach(function (rec, i) {
        FLAT.push({
          driver: rec.driver,
          vehicle: rec.vehicle,
          ms: rec.ms,
          plat: rec.plat,
          fps: rec.fps,
          date: rec.date,
          badge: rec.badge,
          rank: i + 1,
          trBest: trBest,
          track: v.name,
          fam: v.fam,
          sign: v.sign,
          signSub: v.signSub,
          signColor: v.signColor,
          group: v.group,
          route: r.name,
          dist: r.dist,
          variantId: v.id
        });
      });
    });
  });

  // group FLAT into entities keyed by driver|vehicle
  var ENT = {};
  FLAT.forEach(function (rec) {
    var k = rec[CFG.key];
    var e = ENT[k] || (ENT[k] = {
      name: k,
      runs: 0,
      recs: [],
      variants: {},
      others: {},
      TR: 0,
      CR: 0,
      PR: 0
    });
    e.runs++;
    e.recs.push(rec);
    e.variants[rec.variantId] = 1;
    e.others[rec[CFG.other]] = 1;
    if (rec.badge === "TR") e.TR++;else if (rec.badge === "CR") e.CR++;else if (rec.badge === "PR") e.PR++;
  });
  var ENTITIES = Object.keys(ENT).map(function (k) {
    var e = ENT[k];
    e.tracks = Object.keys(e.variants).length;
    e.otherCount = Object.keys(e.others).length;
    // best run per variant (for the table) — keep one row per track
    var perV = {};
    e.recs.forEach(function (r) {
      if (!perV[r.variantId] || r.ms < perV[r.variantId].ms) perV[r.variantId] = r;
    });
    e.best = Object.keys(perV).map(function (id) {
      return perV[id];
    }).sort(function (a, b) {
      return a.rank - b.rank || a.ms - b.ms;
    });
    return e;
  }).sort(function (a, b) {
    return b.TR - a.TR || b.runs - a.runs;
  });
  var state = {
    id: ENTITIES[0] ? ENTITIES[0].name : null,
    query: "",
    theme: "dark"
  };
  function getEnt(id) {
    return ENTITIES.filter(function (e) {
      return e.name === id;
    })[0];
  }

  // ---------- render: master list ----------
  function listItem(e) {
    var on = e.name === state.id ? " on" : "";
    var mark = CFG.slotShape === "circle" ? '<span class="li-av"></span>' : '<span class="li-chip" style="background:' + (e.best[0] ? e.best[0].signColor : "#2F4F3A") + '"></span>';
    return '<button class="li' + on + '" data-id="' + encodeURIComponent(e.name) + '">' + mark + '<span class="li-tx"><span class="li-name">' + e.name + '</span>' + '<span class="li-sub">' + e.tracks + ' ' + (MODE === "driver" ? "賽道" : "賽道") + ' · ' + e.runs + ' 紀錄</span></span>' + '<span class="li-tr">' + (e.TR ? '<b>' + e.TR + '</b><i>TR</i>' : '<span class="li-dash">—</span>') + '</span>' + '</button>';
  }
  function renderList() {
    var q = state.query.trim().toLowerCase();
    var rows = ENTITIES.filter(function (e) {
      return !q || e.name.toLowerCase().indexOf(q) >= 0;
    });
    document.getElementById("recList").innerHTML = rows.length ? rows.map(listItem).join("") : '<div class="li-empty">找不到符合「' + (state.query.trim() || "—") + '」· No match</div>';
    document.getElementById("listCount").textContent = rows.length + " / " + ENTITIES.length + " " + CFG.unit;
  }

  // ---------- render: detail (reserved personal block + records) ----------
  function badgeChip(b) {
    if (!b) return '<span class="bz bz-none">—</span>';
    return '<span class="bz bz-' + b.toLowerCase() + '">' + b + '</span>';
  }
  function recRow(r) {
    return '<tr>' + '<td class="c-track"><span class="shield" style="background:' + r.signColor + '">' + r.sign + '<small>' + r.signSub + '</small></span>' + '<span class="ct-tx"><b>' + r.track + '</b><i>' + r.route + ' · ' + r.dist + '</i></span></td>' + '<td class="c-other">' + r[CFG.other] + '</td>' + '<td class="c-time mono">' + fmt(r.ms) + '</td>' + '<td class="c-bz">' + badgeChip(r.badge) + '</td>' + '<td class="c-gap mono">' + (r.badge === "TR" ? '<span class="lead">領先</span>' : gapTxt(r.ms, r.trBest)) + '</td>' + '</tr>';
  }
  function renderDetail() {
    var e = getEnt(state.id);
    var el = document.getElementById("recDetail");
    if (!e) {
      el.innerHTML = '<div class="li-empty" style="padding:80px 20px">選擇一位' + CFG.unit + ' · pick one</div>';
      return;
    }
    var sid = slug(e.name);
    // reserved personal block — banner + avatar/photo image-slots the team fills in
    var hero = '<div class="pblock pblock-' + MODE + '">' + '<div class="pb-banner"><image-slot id="rec-banner-' + sid + '" shape="rect" placeholder="' + CFG.bannerPh + '"></image-slot></div>' + '<div class="pb-id">' + '<div class="pb-slot ' + CFG.slotShape + '"><image-slot id="rec-av-' + sid + '" shape="' + CFG.slotShape + '" placeholder="' + CFG.slotPh + '"></image-slot></div>' + '<div class="pb-meta"><span class="pb-eyebrow">' + CFG.eyebrow + '</span>' + '<h2 class="pb-name">' + e.name + '</h2>' + '<span class="pb-line">' + (MODE === "driver" ? e.otherCount + ' 部愛車 · 橫跨 ' + e.tracks + ' 條賽道' : e.otherCount + ' 位車手駕馭 · ' + e.tracks + ' 條賽道留下紀錄') + '</span></div>' + '</div></div>';
    var stats = '<div class="pb-stats">' + stat(e.TR, "TR", "賽道紀錄", "tr") + stat(e.CR, "CR", "同車最快", "cr") + stat(e.PR, "PR", "個人最佳", "pr") + stat(e.runs, "", "總紀錄 Runs", "") + stat(e.tracks, "", "賽道 Tracks", "") + '</div>';
    var table = '<div class="rec-tbl-wrap"><div class="rec-tbl-head"><h3>各賽道最佳 · Best per track</h3>' + '<span class="ct-note">' + e.best.length + ' 條賽道</span></div>' + '<table class="rec-tbl"><thead><tr>' + '<th>賽道 Track</th><th>' + CFG.otherLbl + '</th><th>時間 Time</th><th>標記</th><th>vs TR</th>' + '</tr></thead><tbody>' + e.best.map(recRow).join("") + '</tbody></table></div>';
    el.innerHTML = hero + stats + table;
  }
  function stat(n, tag, lbl, cls) {
    return '<div class="pst' + (cls ? " pst-" + cls : "") + '"><b class="mono">' + n + (tag ? '<span class="pst-tag">' + tag + '</span>' : '') + '</b><span>' + lbl + '</span></div>';
  }
  function applyTheme() {
    document.documentElement.classList.toggle("theme-paper", state.theme === "paper");
  }
  function init() {
    document.getElementById("listLbl").textContent = CFG.listLbl;
    document.getElementById("recSearch").placeholder = "搜尋" + CFG.unit + "… · search";
    renderList();
    renderDetail();
    applyTheme();
    document.getElementById("recSearch").addEventListener("input", function (e) {
      state.query = e.target.value;
      renderList();
    });
    document.getElementById("recList").addEventListener("click", function (e) {
      var b = e.target.closest(".li");
      if (!b) return;
      state.id = decodeURIComponent(b.dataset.id);
      document.querySelectorAll(".li").forEach(function (x) {
        x.classList.toggle("on", x === b);
      });
      renderDetail();
      if (window.matchMedia("(max-width:880px)").matches) {
        var d = document.getElementById("recDetail");
        window.scrollTo({
          top: d.getBoundingClientRect().top + window.pageYOffset - 16,
          behavior: "smooth"
        });
      }
    });
    var tg = document.getElementById("themeToggle");
    if (tg) tg.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      state.theme = btn.dataset.theme;
      applyTheme();
      tg.querySelectorAll("button").forEach(function (x) {
        x.classList.toggle("on", x === btn);
        x.classList.toggle("paper", x === btn && state.theme === "paper");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);else init();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "records-core.js", error: String((e && e.message) || e) }); }

// time-attack-data.js
try { (() => {
/* Time Attack data — model mirrors StarRiverVRCInfo:
   group (family bucket) → track_variant → track_route; records carry
   driver / vehicle / lap_time / platform / fps / date.
   Badges (TR>CR>PR) are computed per-route at runtime (see ta-core.js).

   ~62 sample variants across 5 families to exercise browsing at scale.
   Production catalogue is ~60 tracks — same shape, just more rows. */
window.TA_DATA = {
  groups: ["北部山道 North", "中部山道 Central", "東部山道 East", "南部山道 South", "虛構場景 Fiction"],
  variants: [/* ---------- 北部山道 North ---------- */
  {
    id: "9turns",
    group: "北部山道 North",
    fam: "台9 · 北宜 Beiyi",
    name: "九彎十八拐 9 Turns",
    sign: "9",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "9t_dh",
      name: "下山 Downhill",
      dist: "9.2 km",
      records: [{
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 232418,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-22"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "RX-7 FD",
        ms: 233002,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-21"
      }, {
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 233770,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-19"
      }, {
        driver: "白稜Shiro",
        vehicle: "S15 Silvia",
        ms: 235140,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-12"
      }, {
        driver: "AKINA_8686",
        vehicle: "RX-7 FD",
        ms: 235980,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-08"
      }, {
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 237610,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-15"
      }, {
        driver: "K.Tanaka",
        vehicle: "EK9 Civic",
        ms: 238330,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-29"
      }]
    }, {
      id: "9t_uh",
      name: "上山 Uphill",
      dist: "9.2 km",
      records: [{
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 248250,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-20"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "RX-7 FD",
        ms: 249910,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-18"
      }, {
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 251400,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-14"
      }, {
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 252880,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-09"
      }]
    }]
  }, {
    id: "balaka",
    group: "北部山道 North",
    fam: "台2甲 · 陽明山 Yangmingshan",
    name: "巴拉卡 Balaka",
    sign: "2甲",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "bl_dh",
      name: "下山 Downhill",
      dist: "7.4 km",
      records: [{
        driver: "白稜Shiro",
        vehicle: "S15 Silvia",
        ms: 191240,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-17"
      }, {
        driver: "180SX_Koba",
        vehicle: "180SX",
        ms: 192010,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-13"
      }, {
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 192880,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-06"
      }, {
        driver: "NightOwl",
        vehicle: "S2000",
        ms: 194300,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-28"
      }]
    }]
  }, {
    id: "beicross",
    group: "北部山道 North",
    fam: "台7 · 北橫 North Cross",
    name: "北橫 North Cross",
    sign: "7",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "bc_run",
      name: "巴陵段 Baling",
      dist: "15.6 km",
      records: [{
        driver: "陳GTR",
        vehicle: "Supra A80",
        ms: 472600,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-16"
      }, {
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 475180,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-10"
      }, {
        driver: "K.Tanaka",
        vehicle: "WRX STI",
        ms: 478950,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-03"
      }]
    }]
  }, {
    id: "fengguei",
    group: "北部山道 North",
    fam: "北28 · 台北 Taipei",
    name: "風櫃嘴 Fengguei",
    sign: "北28",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "fg_up",
      name: "五指山進 Climb",
      dist: "5.1 km",
      records: [{
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 131420,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-19"
      }, {
        driver: "葉山Hayama",
        vehicle: "NSX-R",
        ms: 132050,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-11"
      }, {
        driver: "阿維Avi",
        vehicle: "Integra DC2",
        ms: 133600,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-04"
      }, {
        driver: "白稜Shiro",
        vehicle: "S15 Silvia",
        ms: 134210,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-27"
      }]
    }]
  }, {
    id: "wuzhi",
    group: "北部山道 North",
    fam: "新竹 Hsinchu",
    name: "五指山 Wuzhi Mt.",
    sign: "竹",
    signSub: "產道",
    signColor: "#7C6238",
    routes: [{
      id: "wz_run",
      name: "單圈 Lap",
      dist: "8.0 km",
      records: [{
        driver: "阿維Avi",
        vehicle: "Integra DC2",
        ms: 205900,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-15"
      }, {
        driver: "K.Tanaka",
        vehicle: "EK9 Civic",
        ms: 206840,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-07"
      }]
    }]
  }, /* ---------- 中部山道 Central ---------- */
  {
    id: "wuling",
    group: "中部山道 Central",
    fam: "台14甲 · 合歡 Hehuan",
    name: "武嶺 Wuling",
    sign: "14甲",
    signSub: "省道",
    signColor: "#1F5EA8",
    routes: [{
      id: "wl_climb",
      name: "西進 Climb",
      dist: "13.1 km",
      records: [{
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 401560,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-23"
      }, {
        driver: "K.Tanaka",
        vehicle: "WRX STI",
        ms: 403120,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-17"
      }, {
        driver: "白稜Shiro",
        vehicle: "EVO IX",
        ms: 404900,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-11"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "RX-7 FD",
        ms: 406740,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-06"
      }, {
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 409880,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-02"
      }]
    }]
  }, {
    id: "dayuling",
    group: "中部山道 Central",
    fam: "台8 · 中橫 Central Cross",
    name: "大禹嶺 Dayuling",
    sign: "8",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "dy_dh",
      name: "下山 Downhill",
      dist: "12.3 km",
      records: [{
        driver: "陳GTR",
        vehicle: "Supra A80",
        ms: 372400,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-18"
      }, {
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 374050,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-12"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "RX-7 FD",
        ms: 376220,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-05"
      }]
    }]
  }, {
    id: "lixing",
    group: "中部山道 Central",
    fam: "投89 · 力行 Lixing",
    name: "力行產業道 Lixing",
    sign: "投89",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "lx_run",
      name: "全段 Full",
      dist: "18.9 km",
      records: [{
        driver: "K.Tanaka",
        vehicle: "WRX STI",
        ms: 612300,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-14"
      }, {
        driver: "陳GTR",
        vehicle: "Supra A80",
        ms: 618700,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-08"
      }]
    }]
  }, {
    id: "guguan",
    group: "中部山道 Central",
    fam: "台8 · 谷關 Guguan",
    name: "谷關 Guguan",
    sign: "8",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "gg_up",
      name: "上山 Uphill",
      dist: "10.7 km",
      records: [{
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 318600,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-16"
      }, {
        driver: "葉山Hayama",
        vehicle: "NSX-R",
        ms: 320100,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-09"
      }, {
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 322750,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-01"
      }]
    }]
  }, /* ---------- 東部山道 East ---------- */
  {
    id: "taroko",
    group: "東部山道 East",
    fam: "台8 · 太魯閣 Taroko",
    name: "太魯閣 Taroko",
    sign: "8",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "tk_dh",
      name: "下山 Downhill",
      dist: "11.4 km",
      records: [{
        driver: "Ryo_FC3S",
        vehicle: "RX-7 FD",
        ms: 322600,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-19"
      }, {
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 324050,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-15"
      }, {
        driver: "K.Tanaka",
        vehicle: "WRX STI",
        ms: 326880,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-07"
      }]
    }, {
      id: "tk_uh",
      name: "上山 Uphill",
      dist: "11.4 km",
      records: []
    }]
  }, {
    id: "suhua",
    group: "東部山道 East",
    fam: "台9 · 蘇花 Suhua",
    name: "蘇花 Suhua",
    sign: "9",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "sh_run",
      name: "清水段 Qingshui",
      dist: "14.2 km",
      records: [{
        driver: "陳GTR",
        vehicle: "Supra A80",
        ms: 431200,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-13"
      }, {
        driver: "NightOwl",
        vehicle: "S2000",
        ms: 434600,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-06"
      }, {
        driver: "白稜Shiro",
        vehicle: "S15 Silvia",
        ms: 436900,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-30"
      }]
    }]
  }, {
    id: "coast11",
    group: "東部山道 East",
    fam: "台11 · 海岸 Coast",
    name: "台11 海岸線",
    sign: "11",
    signSub: "省道",
    signColor: "#1F5EA8",
    routes: [{
      id: "c11_run",
      name: "石梯坪段 Shitiping",
      dist: "9.8 km",
      records: [{
        driver: "葉山Hayama",
        vehicle: "NSX-R",
        ms: 268400,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-10"
      }, {
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 270150,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-03"
      }]
    }]
  }, /* ---------- 南部山道 South ---------- */
  {
    id: "alishan",
    group: "南部山道 South",
    fam: "台18 · 阿里山 Alishan",
    name: "阿里山 Alishan",
    sign: "18",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "al_up",
      name: "上山 Climb",
      dist: "16.1 km",
      records: [{
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 489300,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-17"
      }, {
        driver: "K.Tanaka",
        vehicle: "WRX STI",
        ms: 492700,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-11"
      }, {
        driver: "陳GTR",
        vehicle: "Supra A80",
        ms: 495400,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-04"
      }]
    }]
  }, {
    id: "tataka",
    group: "南部山道 South",
    fam: "台18 · 新中橫 Tataka",
    name: "塔塔加 Tataka",
    sign: "18",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "tt_run",
      name: "單圈 Lap",
      dist: "13.7 km",
      records: [{
        driver: "陳GTR",
        vehicle: "Supra A80",
        ms: 408900,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-12"
      }, {
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 412300,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-05"
      }]
    }]
  }, {
    id: "nancross",
    group: "南部山道 South",
    fam: "台20 · 南橫 South Cross",
    name: "南橫 South Cross",
    sign: "20",
    signSub: "省道",
    signColor: "#1F5EA8",
    routes: [{
      id: "nc_run",
      name: "埡口段 Yakou",
      dist: "17.3 km",
      records: []
    }]
  }, /* ---------- 虛構場景 Fiction ---------- */
  {
    id: "starsight",
    group: "虛構場景 Fiction",
    fam: "Project T · 虛構",
    name: "觀星山 StarSight Mt.",
    sign: "T",
    signSub: "場景",
    signColor: "#2F4F3A",
    routes: [{
      id: "ss_lap",
      name: "單圈 Full Lap",
      dist: "6.8 km",
      records: [{
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 178900,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-24"
      }, {
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 179420,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-22"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "RX-7 FD",
        ms: 180050,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-20"
      }, {
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 181260,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-16"
      }, {
        driver: "葉山Hayama",
        vehicle: "NSX-R",
        ms: 182740,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-13"
      }, {
        driver: "白稜Shiro",
        vehicle: "S15 Silvia",
        ms: 184010,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-05"
      }]
    }, {
      id: "ss_rev",
      name: "逆走 Reverse",
      dist: "6.8 km",
      records: [{
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 185300,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-21"
      }, {
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 186120,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-18"
      }, {
        driver: "葉山Hayama",
        vehicle: "NSX-R",
        ms: 188450,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-10"
      }]
    }]
  }, {
    id: "nightport",
    group: "虛構場景 Fiction",
    fam: "Project T · 虛構",
    name: "夜港 Night Harbor",
    sign: "T",
    signSub: "場景",
    signColor: "#2F4F3A",
    routes: [{
      id: "np_run",
      name: "港區環線 Dock Loop",
      dist: "5.4 km",
      records: [{
        driver: "白稜Shiro",
        vehicle: "S15 Silvia",
        ms: 142600,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-14"
      }, {
        driver: "180SX_Koba",
        vehicle: "180SX",
        ms: 143400,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-08"
      }, {
        driver: "NightOwl",
        vehicle: "S2000",
        ms: 144950,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-02"
      }]
    }]
  }, {
    id: "skyloop",
    group: "虛構場景 Fiction",
    fam: "Project T · 虛構",
    name: "雲海環線 Sky Loop",
    sign: "T",
    signSub: "場景",
    signColor: "#2F4F3A",
    routes: [{
      id: "sk_run",
      name: "環線 Loop",
      dist: "9.6 km",
      records: [{
        driver: "雷神Raijin",
        vehicle: "EVO IX",
        ms: 256800,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-15"
      }, {
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 258300,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-09"
      }, {
        driver: "Momo_GR",
        vehicle: "GR86",
        ms: 259700,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-03"
      }]
    }]
  }, {
    id: "buyanting",
    group: "北部山道 North",
    fam: "102 · 雙溪 Shuangxi",
    name: "不厭亭 寂寞公路",
    sign: "102",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "buya_0",
      name: "北上 North",
      dist: "9.0 km",
      records: [{
        driver: "白稜Shiro",
        vehicle: "Supra A80",
        ms: 230473,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-07"
      }, {
        driver: "Momo_GR",
        vehicle: "180SX",
        ms: 254164,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-28"
      }]
    }, {
      id: "buya_1",
      name: "南下 South",
      dist: "13.0 km",
      records: []
    }]
  }, {
    id: "wufenshan",
    group: "北部山道 North",
    fam: "106 · 平溪 Pingxi",
    name: "五分山",
    sign: "106",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "wufe_0",
      name: "稜線 Ridge",
      dist: "4.9 km",
      records: [{
        driver: "黑羽Kuro",
        vehicle: "MX-5 NA",
        ms: 126821,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-17"
      }, {
        driver: "AKINA_8686",
        vehicle: "Skyline R32",
        ms: 132810,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-28"
      }, {
        driver: "峰Mine",
        vehicle: "Skyline R32",
        ms: 133109,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-20"
      }, {
        driver: "DriftKing_Wu",
        vehicle: "Integra DC2",
        ms: 138019,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-07"
      }]
    }]
  }, {
    id: "tonghou",
    group: "北部山道 North",
    fam: "北107 · 烏來 Wulai",
    name: "桶後越嶺",
    sign: "北107",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "tong_0",
      name: "進 In",
      dist: "13.8 km",
      records: [{
        driver: "雷神Raijin",
        vehicle: "S15 Silvia",
        ms: 355518,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-05"
      }, {
        driver: "葉山Hayama",
        vehicle: "Lancer Evo VI",
        ms: 377136,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-17"
      }, {
        driver: "黑羽Kuro",
        vehicle: "EK9 Civic",
        ms: 384320,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-10"
      }]
    }]
  }, {
    id: "beiyiold",
    group: "北部山道 North",
    fam: "台9 · 北宜 Beiyi",
    name: "北宜舊道",
    sign: "9",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "beiy_0",
      name: "下山 Downhill",
      dist: "12.2 km",
      records: [{
        driver: "白稜Shiro",
        vehicle: "WRX STI",
        ms: 322824,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-06"
      }, {
        driver: "K.Tanaka",
        vehicle: "NSX-R",
        ms: 331399,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-20"
      }, {
        driver: "阿維Avi",
        vehicle: "Civic EG6",
        ms: 313441,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-18"
      }, {
        driver: "DriftKing_Wu",
        vehicle: "GR86",
        ms: 326794,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-27"
      }]
    }]
  }, {
    id: "zhuhang",
    group: "北部山道 North",
    fam: "台2甲 · 陽明山 Yangmingshan",
    name: "助航站",
    sign: "2甲",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "zhuh_0",
      name: "上山 Uphill",
      dist: "13.8 km",
      records: [{
        driver: "DriftKing_Wu",
        vehicle: "Lancer Evo VI",
        ms: 353292,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-01"
      }, {
        driver: "林Sasaki",
        vehicle: "R34 GT-R",
        ms: 385723,
        plat: "Desktop",
        fps: 72,
        date: "2026-04-27"
      }]
    }]
  }, {
    id: "smangus",
    group: "北部山道 North",
    fam: "竹60 · 尖石 Jianshi",
    name: "司馬庫斯",
    sign: "竹60",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "sman_0",
      name: "全段 Full",
      dist: "6.1 km",
      records: []
    }]
  }, {
    id: "taoyuangu",
    group: "北部山道 North",
    fam: "草嶺 · 貢寮 Gongliao",
    name: "桃源谷",
    sign: "草嶺",
    signSub: "步道線",
    signColor: "#2F4F3A",
    routes: [{
      id: "taoy_0",
      name: "環線 Loop",
      dist: "14.3 km",
      records: [{
        driver: "葉山Hayama",
        vehicle: "WRX STI",
        ms: 367207,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-23"
      }, {
        driver: "Momo_GR",
        vehicle: "NSX-R",
        ms: 397557,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-18"
      }, {
        driver: "AKINA_8686",
        vehicle: "WRX STI",
        ms: 372687,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-16"
      }, {
        driver: "白稜Shiro",
        vehicle: "RX-7 FD",
        ms: 377412,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-06"
      }, {
        driver: "DriftKing_Wu",
        vehicle: "NSX-R",
        ms: 370911,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-26"
      }, {
        driver: "陳GTR",
        vehicle: "Skyline R32",
        ms: 385809,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-13"
      }]
    }]
  }, {
    id: "shiding",
    group: "北部山道 North",
    fam: "106 · 石碇 Shiding",
    name: "石碇雙溪",
    sign: "106",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "shid_0",
      name: "全段 Full",
      dist: "15.9 km",
      records: [{
        driver: "K.Tanaka",
        vehicle: "GR86",
        ms: 420412,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-06"
      }, {
        driver: "阿維Avi",
        vehicle: "Lancer Evo VI",
        ms: 439392,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-13"
      }]
    }]
  }, {
    id: "jinguazhao",
    group: "北部山道 North",
    fam: "北42 · 坪林 Pinglin",
    name: "金瓜寮",
    sign: "北42",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "jing_0",
      name: "溪線 Creek",
      dist: "9.1 km",
      records: [{
        driver: "Momo_GR",
        vehicle: "180SX",
        ms: 246534,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-07"
      }, {
        driver: "180SX_Koba",
        vehicle: "R34 GT-R",
        ms: 240428,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-02"
      }]
    }]
  }, {
    id: "bafu",
    group: "北部山道 North",
    fam: "桃116 · 復興 Fuxing",
    name: "巴福越嶺",
    sign: "桃116",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "bafu_0",
      name: "越嶺 Pass",
      dist: "13.8 km",
      records: [{
        driver: "AKINA_8686",
        vehicle: "Lancer Evo VI",
        ms: 360610,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-14"
      }, {
        driver: "陳GTR",
        vehicle: "Supra A80",
        ms: 373412,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-01"
      }]
    }]
  }, {
    id: "wanlijiatou",
    group: "北部山道 North",
    fam: "北28 · 萬里 Wanli",
    name: "萬里加投",
    sign: "北28",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "wanl_0",
      name: "下山 Downhill",
      dist: "9.7 km",
      records: []
    }]
  }, {
    id: "hongludi",
    group: "北部山道 North",
    fam: "中和 · 南勢角 Nanshijiao",
    name: "烘爐地",
    sign: "北",
    signSub: "產道",
    signColor: "#2F4F3A",
    routes: [{
      id: "hong_0",
      name: "夜爬 Night",
      dist: "8.9 km",
      records: [{
        driver: "K.Tanaka",
        vehicle: "Supra A80",
        ms: 236754,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-14"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "GR86",
        ms: 233581,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-03"
      }, {
        driver: "林Sasaki",
        vehicle: "MX-5 NA",
        ms: 244062,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-17"
      }, {
        driver: "陳GTR",
        vehicle: "Lancer Evo VI",
        ms: 242433,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-15"
      }, {
        driver: "DriftKing_Wu",
        vehicle: "WRX STI",
        ms: 249420,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-18"
      }]
    }]
  }, {
    id: "cingjing",
    group: "中部山道 Central",
    fam: "台14甲 · 合歡 Hehuan",
    name: "清境翠峰",
    sign: "14甲",
    signSub: "省道",
    signColor: "#1F5EA8",
    routes: [{
      id: "cing_0",
      name: "上行 Climb",
      dist: "8.5 km",
      records: [{
        driver: "黑羽Kuro",
        vehicle: "GR86",
        ms: 217208,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-03"
      }, {
        driver: "白稜Shiro",
        vehicle: "GR86",
        ms: 230163,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-25"
      }, {
        driver: "Nora_R34",
        vehicle: "180SX",
        ms: 221150,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-01"
      }]
    }]
  }, {
    id: "daxueshan",
    group: "中部山道 Central",
    fam: "東勢林道 · 和平 Heping",
    name: "大雪山",
    sign: "大雪山",
    signSub: "林道",
    signColor: "#2F4F3A",
    routes: [{
      id: "daxu_0",
      name: "林道 Forest",
      dist: "9.6 km",
      records: [{
        driver: "NightOwl",
        vehicle: "MX-5 NA",
        ms: 245729,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-12"
      }, {
        driver: "Momo_GR",
        vehicle: "NSX-R",
        ms: 253066,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-04"
      }, {
        driver: "AKINA_8686",
        vehicle: "AE86 Trueno",
        ms: 269780,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-18"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "R34 GT-R",
        ms: 250687,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-24"
      }, {
        driver: "陳GTR",
        vehicle: "WRX STI",
        ms: 266118,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-27"
      }, {
        driver: "黑羽Kuro",
        vehicle: "S15 Silvia",
        ms: 252630,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-02"
      }]
    }]
  }, {
    id: "yuanfeng",
    group: "中部山道 Central",
    fam: "台14甲 · 合歡 Hehuan",
    name: "鳶峰",
    sign: "14甲",
    signSub: "省道",
    signColor: "#1F5EA8",
    routes: [{
      id: "yuan_0",
      name: "觀星段 Stargaze",
      dist: "6.3 km",
      records: [{
        driver: "DriftKing_Wu",
        vehicle: "NSX-R",
        ms: 174970,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-17"
      }, {
        driver: "Momo_GR",
        vehicle: "Civic EG6",
        ms: 174038,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-22"
      }, {
        driver: "白稜Shiro",
        vehicle: "EK9 Civic",
        ms: 172179,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-19"
      }, {
        driver: "阿維Avi",
        vehicle: "EK9 Civic",
        ms: 168338,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-08"
      }]
    }]
  }, {
    id: "shanlinxi",
    group: "中部山道 Central",
    fam: "投149 · 鹿谷 Lugu",
    name: "杉林溪",
    sign: "投149",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "shan_0",
      name: "上山 Uphill",
      dist: "16.5 km",
      records: [{
        driver: "Momo_GR",
        vehicle: "MX-5 NA",
        ms: 456034,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-20"
      }, {
        driver: "NightOwl",
        vehicle: "180SX",
        ms: 423225,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-01"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "S15 Silvia",
        ms: 462802,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-31"
      }, {
        driver: "AKINA_8686",
        vehicle: "Supra A80",
        ms: 434694,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-17"
      }]
    }]
  }, {
    id: "caoling",
    group: "中部山道 Central",
    fam: "149甲 · 古坑 Gukeng",
    name: "草嶺石壁",
    sign: "149甲",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "caol_0",
      name: "全段 Full",
      dist: "14.7 km",
      records: [{
        driver: "葉山Hayama",
        vehicle: "EVO IX",
        ms: 394008,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-20"
      }, {
        driver: "小傑Jay",
        vehicle: "180SX",
        ms: 409483,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-12"
      }, {
        driver: "雷神Raijin",
        vehicle: "WRX STI",
        ms: 393973,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-08"
      }]
    }]
  }, {
    id: "baguashan",
    group: "中部山道 Central",
    fam: "139 · 彰化 Changhua",
    name: "八卦山",
    sign: "139",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "bagu_0",
      name: "稜線 Ridge",
      dist: "9.2 km",
      records: [{
        driver: "NightOwl",
        vehicle: "WRX STI",
        ms: 242804,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-07"
      }]
    }]
  }, {
    id: "dayan",
    group: "中部山道 Central",
    fam: "投49 · 竹山 Zhushan",
    name: "大鞍",
    sign: "投49",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "daya_0",
      name: "下山 Downhill",
      dist: "7.7 km",
      records: [{
        driver: "小傑Jay",
        vehicle: "Integra DC2",
        ms: 206738,
        plat: "Desktop",
        fps: 72,
        date: "2026-04-16"
      }, {
        driver: "Nora_R34",
        vehicle: "NSX-R",
        ms: 204838,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-19"
      }, {
        driver: "林Sasaki",
        vehicle: "Integra DC2",
        ms: 204868,
        plat: "Desktop",
        fps: 72,
        date: "2026-04-25"
      }]
    }]
  }, {
    id: "shuangqi",
    group: "中部山道 Central",
    fam: "中47 · 和平 Heping",
    name: "雙崎",
    sign: "中47",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "shua_0",
      name: "產線 Track",
      dist: "15.0 km",
      records: [{
        driver: "K.Tanaka",
        vehicle: "S15 Silvia",
        ms: 401535,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-14"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "EVO IX",
        ms: 392804,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-07"
      }, {
        driver: "阿維Avi",
        vehicle: "Lancer Evo VI",
        ms: 393838,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-17"
      }, {
        driver: "林Sasaki",
        vehicle: "WRX STI",
        ms: 417149,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-24"
      }]
    }]
  }, {
    id: "cuiluan",
    group: "中部山道 Central",
    fam: "投83 · 仁愛 Ren'ai",
    name: "翠巒",
    sign: "投83",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "cuil_0",
      name: "全段 Full",
      dist: "7.0 km",
      records: [{
        driver: "阿維Avi",
        vehicle: "EVO IX",
        ms: 183651,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-10"
      }, {
        driver: "Momo_GR",
        vehicle: "180SX",
        ms: 196825,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-03"
      }, {
        driver: "白稜Shiro",
        vehicle: "Lancer Evo VI",
        ms: 184526,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-13"
      }]
    }]
  }, {
    id: "erjian",
    group: "中部山道 Central",
    fam: "嘉154 · 梅山 Meishan",
    name: "二尖",
    sign: "嘉154",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "erji_0",
      name: "環線 Loop",
      dist: "15.3 km",
      records: [{
        driver: "Ryo_FC3S",
        vehicle: "Skyline R32",
        ms: 414896,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-11"
      }]
    }]
  }, {
    id: "yuchang",
    group: "東部山道 East",
    fam: "台30 · 玉里 Yuli",
    name: "玉長公路",
    sign: "30",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "yuch_0",
      name: "東行 East",
      dist: "7.1 km",
      records: [{
        driver: "陳GTR",
        vehicle: "180SX",
        ms: 187036,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-29"
      }, {
        driver: "雷神Raijin",
        vehicle: "180SX",
        ms: 191508,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-11"
      }, {
        driver: "NightOwl",
        vehicle: "EVO IX",
        ms: 200690,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-24"
      }, {
        driver: "黑羽Kuro",
        vehicle: "AE86 Trueno",
        ms: 193447,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-09"
      }, {
        driver: "林Sasaki",
        vehicle: "WRX STI",
        ms: 185333,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-21"
      }]
    }]
  }, {
    id: "chishang",
    group: "東部山道 East",
    fam: "197 · 池上 Chishang",
    name: "池上富里",
    sign: "197",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "chis_0",
      name: "縱線 Valley",
      dist: "7.1 km",
      records: [{
        driver: "雷神Raijin",
        vehicle: "NSX-R",
        ms: 197753,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-09"
      }, {
        driver: "Momo_GR",
        vehicle: "180SX",
        ms: 193533,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-26"
      }, {
        driver: "峰Mine",
        vehicle: "180SX",
        ms: 197574,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-31"
      }, {
        driver: "黑羽Kuro",
        vehicle: "Lancer Evo VI",
        ms: 197443,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-23"
      }]
    }]
  }, {
    id: "ruisui",
    group: "東部山道 East",
    fam: "台9 · 瑞穗 Ruisui",
    name: "瑞穗富源",
    sign: "9",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "ruis_0",
      name: "河階段 Terrace",
      dist: "17.5 km",
      records: []
    }]
  }, {
    id: "lintianshan",
    group: "東部山道 East",
    fam: "台16 · 鳳林 Fenglin",
    name: "林田山",
    sign: "16",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "lint_0",
      name: "林場線 Mill",
      dist: "13.6 km",
      records: [{
        driver: "小傑Jay",
        vehicle: "Integra DC2",
        ms: 355581,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-05"
      }, {
        driver: "Ryo_FC3S",
        vehicle: "Supra A80",
        ms: 349304,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-14"
      }, {
        driver: "林Sasaki",
        vehicle: "RX-7 FD",
        ms: 355824,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-27"
      }, {
        driver: "Momo_GR",
        vehicle: "EVO IX",
        ms: 358346,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-25"
      }]
    }]
  }, {
    id: "liyutan",
    group: "東部山道 East",
    fam: "台9甲 · 壽豐 Shoufeng",
    name: "鯉魚潭",
    sign: "9甲",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "liyu_0",
      name: "環潭 Lake",
      dist: "11.2 km",
      records: [{
        driver: "K.Tanaka",
        vehicle: "NSX-R",
        ms: 285601,
        plat: "Desktop",
        fps: 90,
        date: "2026-04-25"
      }]
    }]
  }, {
    id: "guangfu",
    group: "東部山道 East",
    fam: "193 · 光復 Guangfu",
    name: "光復大農",
    sign: "193",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "guan_0",
      name: "山線 Hill",
      dist: "17.8 km",
      records: [{
        driver: "180SX_Koba",
        vehicle: "EK9 Civic",
        ms: 461556,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-01"
      }, {
        driver: "白稜Shiro",
        vehicle: "Civic EG6",
        ms: 461104,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-31"
      }]
    }]
  }, {
    id: "emudan",
    group: "東部山道 East",
    fam: "199 · 牡丹 Mudan",
    name: "牡丹旭海",
    sign: "199",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "emud_0",
      name: "越嶺 Pass",
      dist: "9.5 km",
      records: [{
        driver: "180SX_Koba",
        vehicle: "Supra A80",
        ms: 244313,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-03"
      }, {
        driver: "NightOwl",
        vehicle: "S15 Silvia",
        ms: 265490,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-22"
      }]
    }]
  }, {
    id: "fuli",
    group: "東部山道 East",
    fam: "193 · 富里 Fuli",
    name: "富里東里",
    sign: "193",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "fuli_0",
      name: "南段 South",
      dist: "9.5 km",
      records: [{
        driver: "林Sasaki",
        vehicle: "GR86",
        ms: 245546,
        plat: "Desktop",
        fps: 72,
        date: "2026-04-14"
      }, {
        driver: "阿維Avi",
        vehicle: "EK9 Civic",
        ms: 265905,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-12"
      }]
    }]
  }, {
    id: "wutai",
    group: "南部山道 South",
    fam: "台24 · 三地門 Sandimen",
    name: "霧台",
    sign: "24",
    signSub: "省道",
    signColor: "#1F5EA8",
    routes: [{
      id: "wuta_0",
      name: "上山 Climb",
      dist: "7.1 km",
      records: [{
        driver: "Ryo_FC3S",
        vehicle: "EVO IX",
        ms: 192088,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-07"
      }]
    }]
  }, {
    id: "tengzhi",
    group: "南部山道 South",
    fam: "132林道 · 桃源 Taoyuan",
    name: "藤枝",
    sign: "藤枝",
    signSub: "林道",
    signColor: "#2F4F3A",
    routes: [{
      id: "teng_0",
      name: "林道 Forest",
      dist: "11.3 km",
      records: [{
        driver: "林Sasaki",
        vehicle: "Civic EG6",
        ms: 308406,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-30"
      }, {
        driver: "白稜Shiro",
        vehicle: "S15 Silvia",
        ms: 312603,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-15"
      }, {
        driver: "Nora_R34",
        vehicle: "180SX",
        ms: 295401,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-27"
      }, {
        driver: "DriftKing_Wu",
        vehicle: "S2000",
        ms: 306106,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-22"
      }]
    }]
  }, {
    id: "maolin",
    group: "南部山道 South",
    fam: "高132 · 茂林 Maolin",
    name: "茂林多納",
    sign: "高132",
    signSub: "鄉道",
    signColor: "#7C6238",
    routes: [{
      id: "maol_0",
      name: "谷線 Gorge",
      dist: "16.2 km",
      records: []
    }]
  }, {
    id: "shouka",
    group: "南部山道 South",
    fam: "台9 · 達仁 Daren",
    name: "壽卡",
    sign: "9",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "shou_0",
      name: "南迴段 Nanhui",
      dist: "11.3 km",
      records: [{
        driver: "DriftKing_Wu",
        vehicle: "Lancer Evo VI",
        ms: 300751,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-01"
      }, {
        driver: "陳GTR",
        vehicle: "Integra DC2",
        ms: 316687,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-26"
      }, {
        driver: "葉山Hayama",
        vehicle: "S2000",
        ms: 311377,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-07"
      }, {
        driver: "NightOwl",
        vehicle: "EK9 Civic",
        ms: 310197,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-12"
      }, {
        driver: "Momo_GR",
        vehicle: "Lancer Evo VI",
        ms: 308478,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-15"
      }]
    }]
  }, {
    id: "road199",
    group: "南部山道 South",
    fam: "199 · 牡丹 Mudan",
    name: "199縣道",
    sign: "199",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "road_0",
      name: "全段 Full",
      dist: "14.7 km",
      records: [{
        driver: "Nora_R34",
        vehicle: "EK9 Civic",
        ms: 382233,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-16"
      }, {
        driver: "DriftKing_Wu",
        vehicle: "R34 GT-R",
        ms: 379379,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-31"
      }]
    }]
  }, {
    id: "dawu",
    group: "南部山道 South",
    fam: "台9 · 大武 Dawu",
    name: "大武",
    sign: "9",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "dawu_0",
      name: "海線 Coast",
      dist: "15.0 km",
      records: [{
        driver: "180SX_Koba",
        vehicle: "EK9 Civic",
        ms: 410442,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-13"
      }]
    }]
  }, {
    id: "ruili",
    group: "南部山道 South",
    fam: "嘉122 · 梅山 Meishan",
    name: "瑞里",
    sign: "嘉122",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "ruil_0",
      name: "上山 Uphill",
      dist: "7.7 km",
      records: [{
        driver: "Nora_R34",
        vehicle: "R34 GT-R",
        ms: 209019,
        plat: "PCVR",
        fps: 144,
        date: "2026-04-14"
      }]
    }]
  }, {
    id: "meishantaiping",
    group: "南部山道 South",
    fam: "162甲 · 梅山 Meishan",
    name: "梅山太平",
    sign: "162甲",
    signSub: "縣道",
    signColor: "#7C6238",
    routes: [{
      id: "meis_0",
      name: "36彎 36 Bends",
      dist: "9.5 km",
      records: [{
        driver: "Ryo_FC3S",
        vehicle: "Supra A80",
        ms: 246043,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-09"
      }, {
        driver: "陳GTR",
        vehicle: "S15 Silvia",
        ms: 251110,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-21"
      }, {
        driver: "阿維Avi",
        vehicle: "RX-7 FD",
        ms: 247325,
        plat: "Desktop",
        fps: 60,
        date: "2026-04-05"
      }, {
        driver: "Nora_R34",
        vehicle: "S2000",
        ms: 262139,
        plat: "Desktop",
        fps: 60,
        date: "2026-05-05"
      }]
    }]
  }, {
    id: "zengwen",
    group: "南部山道 South",
    fam: "台3 · 楠西 Nanxi",
    name: "曾文",
    sign: "3",
    signSub: "省道",
    signColor: "#1E6B3E",
    routes: [{
      id: "zeng_0",
      name: "水庫線 Reservoir",
      dist: "6.0 km",
      records: [{
        driver: "180SX_Koba",
        vehicle: "R34 GT-R",
        ms: 162727,
        plat: "PCVR",
        fps: 120,
        date: "2026-05-13"
      }, {
        driver: "Momo_GR",
        vehicle: "EVO IX",
        ms: 156793,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-08"
      }, {
        driver: "林Sasaki",
        vehicle: "NSX-R",
        ms: 158570,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-03"
      }, {
        driver: "阿維Avi",
        vehicle: "S2000",
        ms: 167762,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-17"
      }]
    }]
  }, {
    id: "galaxybridge",
    group: "虛構場景 Fiction",
    fam: "Project T · 虛構",
    name: "銀河大橋 Galaxy Bridge",
    sign: "T",
    signSub: "場景",
    signColor: "#2F4F3A",
    routes: [{
      id: "gala_0",
      name: "跨橋 Span",
      dist: "4.5 km",
      records: [{
        driver: "葉山Hayama",
        vehicle: "S15 Silvia",
        ms: 120081,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-04"
      }, {
        driver: "白稜Shiro",
        vehicle: "EK9 Civic",
        ms: 120022,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-04"
      }, {
        driver: "峰Mine",
        vehicle: "EVO IX",
        ms: 125919,
        plat: "Desktop",
        fps: 72,
        date: "2026-04-06"
      }]
    }]
  }, {
    id: "derelictdocks",
    group: "虛構場景 Fiction",
    fam: "Project T · 虛構",
    name: "廢港夜線 Derelict Docks",
    sign: "T",
    signSub: "場景",
    signColor: "#2F4F3A",
    routes: [{
      id: "dere_0",
      name: "夜線 Night",
      dist: "4.0 km",
      records: []
    }]
  }, {
    id: "skywayloop",
    group: "虛構場景 Fiction",
    fam: "Project T · 虛構",
    name: "高架環線 Skyway Loop",
    sign: "T",
    signSub: "場景",
    signColor: "#2F4F3A",
    routes: [{
      id: "skyw_0",
      name: "環線 Loop",
      dist: "14.9 km",
      records: [{
        driver: "Ryo_FC3S",
        vehicle: "S2000",
        ms: 406666,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-18"
      }, {
        driver: "AKINA_8686",
        vehicle: "NSX-R",
        ms: 385237,
        plat: "Desktop",
        fps: 72,
        date: "2026-05-12"
      }, {
        driver: "林Sasaki",
        vehicle: "WRX STI",
        ms: 397908,
        plat: "PCVR",
        fps: 144,
        date: "2026-05-12"
      }]
    }]
  }, {
    id: "tunnelrun",
    group: "虛構場景 Fiction",
    fam: "Project T · 虛構",
    name: "隧道競速 Tunnel Run",
    sign: "T",
    signSub: "場景",
    signColor: "#2F4F3A",
    routes: [{
      id: "tunn_0",
      name: "直線 Sprint",
      dist: "7.2 km",
      records: [{
        driver: "NightOwl",
        vehicle: "RX-7 FD",
        ms: 202200,
        plat: "PCVR",
        fps: 120,
        date: "2026-04-09"
      }, {
        driver: "AKINA_8686",
        vehicle: "R34 GT-R",
        ms: 202966,
        plat: "Desktop",
        fps: 90,
        date: "2026-05-20"
      }]
    }]
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "time-attack-data.js", error: String((e && e.message) || e) }); }

// time-attack.js
try { (() => {
/* Time Attack — render + interactions.
   Badge logic mirrors leaderboard_builder.apply_badges():
   per route → TR (fastest overall) > CR (fastest per vehicle) > PR (fastest per driver). */
(function () {
  var DATA = window.TA_DATA;

  // ---- helpers ----
  function fmt(ms) {
    if (ms == null) return "—";
    var m = Math.floor(ms / 60000);
    var s = Math.floor(ms % 60000 / 1000);
    var mm = ms % 1000;
    var sec = (s < 10 ? "0" : "") + s;
    var mil = ("00" + mm).slice(-3);
    return m + ":" + sec + "." + mil;
  }
  function gap(ms, best) {
    var d = ms - best;
    if (d === 0) return {
      txt: "—",
      best: true
    };
    var s = Math.floor(d / 1000),
      mm = d % 1000;
    return {
      txt: "+" + s + "." + ("00" + mm).slice(-3),
      best: false
    };
  }
  // returns sorted copy with badge assigned (TR/CR/PR/"")
  function withBadges(records) {
    var sorted = records.map(function (r, i) {
      return Object.assign({
        _i: i
      }, r);
    }).sort(function (a, b) {
      return a.ms - b.ms;
    });
    var seenV = {},
      seenP = {};
    sorted.forEach(function (r) {
      r.badge = "";
    });
    if (sorted.length) {
      sorted[0].badge = "TR";
    }
    sorted.forEach(function (r) {
      if (!(r.vehicle in seenV)) {
        seenV[r.vehicle] = r;
      }
      if (!(r.driver in seenP)) {
        seenP[r.driver] = r;
      }
    });
    Object.keys(seenV).forEach(function (v) {
      var r = seenV[v];
      if (!r.badge) r.badge = "CR";
    });
    Object.keys(seenP).forEach(function (p) {
      var r = seenP[p];
      if (!r.badge) r.badge = "PR";
    });
    return sorted;
  }
  function variantById(id) {
    return DATA.variants.find(function (v) {
      return v.id === id;
    });
  }
  function variantRecordCount(v) {
    return v.routes.reduce(function (a, r) {
      return a + r.records.length;
    }, 0);
  }
  function bestOf(v) {
    var best = null;
    v.routes.forEach(function (r) {
      r.records.forEach(function (rec) {
        if (!best || rec.ms < best.ms) best = rec;
      });
    });
    return best;
  }
  function groupCount(g) {
    return DATA.variants.filter(function (v) {
      return v.group === g;
    }).length;
  }
  function scrollToEl(el) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - 16;
    window.scrollTo({
      top: y,
      behavior: "smooth"
    });
  }
  var REGION_SHORT = {
    "北部山道 North": "北部 North",
    "中部山道 Central": "中部 Central",
    "東部山道 East": "東部 East",
    "南部山道 South": "南部 South",
    "虛構場景 Fiction": "虛構 Fiction"
  };
  function routeById(v, id) {
    return v.routes.find(function (r) {
      return r.id === id;
    });
  }
  function firstNonEmptyRoute(v) {
    return v.routes.find(function (r) {
      return r.records.length;
    }) || v.routes[0];
  }
  // slug for image-slot ids (drop spaces/symbols; CJK is a valid id char)
  function slug(s) {
    return String(s).replace(/[^\w\u4e00-\u9fff]+/g, "-");
  }
  function avatarSlot(driver, cls) {
    return '<image-slot class="' + cls + '" id="av-' + slug(driver) + '" shape="circle" placeholder="頭像"></image-slot>';
  }

  // ---- state ----
  var state = {
    variantId: DATA.variants[0].id,
    routeId: firstNonEmptyRoute(DATA.variants[0]).id,
    view: "route",
    theme: "dark",
    query: "",
    region: "__all",
    collapsed: {}
  };

  // ---- build rows for the active view ----
  function rowsFor(route, view) {
    var ranked = withBadges(route.records); // sorted asc, with badges
    if (view === "route") return ranked;
    var seen = {},
      key = view === "vehicle" ? "vehicle" : "driver",
      out = [];
    ranked.forEach(function (r) {
      if (!(r[key] in seen)) {
        seen[r[key]] = true;
        out.push(r);
      }
    });
    return out; // already time-sorted; one row per vehicle/driver
  }

  // ---- renderers ----
  // active-track strip (replaces the old flat tab row)
  function renderActiveStrip() {
    var v = variantById(state.variantId);
    document.getElementById("activeStrip").innerHTML = '<div class="shield" style="background:' + v.signColor + '">' + v.sign + '<small>' + v.signSub + '</small></div>' + '<div class="as-tx"><span class="as-eyebrow">目前賽道 · Now viewing</span>' + '<span class="as-name">' + v.name + '</span><span class="as-fam">' + v.fam + '</span></div>' + '<div class="as-meta">' + '<div class="as-stat"><b>' + v.routes.length + '</b><span>路線 routes</span></div>' + '<div class="as-stat"><b>' + variantRecordCount(v) + '</b><span>紀錄 runs</span></div>' + '<button class="as-change" id="changeTrack">切換賽道 Change ▾</button>' + '</div>';
  }

  // region filter chips
  function renderRegionChips() {
    var el = document.getElementById("regionChips");
    var chips = ['<button class="rchip' + (state.region === "__all" ? " on" : "") + '" data-g="__all">全部 All <i>' + DATA.variants.length + '</i></button>'];
    DATA.groups.forEach(function (g) {
      chips.push('<button class="rchip' + (state.region === g ? " on" : "") + '" data-g="' + g + '">' + (REGION_SHORT[g] || g) + ' <i>' + groupCount(g) + '</i></button>');
    });
    el.innerHTML = chips.join("");
  }
  function matchesQuery(v, q) {
    if (!q) return true;
    return (v.name + " " + v.fam + " " + v.sign + " " + v.group).toLowerCase().indexOf(q) >= 0;
  }
  function trackRow(v) {
    var on = v.id === state.variantId ? " on" : "";
    var best = bestOf(v);
    var bestHtml = best ? '<div class="tr-best"><span class="t">' + fmt(best.ms) + '</span><span class="who">' + best.driver + '</span></div>' : '<div class="tr-best"><span class="empty">待刷新 —</span></div>';
    return '<div class="trow' + on + '" data-v="' + v.id + '">' + '<div class="shield" style="background:' + v.signColor + '">' + v.sign + '<small>' + v.signSub + '</small></div>' + '<div class="tr-main"><div class="tr-name">' + v.name + '</div><div class="tr-fam">' + v.fam + '</div></div>' + '<div class="tr-routes">' + v.routes.length + ' 路線 · ' + variantRecordCount(v) + ' 紀錄</div>' + bestHtml + '</div>';
  }
  function renderList() {
    var q = state.query.trim().toLowerCase();
    var el = document.getElementById("tlist");
    var groups = state.region === "__all" ? DATA.groups.slice() : [state.region];
    var shown = 0,
      html = "";
    groups.forEach(function (g) {
      var vs = DATA.variants.filter(function (v) {
        return v.group === g && matchesQuery(v, q);
      });
      if (!vs.length) return;
      shown += vs.length;
      var collapsed = q ? false : !!state.collapsed[g]; // a live search always expands
      html += '<div class="tgroup' + (collapsed ? " collapsed" : "") + '" data-g="' + g + '">' + '<div class="tg-head"><span class="tg-caret"></span>' + '<span class="tg-name">' + g + '</span><span class="tg-count">' + vs.length + ' 賽道</span></div>' + '<div class="tg-body">' + vs.map(trackRow).join("") + '</div></div>';
    });
    el.innerHTML = shown ? html : '<div class="tlist-empty">找不到符合「' + (state.query.trim() || "—") + '」的賽道 · No tracks match</div>';
    document.getElementById("ovCount").textContent = "顯示 " + shown + " / " + DATA.variants.length + " 賽道";
  }
  function renderFinder() {
    renderRegionChips();
    renderList();
  }
  function renderRouteSeg() {
    var v = variantById(state.variantId);
    var el = document.getElementById("routeSeg");
    el.innerHTML = v.routes.map(function (r) {
      var on = r.id === state.routeId ? " on" : "";
      var empty = r.records.length ? "" : " style='opacity:.45'";
      return '<button data-r="' + r.id + '"' + on + empty + '>' + r.name + '</button>';
    }).join("");
  }
  function renderTrackBanner() {
    var v = variantById(state.variantId);
    var el = document.getElementById("trackBanner");
    el.innerHTML = '<image-slot id="trk-' + v.id + '" shape="rect" placeholder="拖入賽道照片 · Track photo"></image-slot>' + '<div class="tb-overlay"><div><div class="tb-name">' + v.name + '</div><div class="tb-fam">' + v.fam + '</div></div></div>';
  }
  function renderHero() {
    var v = variantById(state.variantId),
      route = routeById(v, state.routeId);
    var el = document.getElementById("hero");
    if (!route.records.length) {
      el.innerHTML = '<div class="hero-mid"><span class="hero-label">尚無紀錄 · No records yet</span>' + '<span class="hero-driver" style="color:var(--b-fg-dim)">' + route.name + '</span></div>';
      return;
    }
    var fast = withBadges(route.records)[0];
    el.innerHTML = '<div class="hero-badge"><span class="bt">TR</span><span class="bl">Track Rec</span></div>' + avatarSlot(fast.driver, "hero-av") + '<div class="hero-mid">' + '<div class="hero-top"><span class="hero-label">最快一筆 · Fastest Lap</span>' + '<span class="hero-route">' + v.name + ' — ' + route.name + '</span></div>' + '<div class="hero-driver">' + fast.driver + '</div>' + '<div class="hero-meta"><span>' + fast.vehicle + '</span><span class="dot"></span>' + '<span class="pchip ' + (fast.plat === "PCVR" ? "pcvr" : "") + '">' + fast.plat + '</span>' + '<span>' + fast.fps + ' fps</span><span class="dot"></span><span>' + fast.date + '</span></div>' + '</div>' + '<div class="hero-time"><div class="t mono">' + fmt(fast.ms) + '</div><div class="tl">' + route.dist + ' · ' + route.records.length + ' runs</div></div>';
  }
  function renderTable() {
    var v = variantById(state.variantId),
      route = routeById(v, state.routeId);
    var rows = rowsFor(route, state.view);
    var tbody = document.getElementById("tbody");
    document.getElementById("colHead").textContent = state.view === "vehicle" ? "車輛 Vehicle" : state.view === "driver" ? "車手 Driver" : "車手 Driver";
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:34px;text-align:center;color:var(--b-fg-dim);font-family:var(--font-mono);letter-spacing:.06em">此路線尚無紀錄 · No records on this route yet</td></tr>';
    } else {
      var best = rows[0].ms;
      tbody.innerHTML = rows.map(function (r, i) {
        var g = gap(r.ms, best);
        var leader = i === 0 ? " leader" : "";
        // primary cell: in vehicle view show vehicle as headline, driver underneath; else driver headline + vehicle col
        var headline, vehCol;
        if (state.view === "vehicle") {
          headline = r.vehicle;
          vehCol = r.driver;
        } else {
          headline = r.driver;
          vehCol = r.vehicle;
        }
        var badge = r.badge ? '<span class="bdg ' + r.badge.toLowerCase() + '">' + r.badge + '</span>' : '';
        var headCell = state.view === "vehicle" ? '<div class="veh-wrap"><image-slot class="veh-ph" id="veh-' + slug(r.vehicle) + '" shape="rounded" radius="3" placeholder="車"></image-slot>' + '<div class="c-driver">' + headline + '<span class="plat"><span class="pchip ' + (r.plat === "PCVR" ? "pcvr" : "") + '">' + r.plat + '</span>' + r.fps + ' fps · ' + r.date + '</span></div></div>' : '<div class="c-driver-wrap">' + avatarSlot(r.driver, "row-av") + '<div class="c-driver">' + headline + '<span class="plat"><span class="pchip ' + (r.plat === "PCVR" ? "pcvr" : "") + '">' + r.plat + '</span>' + r.fps + ' fps · ' + r.date + '</span></div></div>';
        return '<tr class="' + leader.trim() + '">' + '<td class="c-rank"><span class="rank">' + (i + 1) + '</span></td>' + '<td>' + headCell + '</td>' + '<td class="thead-veh c-veh">' + vehCol + '</td>' + '<td class="c-time"><span class="t mono">' + fmt(r.ms) + '</span></td>' + '<td class="c-gap"><span class="g mono' + (g.best ? ' best' : '') + '">' + g.txt + '</span></td>' + '<td class="c-badge">' + badge + '</td>' + '</tr>';
      }).join("");
    }

    // foot summary
    var totalRuns = v.routes.reduce(function (a, r) {
      return a + r.records.length;
    }, 0);
    var viewLabel = state.view === "route" ? "全部紀錄 all runs" : state.view === "vehicle" ? "每車最快 best per vehicle" : "每位車手最快 best per driver";
    document.getElementById("footL").innerHTML = '顯示 <b>' + rows.length + '</b> 列 · ' + viewLabel;
    document.getElementById("footR").innerHTML = v.name + ' 共 <b>' + totalRuns + '</b> 筆紀錄 · <b>' + v.routes.length + '</b> 條路線';
  }
  function renderBoard() {
    renderRouteSeg();
    renderTrackBanner();
    renderHero();
    renderTable();
  }
  function renderAll() {
    renderActiveStrip();
    renderBoard();
    renderFinder();
    renderClub();
  }

  // ---- club / members ----
  function driverStats() {
    var stat = {}; // driver -> {TR,CR,PR,runs,veh:{}}
    function ensure(d) {
      return stat[d] || (stat[d] = {
        TR: 0,
        CR: 0,
        PR: 0,
        runs: 0,
        veh: {}
      });
    }
    DATA.variants.forEach(function (v) {
      v.routes.forEach(function (r) {
        withBadges(r.records).forEach(function (rec) {
          var s = ensure(rec.driver);
          s.runs++;
          s.veh[rec.vehicle] = (s.veh[rec.vehicle] || 0) + 1;
          if (rec.badge) s[rec.badge]++;
        });
      });
    });
    return stat;
  }
  function topVeh(veh) {
    var best = "",
      n = -1;
    Object.keys(veh).forEach(function (k) {
      if (veh[k] > n) {
        n = veh[k];
        best = k;
      }
    });
    return best;
  }
  function renderClub() {
    var stat = driverStats();
    var drivers = Object.keys(stat).sort(function (a, b) {
      return stat[b].TR - stat[a].TR || stat[b].runs - stat[a].runs;
    });
    document.getElementById("members").innerHTML = drivers.map(function (d) {
      var s = stat[d];
      var chips = [];
      if (s.TR) chips.push('<span class="mb tr">TR<small>×' + s.TR + '</small></span>');
      if (s.CR) chips.push('<span class="mb cr">CR<small>×' + s.CR + '</small></span>');
      if (s.PR) chips.push('<span class="mb pr">PR<small>×' + s.PR + '</small></span>');
      while (chips.length < 3) chips.push('<span class="mb empty"></span>'); // reserved badge slots
      return '<div class="member">' + '<div class="member-photo"><image-slot id="photo-' + slug(d) + '" shape="rect" placeholder="個人照片"></image-slot></div>' + '<div class="member-body">' + avatarSlot(d, "member-av") + '<div class="member-name">' + d + '</div>' + '<div class="member-sub">' + s.runs + ' runs · 常用 ' + topVeh(s.veh) + '</div>' + '<div class="member-badges">' + chips.join("") + '</div>' + '</div></div>';
    }).join("");
  }

  // ---- selection ----
  function selectVariant(id) {
    state.variantId = id;
    state.routeId = firstNonEmptyRoute(variantById(id)).id;
    renderActiveStrip();
    renderBoard();
    // toggle highlight in place (no list re-render — keeps scroll position)
    document.querySelectorAll(".trow").forEach(function (r) {
      r.classList.toggle("on", r.dataset.v === id);
    });
  }

  // ---- events ----
  // active strip: "change track" jumps to the finder and focuses search
  document.getElementById("activeStrip").addEventListener("click", function (e) {
    if (e.target.closest("#changeTrack")) {
      scrollToEl(document.getElementById("finderHead"));
      var s = document.getElementById("trackSearch");
      if (s) setTimeout(function () {
        s.focus();
      }, 380);
    }
  });
  // search (live filter)
  document.getElementById("trackSearch").addEventListener("input", function (e) {
    state.query = e.target.value;
    renderList();
  });
  // region chips
  document.getElementById("regionChips").addEventListener("click", function (e) {
    var b = e.target.closest(".rchip");
    if (!b) return;
    state.region = b.dataset.g;
    renderRegionChips();
    renderList();
  });
  // track list: collapse a region group, or select a track row
  document.getElementById("tlist").addEventListener("click", function (e) {
    var head = e.target.closest(".tg-head");
    if (head) {
      var grp = head.parentElement;
      var g = grp.dataset.g;
      var c = grp.classList.toggle("collapsed");
      state.collapsed[g] = c;
      return;
    }
    var row = e.target.closest(".trow");
    if (row) {
      selectVariant(row.dataset.v);
      scrollToEl(document.getElementById("activeStrip"));
    }
  });
  document.getElementById("routeSeg").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.routeId = b.dataset.r;
    document.querySelectorAll("#routeSeg button").forEach(function (x) {
      x.classList.toggle("on", x === b);
    });
    renderHero();
    renderTable();
  });
  document.getElementById("viewSeg").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.view = b.dataset.view;
    document.querySelectorAll("#viewSeg button").forEach(function (x) {
      x.classList.toggle("on", x === b);
    });
    renderTable();
  });
  // optional theme toggle (removed from the night-canonical page; kept guarded)
  var tt = document.getElementById("themeToggle");
  if (tt) tt.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.theme = b.dataset.theme;
    document.getElementById("board").classList.toggle("paper", state.theme === "paper");
    tt.querySelectorAll("button").forEach(function (x) {
      var on = x === b;
      x.classList.toggle("on", on);
      x.classList.toggle("paper", on && state.theme === "paper");
    });
  });
  renderAll();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "time-attack.js", error: String((e && e.message) || e) }); }

})();
