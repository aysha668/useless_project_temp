import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ImageCropper v3
 *  • Canvas renders image at natural size scaled DOWN to fit container (never upscaled)
 *  • Drag anywhere to draw a new crop selection
 *  • Crop always maintains the image's original aspect ratio
 *  • 8 handles (4 corners + 4 edge midpoints) to resize — ratio is locked
 *  • Drag interior to move the box
 *  • Smart cursor per zone
 */

const HANDLE_SIZE = 9;   // half-px of rendered handle square
const HANDLE_HIT  = 13;  // hit-test radius px

// ── Hit test ────────────────────────────────────────────────────────────────────
function getHandle(pt, rect) {
  if (!rect) return null;
  const { x, y, w, h } = rect;
  const cx = x + w / 2, cy = y + h / 2;

  const handles = {
    nw: [x,     y],     ne: [x + w, y],
    se: [x + w, y + h], sw: [x,     y + h],
    n:  [cx,    y],     s:  [cx,    y + h],
    e:  [x + w, cy],    w:  [x,     cy],
  };

  for (const [name, [hx, hy]] of Object.entries(handles)) {
    if (Math.abs(pt.x - hx) <= HANDLE_HIT && Math.abs(pt.y - hy) <= HANDLE_HIT) {
      return name;
    }
  }
  if (pt.x > x && pt.x < x + w && pt.y > y && pt.y < y + h) return 'move';
  return null;
}

const CURSOR_MAP = {
  nw: 'nw-resize', ne: 'ne-resize', se: 'se-resize', sw: 'sw-resize',
  n:  'n-resize',  s:  's-resize',  e:  'e-resize',  w:  'w-resize',
  move: 'move',
};

// ── Canvas draw ─────────────────────────────────────────────────────────────────
function drawCropper(canvas, img, rect, imgRect) {
  // imgRect = {x,y,w,h} in canvas px — the portion of canvas the image occupies
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Checkered background for areas outside the image (letterbox)
  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the actual image inside imgRect
  ctx.drawImage(img, imgRect.x, imgRect.y, imgRect.w, imgRect.h);

  if (!rect) {
    // Guide dashed border inside image area
    ctx.strokeStyle = 'rgba(0,204,255,0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    const m = 20;
    ctx.strokeRect(imgRect.x + m, imgRect.y + m, imgRect.w - m * 2, imgRect.h - m * 2);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(0,204,255,0.65)';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      '✂  Drag to select the screen area',
      imgRect.x + imgRect.w / 2,
      imgRect.y + imgRect.h / 2,
    );
    ctx.textAlign = 'left';
    return;
  }

  const { x, y, w, h } = rect;

  // Dim outside selection (but only within image area)
  ctx.save();
  ctx.beginPath();
  ctx.rect(imgRect.x, imgRect.y, imgRect.w, imgRect.h);
  ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.54)';
  ctx.fillRect(imgRect.x, imgRect.y, imgRect.w, imgRect.h);
  ctx.restore();

  // Redraw just the selection patch
  ctx.drawImage(
    img,
    ((x - imgRect.x) / imgRect.w) * img.naturalWidth,
    ((y - imgRect.y) / imgRect.h) * img.naturalHeight,
    (w / imgRect.w) * img.naturalWidth,
    (h / imgRect.h) * img.naturalHeight,
    x, y, w, h,
  );

  // Border
  ctx.strokeStyle = '#00ccff';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, w, h);

  // Rule-of-thirds grid
  ctx.strokeStyle = 'rgba(0,204,255,0.20)';
  ctx.lineWidth = 0.8;
  for (let i = 1; i <= 2; i++) {
    const gx = x + (w / 3) * i, gy = y + (h / 3) * i;
    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
  }

  // 8 handles
  const cx = x + w / 2, cy = y + h / 2;
  [
    [x,     y],  [cx,    y],  [x + w, y],
    [x + w, cy],
    [x + w, y + h], [cx, y + h], [x, y + h],
    [x,     cy],
  ].forEach(([hx, hy]) => {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx - HANDLE_SIZE, hy - HANDLE_SIZE, HANDLE_SIZE * 2, HANDLE_SIZE * 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(hx - HANDLE_SIZE, hy - HANDLE_SIZE, HANDLE_SIZE * 2, HANDLE_SIZE * 2);
  });

  // Dimension badge
  const badge = `${Math.round(w)} × ${Math.round(h)}`;
  ctx.font = 'bold 11px monospace';
  const tw = ctx.measureText(badge).width;
  const bx = x + (w - tw) / 2;
  const by = y > 26 ? y - 8 : y + h + 18;
  ctx.fillStyle = 'rgba(0,15,30,0.80)';
  ctx.fillRect(bx - 6, by - 14, tw + 12, 20);
  ctx.fillStyle = '#00ccff';
  ctx.fillText(badge, bx, by);
}

// ── Apply resize keeping aspect ratio ───────────────────────────────────────────
function applyResize(action, base, dx, dy, imgRect, ratio) {
  // ratio = naturalWidth / naturalHeight  (landscape > 1, portrait < 1)
  const MIN = 30;
  let { x, y, w, h } = base;

  if (action === 'move') {
    x = Math.max(imgRect.x, Math.min(base.x + dx, imgRect.x + imgRect.w - w));
    y = Math.max(imgRect.y, Math.min(base.y + dy, imgRect.y + imgRect.h - h));
    return { x, y, w, h };
  }

  // Determine primary axis from handle
  const isCorner = action.length === 2;

  if (isCorner) {
    // Corner: use the larger delta to drive both axes
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    const useX = absDx >= absDy;

    if (action.includes('e')) {
      w = Math.max(MIN, base.w + (useX ? dx : dy * ratio));
    } else { // w
      const newW = Math.max(MIN, base.w - (useX ? dx : dy * ratio));
      x = base.x + (base.w - newW);
      w = newW;
    }
    h = w / ratio;

    // Adjust y anchor for north handles
    if (action.includes('n')) {
      y = base.y + base.h - h;
    }
  } else {
    // Edge handle — drive from the moved axis, compute other
    if (action === 'e') { w = Math.max(MIN, base.w + dx); h = w / ratio; }
    if (action === 'w') { const nw = Math.max(MIN, base.w - dx); x = base.x + (base.w - nw); w = nw; h = w / ratio; }
    if (action === 's') { h = Math.max(MIN, base.h + dy); w = h * ratio; }
    if (action === 'n') { const nh = Math.max(MIN, base.h - dy); y = base.y + (base.h - nh); h = nh; w = h * ratio; }
  }

  // Clamp inside image rect
  x = Math.max(imgRect.x, x);
  y = Math.max(imgRect.y, y);
  w = Math.min(w, imgRect.x + imgRect.w - x);
  h = Math.min(h, imgRect.y + imgRect.h - y);

  return { x, y, w, h };
}

// ── Component ────────────────────────────────────────────────────────────────────
export default function ImageCropper({ src, onConfirm, onReset }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);

  // mutable interaction + layout state — no stale closures
  const stateRef = useRef({
    rect:      null,   // current crop rect in canvas px
    action:    null,   // 'draw' | handle | 'move'
    startPt:   null,
    startRect: null,
    imgRect:   null,   // {x,y,w,h} — image's rendered area inside the canvas
    ratio:     1,      // naturalWidth / naturalHeight
  });

  const [rect,      setRect]      = useState(null);
  const [cursor,    setCursor]    = useState('crosshair');
  const [confirmed, setConfirmed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // ── Draw ───────────────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !imgLoaded || !stateRef.current.imgRect) return;
    drawCropper(canvas, img, stateRef.current.rect, stateRef.current.imgRect);
  }, [imgLoaded]);

  useEffect(() => { redraw(); }, [redraw, rect]);

  // ── Canvas sizing — scale image DOWN to fit, never upscale ────────────────────
  const syncSize = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const containerW = canvas.parentElement
      ? canvas.parentElement.getBoundingClientRect().width
      : canvas.getBoundingClientRect().width;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const ratio = natW / natH;
    stateRef.current.ratio = ratio;

    // Scale DOWN only — never upscale beyond natural size
    const scale = Math.min(1, containerW / natW);
    const displayW = Math.round(natW * scale);
    const displayH = Math.round(natH * scale);

    // Canvas matches the image display size exactly — no letterbox needed
    if (canvas.width !== displayW || canvas.height !== displayH) {
      canvas.width  = displayW;
      canvas.height = displayH;
    }

    // imgRect covers the whole canvas
    stateRef.current.imgRect = { x: 0, y: 0, w: displayW, h: displayH };
    redraw();
  }, [redraw]);

  useEffect(() => {
    const ro = new ResizeObserver(syncSize);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [syncSize]);

  // ── Pointer helpers ────────────────────────────────────────────────────────────
  const toCanvas = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    // CSS may scale the canvas if max-width < canvas.width — account for that
    const scaleX = canvasRef.current.width  / r.width;
    const scaleY = canvasRef.current.height / r.height;
    return {
      x: Math.max(0, Math.min((e.clientX - r.left) * scaleX, canvasRef.current.width)),
      y: Math.max(0, Math.min((e.clientY - r.top)  * scaleY, canvasRef.current.height)),
    };
  };

  // ── Mouse down ────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (confirmed) { setConfirmed(false); onReset(); }
    e.preventDefault();
    const pt     = toCanvas(e);
    const cur    = stateRef.current.rect;
    const handle = getHandle(pt, cur);

    if (handle) {
      stateRef.current.action    = handle;
      stateRef.current.startPt   = pt;
      stateRef.current.startRect = { ...cur };
    } else {
      stateRef.current.action  = 'draw';
      stateRef.current.startPt = pt;
      stateRef.current.rect    = null;
      setRect(null);
    }
  }, [confirmed, onReset]);

  // ── Mouse move ────────────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt  = toCanvas(e);
    const cur = stateRef.current.rect;
    const { action, startPt, startRect, imgRect, ratio } = stateRef.current;

    if (!action) {
      const h = getHandle(pt, cur);
      setCursor(h ? (CURSOR_MAP[h] || 'default') : 'crosshair');
      return;
    }

    if (action === 'draw') {
      // Raw free draw — will be ratio-locked on mouse up or immediately
      const rawW = Math.abs(pt.x - startPt.x);
      const rawH = Math.abs(pt.y - startPt.y);
      // Lock to image aspect ratio from the start
      const w = Math.max(rawW, rawH * ratio);
      const h = w / ratio;
      const x = pt.x < startPt.x ? startPt.x - w : startPt.x;
      const y = pt.y < startPt.y ? startPt.y - h : startPt.y;
      const newRect = {
        x: Math.max(imgRect.x, x),
        y: Math.max(imgRect.y, y),
        w: Math.min(w, imgRect.x + imgRect.w - Math.max(imgRect.x, x)),
        h: Math.min(h, imgRect.y + imgRect.h - Math.max(imgRect.y, y)),
      };
      stateRef.current.rect = newRect;
      setRect(newRect);
    } else {
      const dx = pt.x - startPt.x;
      const dy = pt.y - startPt.y;
      const newRect = applyResize(action, startRect, dx, dy, imgRect, ratio);
      stateRef.current.rect = newRect;
      setRect(newRect);
    }
  }, []);

  // ── Mouse up ──────────────────────────────────────────────────────────────────
  const onMouseUp = useCallback(() => {
    const { action, rect: r } = stateRef.current;
    stateRef.current.action    = null;
    stateRef.current.startPt   = null;
    stateRef.current.startRect = null;
    if (action === 'draw' && r && (r.w < 12 || r.h < 12)) {
      stateRef.current.rect = null;
      setRect(null);
    }
  }, []);

  // Touch proxy
  const touch = (handler) => (e) => {
    e.preventDefault();
    const t = e.touches[0] || e.changedTouches[0];
    if (t) handler({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => {} });
  };

  // ── Crop payload (back to natural image pixels) ────────────────────────────────
  const toCropPayload = () => {
    const img = imgRef.current;
    const { rect: r, imgRect } = stateRef.current;
    if (!img || !r || !imgRect) return null;
    const sx = img.naturalWidth  / imgRect.w;
    const sy = img.naturalHeight / imgRect.h;
    return {
      x:      Math.round((r.x - imgRect.x) * sx),
      y:      Math.round((r.y - imgRect.y) * sy),
      width:  Math.round(r.w * sx),
      height: Math.round(r.h * sy),
    };
  };

  const handleConfirm = () => {
    if (!stateRef.current.rect) return;
    setConfirmed(true);
    onConfirm(toCropPayload());
  };

  const handleReset = () => {
    stateRef.current.rect = stateRef.current.action = stateRef.current.startPt = stateRef.current.startRect = null;
    setRect(null);
    setConfirmed(false);
    onReset();
    redraw();
  };

  const hasRect = !!rect;

  return (
    <div className="cropper-wrap">
      <img
        ref={imgRef}
        src={src}
        alt=""
        style={{ display: 'none' }}
        onLoad={() => { setImgLoaded(true); syncSize(); }}
      />

      {/* Status bar */}
      <div className={`cropper-hint-row ${confirmed ? 'confirmed' : ''}`}>
        <span className="cropper-hint-icon">{confirmed ? '✅' : '✂'}</span>
        <span>
          {confirmed
            ? 'Crop applied — drag handles to adjust, drag inside to move'
            : hasRect
              ? 'Drag corners/edges to resize · Drag inside to move · Confirm when done'
              : 'Drag over the phone screen to crop — aspect ratio is locked automatically'}
        </span>
        {rect && (
          <span className="cropper-size-pill">
            {Math.round(rect.w)} × {Math.round(rect.h)}
          </span>
        )}
      </div>

      {/* Canvas */}
      <div className="cropper-canvas-wrap">
        <canvas
          ref={canvasRef}
          className={`cropper-canvas ${confirmed ? 'confirmed' : ''}`}
          style={{ cursor }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={touch(onMouseDown)}
          onTouchMove={touch(onMouseMove)}
          onTouchEnd={touch(onMouseUp)}
        />
      </div>

      {/* Actions */}
      <div className="cropper-actions">
        {hasRect && !confirmed && (
          <button className="btn btn-primary btn-sm" onClick={handleConfirm}>✂ Confirm Crop</button>
        )}
        {confirmed && (
          <button className="btn btn-primary btn-sm" onClick={handleConfirm}>✔ Update Crop</button>
        )}
        {(hasRect || confirmed) && (
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>✕ Clear</button>
        )}
        {!hasRect && !confirmed && (
          <span className="cropper-tip">Crop out the background so only the screen surface is analyzed</span>
        )}
      </div>
    </div>
  );
}
