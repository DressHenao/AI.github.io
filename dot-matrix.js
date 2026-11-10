/**
 * BLC AI — Dot-Matrix Halftone Canvas
 * Exact recreation of the Kindred Creation-of-Adam scanline halftone effect.
 */

(function () {
  const canvas = document.getElementById('dots');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const HAND_SHEET_URL =
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85';

  const SHEET_W = 2688;
  const SHEET_H = 1520;

  // Sheet layout fractions [x, y, w, h]
  const RECTS = {
    LA: [0, 0.06, 0.47, 0.4],
    RA: [0.53, 0.06, 0.47, 0.4],
    LB: [0, 0.55, 0.47, 0.4],
    RB: [0.53, 0.55, 0.47, 0.4]
  };

  const LEVELS = [0, 0.26, 0.52, 0.78, 1];
  const LOOP = 20;

  let W = 0, H = 0, DPR = 1;
  let step = 7, rowStep = 14, cols = 0, rows = 0, R = 3;
  let seeds = null;

  // Pre-downscaled 420px wide tile canvases
  const tiles = {};
  let tilesReady = false;

  // Offscreen field canvases (cols x rows)
  const fA = document.createElement('canvas');
  const ctxA = fA.getContext('2d', { willReadFrequently: true });
  const fB = document.createElement('canvas');
  const ctxB = fB.getContext('2d', { willReadFrequently: true });

  function fract(x) {
    return x - Math.floor(x);
  }

  function hash(a, b) {
    return fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
  }

  function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
  }

  function smooth(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function mixAt(t, on, off, dur) {
    return smooth(on, on + dur, t) * (1 - smooth(off, off + dur, t));
  }

  // Generate fallback procedural hands if image takes time or is offline
  function createFallbackTile(isLeft, isOpen) {
    const tile = document.createElement('canvas');
    tile.width = 420;
    tile.height = Math.round(420 * (RECTS.LA[3] * SHEET_H) / (RECTS.LA[2] * SHEET_W));
    const tctx = tile.getContext('2d');
    
    // Fill white
    tctx.fillStyle = '#ffffff';
    tctx.fillRect(0, 0, tile.width, tile.height);

    tctx.save();
    if (!isLeft) {
      tctx.translate(tile.width, 0);
      tctx.scale(-1, 1);
    }

    // Draw stylized silhouette arm + hand
    tctx.fillStyle = '#1a1a1a';
    tctx.beginPath();
    tctx.moveTo(0, tile.height * 0.35);
    tctx.quadraticCurveTo(tile.width * 0.3, tile.height * 0.38, tile.width * 0.6, tile.height * 0.42);
    
    if (isOpen) {
      // Open hand (pose B)
      tctx.lineTo(tile.width * 0.85, tile.height * 0.28);
      tctx.lineTo(tile.width * 0.95, tile.height * 0.38);
      tctx.lineTo(tile.width * 0.9, tile.height * 0.52);
      tctx.lineTo(tile.width * 0.82, tile.height * 0.68);
    } else {
      // Pointing hand (pose A - Adam style)
      tctx.lineTo(tile.width * 0.85, tile.height * 0.42);
      tctx.lineTo(tile.width * 0.98, tile.height * 0.45); // Pointing index
      tctx.lineTo(tile.width * 0.98, tile.height * 0.49);
      tctx.lineTo(tile.width * 0.78, tile.height * 0.55);
      tctx.lineTo(tile.width * 0.75, tile.height * 0.66);
    }
    
    tctx.quadraticCurveTo(tile.width * 0.4, tile.height * 0.65, 0, tile.height * 0.68);
    tctx.closePath();
    tctx.fill();

    // Subtle inner shading
    tctx.fillStyle = '#777777';
    tctx.beginPath();
    tctx.ellipse(tile.width * 0.55, tile.height * 0.5, tile.width * 0.2, tile.height * 0.08, 0.1, 0, Math.PI * 2);
    tctx.fill();

    tctx.restore();
    return tile;
  }

  function initFallbackTiles() {
    tiles.LA = createFallbackTile(true, false);
    tiles.RA = createFallbackTile(false, false);
    tiles.LB = createFallbackTile(true, true);
    tiles.RB = createFallbackTile(false, true);
    tilesReady = true;
  }

  // Load external image with CORS
  const sourceImg = new Image();
  sourceImg.crossOrigin = 'anonymous';

  sourceImg.onload = function () {
    try {
      const naturalW = sourceImg.naturalWidth || 1600;
      const naturalH = sourceImg.naturalHeight || 905;

      const keys = ['LA', 'RA', 'LB', 'RB'];
      keys.forEach((k) => {
        const [rx, ry, rw, rh] = RECTS[k];
        const sx = rx * naturalW;
        const sy = ry * naturalH;
        const sw = rw * naturalW;
        const sh = rh * naturalH;

        const tile = document.createElement('canvas');
        tile.width = 420;
        tile.height = Math.round(420 * (sh / sw));
        const tctx = tile.getContext('2d');
        tctx.imageSmoothingEnabled = true;
        tctx.imageSmoothingQuality = 'high';
        tctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, tile.width, tile.height);
        tiles[k] = tile;
      });
      tilesReady = true;
    } catch (e) {
      console.warn('Higgsfield image slicing fallback triggered:', e);
      if (!tilesReady) initFallbackTiles();
    }
  };

  sourceImg.onerror = function () {
    console.warn('Higgsfield hands image failed to load, using procedural fallback.');
    initFallbackTiles();
  };

  // Immediate procedural init so canvas is never blank
  initFallbackTiles();
  sourceImg.src = HAND_SHEET_URL;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = Math.max(280, Math.round(rect.width || window.innerWidth));
    H = Math.max(160, Math.round(rect.height || 260));
    DPR = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    step = Math.max(3.8, Math.min(7, W / 180));
    rowStep = step * 2.05;
    cols = Math.ceil(W / step);
    rows = Math.ceil(H / rowStep);
    R = step * 0.46;

    fA.width = cols;
    fA.height = rows;
    fB.width = cols;
    fB.height = rows;

    seeds = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        seeds[j * cols + i] = 0.55 * hash(i, j) + 0.45 * hash(j * 3.1, 7.7);
      }
    }
  }

  window.addEventListener('resize', resize);
  resize();

  function drawHandIntoField(fCtx, tile, isLeft, t) {
    if (!tile) return;
    const ph = isLeft ? 0 : Math.PI;
    const a = (2 * Math.PI * t) / LOOP;

    // Calculate proportions so hands fit in the container on any screen resolution without clipping:
    const sliceAspect = (0.47 * 2688) / (0.40 * 1520); // ≈ 2.077 width / height
    const maxAllowedWidth = W * 0.52;
    const maxAllowedHeight = H * 0.82;
    
    const hw = Math.min(maxAllowedWidth, maxAllowedHeight * sliceAspect);
    const hh = hw / sliceAspect;
    const cy = H * 0.50; // Center vertically in the animation container

    const reach = (0.02 * Math.sin(a + ph) + 0.008 * Math.sin(2 * a + 1.3 + ph)) * hw;
    const scale = 1 + 0.04 * Math.sin(a + 0.9 + ph);
    const rot = (isLeft ? 1 : -1) * 0.035 * Math.sin(a + 2.1 + ph);

    const baseX = isLeft ? reach - hw * 0.06 : W - hw + hw * 0.06 - reach;
    const pivotX = isLeft ? 0 : W;

    fCtx.save();
    // Scale from screen space to field space (cols/W, rows/H)
    fCtx.scale(cols / W, rows / H);

    // Pivot transform
    fCtx.translate(pivotX, cy);
    fCtx.rotate(rot);
    fCtx.scale(scale, scale);
    fCtx.translate(-pivotX, -cy);

    fCtx.drawImage(tile, baseX, cy - hh / 2, hw, hh);
    fCtx.restore();
  }

  function render(timeSeconds) {
    if (!tilesReady || cols === 0 || rows === 0) {
      requestAnimationFrame(renderLoop);
      return;
    }

    const t = ((timeSeconds % LOOP) + LOOP) % LOOP;

    // Fill fields with white
    ctxA.fillStyle = '#ffffff';
    ctxA.fillRect(0, 0, cols, rows);
    ctxB.fillStyle = '#ffffff';
    ctxB.fillRect(0, 0, cols, rows);

    // Draw pose A
    drawHandIntoField(ctxA, tiles.LA, true, t);
    drawHandIntoField(ctxA, tiles.RA, false, t);

    // Draw pose B
    drawHandIntoField(ctxB, tiles.LB, true, t);
    drawHandIntoField(ctxB, tiles.RB, false, t);

    const dataA = ctxA.getImageData(0, 0, cols, rows).data;
    const dataB = ctxB.getImageData(0, 0, cols, rows).data;

    // Clear main canvas with off-white warm canvas background
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d0d0d';

    const mL = mixAt(t, 6.2, 14.6, 1.6);
    const mR = mixAt(t, 2.4, 10.4, 1.6);

    const tick = Math.floor(t * 7);

    for (let j = 0; j < rows; j++) {
      let shift = 0;
      if (hash(j, tick) > 0.965) {
        shift = Math.round((hash(tick, j) - 0.5) * 8);
      }

      for (let i = 0; i < cols; i++) {
        const seed = seeds[j * cols + i];
        const m = i < cols / 2 ? mL : mR;
        const useB = seed < m;

        let sampleI = clamp(i - shift, 0, cols - 1);
        const pIdx = (j * cols + sampleI) * 4;

        const red = useB ? dataB[pIdx] : dataA[pIdx];
        const lum = red / 255;

        let v = clamp((1 - lum - 0.16) / 0.42, 0, 1);
        if (v <= 0.001) continue;

        // Glitch front sparkle
        if (m > 0.001 && m < 0.999) {
          const diff = Math.abs(seed - m);
          if (diff < 0.12) {
            v *= diff / 0.12;
            if (hash(i + tick, j) <= 0.4) {
              v *= 0.3;
            }
          }
        }

        // Shimmer
        v *= 0.86 + 0.14 * Math.sin(t * 3.2 + seed * 40);

        // Center fade (fingertips never touch)
        const cx = Math.abs((i + 0.5) / cols - 0.5);
        v *= smooth(0.015, 0.07, cx);

        if (v <= 0.02) continue;

        // Quantise into LEVELS
        let chosenLevel = 0;
        for (let l = LEVELS.length - 1; l >= 0; l--) {
          if (v >= LEVELS[l] - 0.13) {
            chosenLevel = LEVELS[l];
            break;
          }
        }

        if (chosenLevel <= 0) continue;

        const r = chosenLevel === LEVELS[1] ? R * 0.38 : R * chosenLevel;
        const dotX = (i + 0.5) * step;
        const dotY = (j + 0.5) * rowStep;

        ctx.beginPath();
        ctx.arc(dotX, dotY, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const t0 = performance.now();
  function renderLoop(now) {
    const elapsed = (now - t0) / 1000;
    render(elapsed);
    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
  window.__render = render;
})();
