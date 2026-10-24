/* ═══════════════════════════════════════════════════════════════════
   Muhammad Taha — Portfolio · Hallmark Furrow Theme Engine
   Interactive survey map, marching squares terrain, smooth loupe cursor,
   route animation, field notebook cards, table filtering & fold observer
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.__fieldbookMap = true;
  const root = document.documentElement;
  const canvas = hero.querySelector('.hero__canvas');
  const loupe = hero.querySelector('.loupe');
  const region = hero.querySelector('.hero__map');
  const farmEl = hero.querySelector('.farm');
  const textEl = hero.querySelector('.hero__text');
  const entry = hero.querySelector('.hero__entry');
  const pins = [...hero.querySelectorAll('.pin')];
  const routePath = hero.querySelector('.route__line');
  const revealEl = hero.querySelector('.route__reveal');
  const heroGrid = hero.querySelector('.hero__grid');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MQ_MOBILE = matchMedia('(max-width: 60rem)');
  const staged = root.classList.contains('stage');

  /* ── ROOT-CAUSE FIX ────────────────────────────────────────────────
     GSAP leaves a `transform` on .hero__map, which turns it into the containing
     block of everything absolutely positioned inside it (pins, route, card).
     We re-parent both layers directly under .hero (position: relative) so no
     animated ancestor can ever shift them again. */
  hero.appendChild(farmEl);
  hero.appendChild(entry);
  if (staged) entry.style.visibility = 'hidden'; // revealed when the route dot arrives

  /* Travelling dot (inline styles so it works even without extra CSS) */
  const routeDot = document.createElement('i');
  routeDot.setAttribute('aria-hidden', 'true');
  Object.assign(routeDot.style, {
    position: 'absolute',
    left: `${(525 / 1250) * 100}%`,
    top: `${(170 / 1000) * 100}%`,
    zIndex: '2',
    width: '16px',
    height: '16px',
    margin: '-8px 0 0 -8px',
    borderRadius: '50%',
    background: 'var(--color-accent)',
    boxShadow: '0 0 0 3px var(--color-paper-2), 0 0 0 4px var(--color-ink), 0 0 20px 4px oklch(70% 0.19 40 / 0.55)',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 200ms ease'
  });
  farmEl.appendChild(routeDot);

  /* ── Visible dashed route: own SVG with inline styles, so CSS can never hide it ── */
  const NSV = 'http://www.w3.org/2000/svg';
  const origRoute = hero.querySelector('.route');
  if (origRoute) origRoute.style.visibility = 'hidden'; // kept in DOM for geometry only

  const trailSvg = document.createElementNS(NSV, 'svg');
  trailSvg.setAttribute('viewBox', '0 0 1250 1000');
  trailSvg.setAttribute('preserveAspectRatio', 'none');
  trailSvg.setAttribute('aria-hidden', 'true');
  Object.assign(trailSvg.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '1',
    pointerEvents: 'none',
    overflow: 'visible'
  });
  const trailPath = document.createElementNS(NSV, 'path');
  trailPath.setAttribute('fill', 'none');
  trailPath.setAttribute('stroke-linecap', 'round');
  trailPath.setAttribute('stroke-dasharray', '7 6');
  trailPath.style.stroke = 'oklch(18% 0.006 60)';
  trailPath.style.strokeWidth = '2';
  trailPath.style.vectorEffect = 'non-scaling-stroke';
  trailSvg.appendChild(trailPath);
  farmEl.insertBefore(trailSvg, farmEl.firstChild);

  /* start node ring */
  const startRing = document.createElement('i');
  startRing.setAttribute('aria-hidden', 'true');
  Object.assign(startRing.style, {
    position: 'absolute',
    left: `${(525 / 1250) * 100}%`,
    top: `${(170 / 1000) * 100}%`,
    zIndex: '1',
    width: '12px',
    height: '12px',
    margin: '-6px 0 0 -6px',
    borderRadius: '50%',
    background: 'var(--color-paper-2)',
    border: '2px solid var(--color-ink)',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 300ms ease'
  });
  farmEl.appendChild(startRing);

  const trailPts = [];
  if (routePath && routePath.getTotalLength) {
    const Lt = routePath.getTotalLength();
    for (let i = 0; i <= 120; i++) {
      const q = routePath.getPointAtLength((Lt * i) / 120);
      trailPts.push([q.x, q.y]);
    }
  }
  function drawTrail(t) {
    if (!trailPts.length) return;
    const n = Math.max(2, Math.round(trailPts.length * t));
    trailPath.setAttribute('d', 'M' + trailPts.slice(0, n).map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L'));
    startRing.style.opacity = t > 0.02 ? '1' : '0';
  }

  /* Inks from theme tokens */
  const ink = (a) => `oklch(18% 0.006 60 / ${a})`;
  const PAPER = 'oklch(96% 0.011 85)';
  const PAPER2 = 'oklch(99.5% 0.005 85)';
  const CONTOUR = (a) => `oklch(62% 0.07 58 / ${a})`;
  const WATER = (a) => `oklch(60% 0.05 232 / ${a})`;
  const HEDGE = (a) => `oklch(50% 0.1 150 / ${a})`;
  const TANGERINE = (a) => `oklch(70% 0.19 40 / ${a})`;

  /* Seeded pseudo-random numbers */
  const rng = (a) => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* 2D Perlin Noise */
  const perlin = (seed) => {
    const r = rng(seed);
    const perm = new Uint8Array(512);
    const base = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = base[i & 255];

    const g = (h, x, y) => {
      switch (h & 7) {
        case 0: return x + y;
        case 1: return -x + y;
        case 2: return x - y;
        case 3: return -x - y;
        case 4: return x;
        case 5: return -x;
        case 6: return y;
        default: return -y;
      }
    };
    const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    return (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const X = xi & 255, Y = yi & 255;
      x -= xi; y -= yi;
      const u = f(x), v = f(y);
      const a = perm[X] + Y, b = perm[X + 1] + Y;
      const n00 = g(perm[a], x, y), n10 = g(perm[b], x - 1, y);
      const n01 = g(perm[a + 1], x, y - 1), n11 = g(perm[b + 1], x - 1, y - 1);
      const l1 = n00 + u * (n10 - n00), l2 = n01 + u * (n11 - n01);
      return l1 + v * (l2 - l1);
    };
  };

  /* Fractal Brownian Motion */
  const fbm = (n, x, y, oct = 4) => {
    let s = 0, a = 0.5, f = 1;
    for (let i = 0; i < oct; i++) {
      s += a * n(x * f, y * f);
      f *= 2.03;
      a *= 0.5;
    }
    return s;
  };

  /* Survey Frame & Topography (5:4 aspect ratio) */
  const A = 1.25;
  const V = {
    a: [0.04, 0.1], b: [0.34, 0.04], c: [0.64, 0.07], d: [0.92, 0.14],
    k: [0.95, 0.4], e: [0.97, 0.56], p: [0.95, 0.74], f: [0.9, 0.92],
    g: [0.6, 0.96], h: [0.37, 0.93], i: [0.1, 0.88], s: [0.03, 0.66], j: [0.02, 0.38],
    m: [0.3, 0.33], l: [0.66, 0.37], q: [0.65, 0.56], r: [0.39, 0.57],
    t: [0.21, 0.61], u: [0.41, 0.77], w: [0.22, 0.79],
  };

  /* Area labels drawn on the map (match the reference image) */
  const FIELDS = [
    { name: 'LegalBench Node', ring: 'abcdklmj', at: [0.6, 0.2], size: 12 },
    { name: 'Swarm Cluster', ring: 'lkeq', at: [0.81, 0.45], size: 12 },
    { name: 'Causal Gate', ring: 'mlqr', at: [0.5, 0.515], size: 12 },
    { name: 'Indus Basin Zone', ring: 'jmrts', at: [0.15, 0.565], size: 11 },
    { name: 'Telemetry Yard', ring: 'truw', at: [0.25, 0.735], size: 11 },
    { name: 'Inference Engine', ring: 'rqepfghu', at: [0.47, 0.875], size: 12 },
    { name: 'Sensor Array', ring: 'stwuhi', at: [0.15, 0.84], size: 11 },
  ];

  const HOLDING = 'abcdkepfghisj';
  const WALLS = new Set(['a-b', 'b-c', 'c-d', 'd-k']);
  const LANE_EDGE = 'h-u';
  const GATE = { edge: 'j-m', t: 0.68 };
  const LANE = [[0.31, 1.3], [0.35, 1.06], [0.37, 0.93], [0.41, 0.77]];
  const STREAM = [[0.8, 1.35], [0.62, 1.1], [0.42, 1.01], [0.24, 0.985], [0.07, 1.03], [-0.15, 1.1], [-0.45, 1.06]];
  const NEIGHBOURS = [
    [[0.04, 0.1], [-0.25, 0.04], [-0.6, 0.08]],
    [[0.92, 0.14], [1.2, 0.05], [1.5, 0.1]],
    [[0.9, 0.92], [1.25, 1.0], [1.6, 0.96]],
    [[0.34, 0.04], [0.38, -0.3]],
    [[0.1, 0.88], [-0.25, 0.9]],
    [[0.6, 0.96], [0.57, 1.35]],
    [[0.97, 0.56], [1.4, 0.6]]
  ];
  const BUILDINGS = [
    [0.28, 0.66, 0.07, 0.034],
    [0.355, 0.645, 0.034, 0.058],
    [0.345, 0.725, 0.056, 0.026]
  ];

  /* Geometric smoothing and path building */
  const chaikin = (pts, closed, it = 2) => {
    let p = pts;
    for (let n = 0; n < it; n++) {
      const o = [];
      const L = p.length;
      if (!closed) o.push(p[0]);
      for (let i = 0; i < (closed ? L : L - 1); i++) {
        const a = p[i], b = p[(i + 1) % L];
        o.push(
          [a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25],
          [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]
        );
      }
      if (!closed) o.push(p[L - 1]);
      p = o;
    }
    return p;
  };

  const plen = (pts) => {
    let s = 0;
    for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return s;
  };

  const bboxOf = (pts, pad = 4) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) {
      if (x < x0) x0 = x; if (y < y0) y0 = y;
      if (x > x1) x1 = x; if (y > y1) y1 = y;
    }
    return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
  };

  const hits = (b, r) => !(b[2] < r[0] || b[0] > r[2] || b[3] < r[1] || b[1] > r[3]);

  const inPoly = (x, y, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };

  const segDist = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  };

  const pathOf = (pts, closed) => {
    const p = new Path2D();
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
    if (closed) p.closePath();
    return p;
  };

  /* Marching Squares algorithm for topographic contours */
  const EDGES = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], null, [[0, 2]], [[3, 0]], [[3, 0]], [[0, 2]], null, [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];

  function trace(field, nx, ny, cell, step) {
    const buckets = new Map();
    const pt = (i, j, e, v0, v1, v2, v3, t) => {
      switch (e) {
        case 0: return [(i + (t - v0) / (v1 - v0)) * cell, j * cell];
        case 1: return [(i + 1) * cell, (j + (t - v1) / (v2 - v1)) * cell];
        case 2: return [(i + (t - v3) / (v2 - v3)) * cell, (j + 1) * cell];
        default: return [i * cell, (j + (t - v0) / (v3 - v0)) * cell];
      }
    };
    const key = (i, j, e) => (e === 0 ? (j * nx + i) * 2 : e === 2 ? ((j + 1) * nx + i) * 2 : e === 1 ? (j * nx + i + 1) * 2 + 1 : (j * nx + i) * 2 + 1);

    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const v0 = field[j * nx + i], v1 = field[j * nx + i + 1], v2 = field[(j + 1) * nx + i + 1], v3 = field[(j + 1) * nx + i];
        const lo = Math.min(v0, v1, v2, v3), hi = Math.max(v0, v1, v2, v3);
        for (let k = Math.ceil(lo / step); k * step < hi; k++) {
          const t = k * step;
          const code = (v0 > t ? 8 : 0) | (v1 > t ? 4 : 0) | (v2 > t ? 2 : 0) | (v3 > t ? 1 : 0);
          let segs = EDGES[code];
          if (segs === null) {
            const c = (v0 + v1 + v2 + v3) / 4 > t;
            segs = code === 5 ? (c ? [[3, 0], [2, 1]] : [[3, 2], [0, 1]]) : (c ? [[0, 1], [3, 2]] : [[3, 0], [2, 1]]);
          }
          if (!segs.length) continue;
          let b = buckets.get(k);
          if (!b) buckets.set(k, (b = { pts: new Map(), adj: new Map(), segs: [] }));
          for (const [ea, eb] of segs) {
            const ka = key(i, j, ea), kb = key(i, j, eb);
            if (!b.pts.has(ka)) b.pts.set(ka, pt(i, j, ea, v0, v1, v2, v3, t));
            if (!b.pts.has(kb)) b.pts.set(kb, pt(i, j, eb, v0, v1, v2, v3, t));
            const s = b.segs.length;
            b.segs.push([ka, kb]);
            (b.adj.get(ka) || b.adj.set(ka, []).get(ka)).push(s);
            (b.adj.get(kb) || b.adj.set(kb, []).get(kb)).push(s);
          }
        }
      }
    }

    const out = [];
    for (const [k, b] of buckets) {
      const used = new Uint8Array(b.segs.length);
      const walk = (from) => {
        const keys = [];
        let cur = from;
        for (; ;) {
          const nxt = b.adj.get(cur).find((x) => !used[x]);
          if (nxt === undefined) break;
          used[nxt] = 1;
          const [a, c] = b.segs[nxt];
          cur = a === cur ? c : a;
          keys.push(cur);
        }
        return keys;
      };

      for (let s = 0; s < b.segs.length; s++) {
        if (used[s]) continue;
        used[s] = 1;
        const [ka, kb] = b.segs[s];
        const fwd = walk(kb), back = walk(ka);
        const keys = [...back.reverse(), ka, kb, ...fwd];
        const closed = keys[0] === keys[keys.length - 1];
        const pts = keys.map((q) => b.pts.get(q));
        if (closed) pts.pop();
        if (pts.length < 4) continue;
        out.push({ k, closed, pts });
      }
    }
    return out;
  }

  /* Scene State */
  let W = 0, H = 0, dpr = 1, F = null, S = null, textRight = 0, textBottom = 0, mobile = false;
  const toPx = ([u, v]) => [F.x + u * F.w, F.y + v * F.h];
  const noise = perlin(7);
  const wob = perlin(31);

  /* ═══════════════ LAYOUT ═══════════════
     Desktop: map frame fills the right column.
     Mobile / tablet: text → map (fixed 5:4 box) → compact card, all in normal flow. */
  function layout() {
    mobile = MQ_MOBILE.matches;

    if (mobile) {
      if (entry.parentElement !== heroGrid) heroGrid.appendChild(entry);
      entry.style.left = '';
      entry.style.top = '';
      Object.assign(region.style, {
        width: 'min(100%, 440px)',
        aspectRatio: '5 / 4',
        justifySelf: 'center',
        alignSelf: 'start',
        minHeight: '0'
      });
    } else {
      if (entry.parentElement !== hero) hero.appendChild(entry);
      ['width', 'aspectRatio', 'justifySelf', 'alignSelf', 'minHeight'].forEach((k) => { region.style[k] = ''; });
    }

    const hr = hero.getBoundingClientRect();
    W = Math.round(hr.width);
    H = Math.round(hr.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);

    const rr = region.getBoundingClientRect();
    const tr = textEl.getBoundingClientRect();
    textRight = tr.right - hr.left;
    textBottom = tr.bottom - hr.top;

    if (!mobile) {
      const ax = rr.left - hr.left;
      const ay = H * 0.08;
      const rightMargin = Math.max(36, (W - 1440) / 2 + 40);
      const availW = Math.max(120, W - ax - rightMargin);
      const ah = H * 0.84;
      const maxFw = Math.min(620, availW);
      const fw = Math.max(120, Math.min(availW, ah * A, maxFw));
      const fh = fw / A;
      const fx = Math.min(ax + (availW - fw) / 2, W - rightMargin - fw);
      F = { x: Math.max(textRight + 20, fx), y: ay + (ah - fh) / 2, w: fw, h: fh };
    } else {
      const fw = Math.max(120, rr.width);
      F = { x: rr.left - hr.left, y: rr.top - hr.top, w: fw, h: fw / A };
    }

    farmEl.style.setProperty('--fx', `${F.x}px`);
    farmEl.style.setProperty('--fy', `${F.y}px`);
    farmEl.style.setProperty('--fw', `${F.w}px`);
    farmEl.style.setProperty('--fh', `${F.h}px`);
  }

  function build() {
    const t0 = performance.now();
    const cell = 5;
    const nx = Math.ceil(W / cell) + 2, ny = Math.ceil(H / cell) + 2;
    const field = new Float32Array(nx * ny);
    const streamIso = STREAM.map(([u, v]) => [u * A, v]);
    const hx = 0.55 * A;

    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const X = ((i * cell - F.x) / F.h), Y = (j * cell - F.y) / F.h;
        let d = Infinity;
        for (let s = 1; s < streamIso.length; s++) {
          d = Math.min(d, segDist(X, Y, streamIso[s - 1][0], streamIso[s - 1][1], streamIso[s][0], streamIso[s][1]));
        }
        const hill = 0.42 * Math.exp(-(((X - hx) ** 2) * 1.1 + ((Y + 0.08) ** 2) * 2.6) / 0.3);
        field[j * nx + i] = -0.95 * Y + 0.2 * X + 0.42 * fbm(noise, X * 1.35 + 11.3, Y * 1.35 + 4.1) + hill - 0.2 * Math.exp(-((d / 0.075) ** 2)) - 0.05 * Math.exp(-((d / 0.25) ** 2));
      }
    }

    const step = Math.max(0.014, 16 / F.h);
    const lines = trace(field, nx, ny, cell, step);
    let kmin = Infinity;
    for (const l of lines) kmin = Math.min(kmin, l.k);
    const contours = [];
    for (const l of lines) {
      const pts = chaikin(l.pts, l.closed, 2);
      const len = plen(pts);
      if (len < (l.closed ? 90 : 30)) continue;
      const index = (l.k - kmin) % 5 === 0;
      const chunks = [];
      for (let s = 0; s < pts.length - 1; s += 40) {
        const part = pts.slice(s, Math.min(pts.length, s + 41));
        chunks.push({ b: bboxOf(part), p: pathOf(part) });
      }
      if (l.closed) {
        const part = [pts[pts.length - 1], pts[0]];
        chunks.push({ b: bboxOf(part), p: pathOf(part) });
      }
      contours.push({ pts, index, len, value: 100 + 5 * (l.k - kmin), chunks });
    }

    /* Px geometry */
    const P = {};
    for (const n in V) P[n] = toPx(V[n]);
    const holding = [...HOLDING].map((n) => P[n]);
    const edgeSeen = new Map();
    for (const fld of FIELDS) {
      const r = [...fld.ring];
      for (let i = 0; i < r.length; i++) {
        const a = r[i], b = r[(i + 1) % r.length];
        const id = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (!edgeSeen.has(id)) edgeSeen.set(id, [a < b ? a : b, a < b ? b : a]);
      }
    }

    const edges = [];
    let seed = 1;
    for (const [id, [a, b]] of edgeSeen) {
      if (id === LANE_EDGE) continue;
      const A0 = P[a], B0 = P[b];
      const len = Math.hypot(B0[0] - A0[0], B0[1] - A0[1]);
      const n = Math.max(2, Math.ceil(len / 12));
      const nxp = -(B0[1] - A0[1]) / len, nyp = (B0[0] - A0[0]) / len;
      const sd = seed++ * 3.7;
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const o = 2.4 * wob(sd, t * 3.1) * Math.sin(Math.PI * t);
        pts.push([A0[0] + (B0[0] - A0[0]) * t + nxp * o, A0[1] + (B0[1] - A0[1]) * t + nyp * o]);
      }
      const wall = WALLS.has(id);
      const gate = id === GATE.edge ? GATE.t : null;
      edges.push({ id, pts, wall, gate, b: bboxOf(pts, 6), len });
    }

    const r2 = rng(99);
    for (const e of edges) {
      if (e.wall) continue;
      const dots = new Path2D();
      let acc = 0, side = 1;
      for (let i = 1; i < e.pts.length; i++) {
        const [x0, y0] = e.pts[i - 1], [x1, y1] = e.pts[i];
        const sl = Math.hypot(x1 - x0, y1 - y0);
        const ux = (x1 - x0) / sl, uy = (y1 - y0) / sl;
        for (let d = (5.2 - acc); d < sl; d += 5.2) {
          const gt = e.gate != null ? Math.abs((((i - 1) + d / sl) / (e.pts.length - 1)) - e.gate) * e.len : Infinity;
          if (gt < 12) continue;
          side = -side;
          const off = side * (1.6 + r2() * 0.8);
          const rad = 0.85 + r2() * 0.55;
          const x = x0 + ux * d - uy * off, y = y0 + uy * d + ux * off;
          dots.moveTo(x + rad, y);
          dots.arc(x, y, rad, 0, Math.PI * 2);
        }
        acc = (acc + sl) % 5.2;
      }
      e.dots = dots;
    }

    const lane = chaikin(LANE.map(toPx), false, 3);
    const stream = chaikin(STREAM.map(toPx), false, 3);
    const neighbours = NEIGHBOURS.map((l) => {
      const pts = chaikin(l.map(toPx), false, 2);
      return { pts, b: bboxOf(pts), p: pathOf(pts) };
    });
    const buildings = BUILDINGS.map(([u, v, bw, bh]) => {
      const [cx, cy] = toPx([u, v]);
      const w = bw * F.w, hgt = bh * F.h;
      const ang = -0.14;
      const c = Math.cos(ang), s = Math.sin(ang);
      const corners = [[-w / 2, -hgt / 2], [w / 2, -hgt / 2], [w / 2, hgt / 2], [-w / 2, hgt / 2]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
      return { corners, b: bboxOf(corners) };
    });

    const ge = edges.find((e) => e.id === GATE.edge);
    const ga = P[GATE.edge[0]], gb = P[GATE.edge[2]];
    const gl = Math.hypot(gb[0] - ga[0], gb[1] - ga[1]);
    const gux = (gb[0] - ga[0]) / gl, guy = (gb[1] - ga[1]) / gl;
    const gc = [ga[0] + (gb[0] - ga[0]) * GATE.t, ga[1] + (gb[1] - ga[1]) * GATE.t];
    const post1 = [gc[0] - gux * 8, gc[1] - guy * 8], post2 = [gc[0] + gux * 8, gc[1] + guy * 8];
    const sw = 0.62;
    const leaf = [post1[0] + (gux * Math.cos(sw) - guy * Math.sin(sw)) * 15, post1[1] + (guy * Math.cos(sw) + gux * Math.sin(sw)) * 15];
    const gate = { c: gc, post1, post2, leaf, edge: ge };

    const la = [...'mlqr'].map((n) => P[n]);
    const lb = bboxOf(la, 0);
    const sa = Math.atan2(P.l[1] - P.m[1], P.l[0] - P.m[0]);
    const sux = Math.cos(sa), suy = Math.sin(sa);
    const stripes = new Path2D();
    const diag = Math.hypot(lb[2] - lb[0], lb[3] - lb[1]);
    const lcx = (lb[0] + lb[2]) / 2, lcy = (lb[1] + lb[3]) / 2;
    for (let o = -diag; o < diag; o += 4.5) {
      stripes.moveTo(lcx - sux * diag - suy * o, lcy - suy * diag + sux * o);
      stripes.lineTo(lcx + sux * diag - suy * o, lcy + suy * diag + sux * o);
    }
    const rolled = { ring: la, b: lb, stripes };

    /* smaller map → smaller labels so they never crowd on phones */
    const labelScale = mobile ? Math.max(0.66, Math.min(1, F.w / 560)) : 1;
    const labels = FIELDS.map((f) => ({ text: f.name, at: toPx(f.at), size: Math.max(8, f.size * labelScale) }));
    const cLabels = [];
    const dock = mobile ? null : dockRect();
    const holdingPad = holding;
    const pinPx = pins.map((p) => toPx([+p.style.getPropertyValue('--u'), +p.style.getPropertyValue('--v')]));

    for (const c of contours.filter((x) => x.index && x.len > 180).sort((a, b) => b.len - a.len)) {
      if (cLabels.length >= 5) break;
      for (let i = 12; i < c.pts.length - 12; i += 9) {
        const [x, y] = c.pts[i];
        if (x < 40 || y < 40 || x > W - 40 || y > H - 40) continue;
        if (!mobile && x < textRight + 70) continue;
        if (mobile && y < textBottom + 30) continue;
        if (mobile && (x < F.x + 10 || x > F.x + F.w - 10 || y < F.y + 10 || y > F.y + F.h - 10)) continue;
        if (inPoly(x, y, holdingPad)) continue;
        if (holding.some((q, qi) => {
          const q2 = holding[(qi + 1) % holding.length];
          return segDist(x, y, q[0], q[1], q2[0], q2[1]) < 30;
        })) continue;
        if (dock && x > dock[0] - 40 && x < dock[2] + 40 && y > dock[1] - 30 && y < dock[3] + 30) continue;
        if (pinPx.some(([px, py]) => Math.hypot(px - x, py - y) < 120)) continue;
        if (cLabels.some((l) => Math.hypot(l.x - x, l.y - y) < 240)) continue;
        if (stream.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 30)) continue;
        const a0 = Math.atan2(c.pts[i + 4][1] - c.pts[i - 4][1], c.pts[i + 4][0] - c.pts[i - 4][0]);
        const a1 = Math.atan2(c.pts[i + 10][1] - c.pts[i - 10][1], c.pts[i + 10][0] - c.pts[i - 10][0]);
        if (Math.abs(a0 - a1) > 0.12) continue;
        let ang = a0;
        if (ang > Math.PI / 2) ang -= Math.PI;
        if (ang < -Math.PI / 2) ang += Math.PI;
        cLabels.push({ x, y, ang, text: String(c.value) });
        break;
      }
    }

    const route = [];
    if (routePath && routePath.getTotalLength) {
      const Lr = routePath.getTotalLength();
      for (let i = 0; i <= 90; i++) {
        const q = routePath.getPointAtLength((Lr * i) / 90);
        route.push([F.x + (q.x / 1250) * F.w, F.y + (q.y / 1000) * F.h]);
      }
    }

    S = { rolled, contours, edges, lane, stream, neighbours, buildings, gate, labels, cLabels, holding, route, ms: performance.now() - t0 };
  }

  /* Paper Grain Tile */
  const grain = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 192;
    const x = c.getContext('2d');
    const img = x.createImageData(192, 192);
    const r = rng(5);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r();
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v > 0.5 ? 255 : 40;
      img.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 22);
    }
    x.putImageData(img, 0, 0);
    x.lineWidth = 0.5;
    for (let i = 0; i < 70; i++) {
      const px = r() * 192, py = r() * 192, a = r() * Math.PI, l = 4 + r() * 10;
      x.strokeStyle = `rgba(60,48,30,${0.05 + r() * 0.05})`;
      x.beginPath();
      x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + r() * 2, py + Math.sin(a) * l * 0.5 + r() * 2, px + Math.cos(a) * l, py + Math.sin(a) * l);
      x.stroke();
    }
    return c;
  })();

  function setFont(ctx, size, weight = 500, family = '"Red Hat Text"', spacing = '0.06em') {
    ctx.font = `${weight} ${size}px ${family}, ui-sans-serif, sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = spacing;
  }

  function paintContours(ctx, rect, scale = 1) {
    ctx.beginPath();
    S.holding.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = 'oklch(99.5% 0.005 85 / 0.5)';
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const pass of [false, true]) {
      ctx.strokeStyle = pass ? CONTOUR(0.62) : CONTOUR(0.34);
      ctx.lineWidth = (pass ? 1.1 : 0.7) / Math.sqrt(scale);
      for (const c of S.contours) {
        if (c.index !== pass) continue;
        for (const ch of c.chunks) {
          if (hits(ch.b, rect)) ctx.stroke(ch.p);
        }
      }
    }

    setFont(ctx, 10, 500, '"Red Hat Mono"', '0.02em');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const l of S.cLabels) {
      if (l.x < rect[0] - 30 || l.x > rect[2] + 30 || l.y < rect[1] - 30 || l.y > rect[3] + 30) continue;
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.ang);
      const w = ctx.measureText(l.text).width + 8;
      ctx.fillStyle = PAPER;
      ctx.fillRect(-w / 2, -5, w, 10);
      ctx.fillStyle = CONTOUR(1);
      ctx.fillText(l.text, 0, 0.5);
      ctx.restore();
    }
  }

  function paintFeatures(ctx, rect) {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.strokeStyle = ink(0.2);
    ctx.lineWidth = 0.8;
    for (const n of S.neighbours) if (hits(n.b, rect)) ctx.stroke(n.p);

    ctx.save();
    ctx.beginPath();
    S.holding.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    ctx.strokeStyle = TANGERINE(0.22);
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.restore();

    if (hits(S.rolled.b, rect)) {
      ctx.save();
      ctx.beginPath();
      S.rolled.ring.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = HEDGE(0.2);
      ctx.lineWidth = 0.8;
      ctx.stroke(S.rolled.stripes);
      ctx.restore();
    }

    for (const bd of S.buildings) {
      if (!hits(bd.b, rect)) continue;
      ctx.save();
      ctx.beginPath();
      bd.corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = PAPER2;
      ctx.fill();
      ctx.clip();
      ctx.strokeStyle = ink(0.42);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let o = bd.b[0] - 60; o < bd.b[2] + 60; o += 3.2) {
        ctx.moveTo(o, bd.b[3] + 4);
        ctx.lineTo(o + (bd.b[3] - bd.b[1]) + 8, bd.b[1] - 4);
      }
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      bd.corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.strokeStyle = ink(0.75);
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    ctx.strokeStyle = WATER(0.16);
    ctx.lineWidth = 5;
    ctx.stroke(pathOf(S.stream));
    ctx.strokeStyle = WATER(0.85);
    ctx.lineWidth = 1.5;
    ctx.stroke(pathOf(S.stream));

    const lp = pathOf(S.lane);
    ctx.strokeStyle = ink(0.62);
    ctx.lineWidth = 9;
    ctx.stroke(lp);
    ctx.strokeStyle = PAPER2;
    ctx.lineWidth = 7;
    ctx.stroke(lp);

    for (const e of S.edges) {
      if (!hits(e.b, rect)) continue;
      ctx.strokeStyle = e.wall ? ink(0.72) : ink(0.58);
      ctx.lineWidth = e.wall ? 1.35 : 0.9;
      if (e.gate != null) {
        const g = S.gate;
        ctx.beginPath();
        ctx.moveTo(e.pts[0][0], e.pts[0][1]);
        let past = false;
        for (let i = 1; i < e.pts.length; i++) {
          const t = i / (e.pts.length - 1);
          if (!past && t >= e.gate) {
            ctx.lineTo(g.post1[0], g.post1[1]);
            ctx.moveTo(g.post2[0], g.post2[1]);
            past = true;
          }
          ctx.lineTo(e.pts[i][0], e.pts[i][1]);
        }
        ctx.stroke();
      } else {
        ctx.stroke(pathOf(e.pts));
      }
      if (e.dots) {
        ctx.fillStyle = HEDGE(0.9);
        ctx.fill(e.dots);
      }
    }

    const g = S.gate;
    ctx.fillStyle = ink(0.9);
    for (const p of [g.post1, g.post2]) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = ink(0.9);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(g.post1[0], g.post1[1]);
    ctx.lineTo(g.leaf[0], g.leaf[1]);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const l of S.labels) {
      if (l.at[0] < rect[0] - 80 || l.at[0] > rect[2] + 80 || l.at[1] < rect[1] - 20 || l.at[1] > rect[3] + 20) continue;
      setFont(ctx, l.size, 500, '"Red Hat Text"', '0.07em');
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = 3.5;
      ctx.strokeText(l.text, l.at[0], l.at[1]);
      ctx.fillStyle = ink(0.72);
      ctx.fillText(l.text, l.at[0], l.at[1]);
    }
    setFont(ctx, 10.5, 500, '"Red Hat Text"', '0.07em');
    const gx = g.c[0] - 6, gy = g.c[1] - 13;
    ctx.textAlign = 'right';
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 3;
    ctx.strokeText('Gate', gx, gy);
    ctx.fillStyle = ink(0.6);
    ctx.fillText('Gate', gx, gy);
    ctx.textAlign = 'center';
  }

  function paintRoute(ctx, upto = 1) {
    if (!S.route.length) return;
    const n = Math.max(2, Math.round(S.route.length * upto));
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = ink(1);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke(pathOf(S.route.slice(0, n)));
    ctx.restore();
    if (upto > 0.02) {
      const [x, y] = S.route[0];
      const r = Math.max(2, (6 / 1250) * F.w);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = PAPER2;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ink(1);
      ctx.stroke();
    }
  }

  function paintFolds(ctx) {
    const fx = Math.round(mobile ? W * 0.5 : F.x + F.w * 0.5), fy = Math.round(H * 0.5);
    let g = ctx.createLinearGradient(fx - 22, 0, fx + 40, 0);
    g.addColorStop(0, ink(0));
    g.addColorStop(0.35, ink(0.012));
    g.addColorStop(0.355, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.37, ink(0.05));
    g.addColorStop(0.5, ink(0.022));
    g.addColorStop(1, ink(0));
    ctx.fillStyle = g;
    ctx.fillRect(fx - 22, 0, 62, H);

    g = ctx.createLinearGradient(0, fy - 18, 0, fy + 34);
    g.addColorStop(0, ink(0));
    g.addColorStop(0.34, ink(0.01));
    g.addColorStop(0.345, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.36, ink(0.04));
    g.addColorStop(0.5, ink(0.018));
    g.addColorStop(1, ink(0));
    ctx.fillStyle = g;
    ctx.fillRect(0, fy - 18, W, 52);
  }

  function render() {
    if (W <= 0 || H <= 0) return;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    const mc = document.createElement('canvas');
    const mw = Math.max(1, Math.ceil(W / 28));
    const mh = Math.max(1, Math.ceil(H / 28));
    mc.width = mw;
    mc.height = mh;
    const mx = mc.getContext('2d');
    const mi = mx.createImageData(mw, mh);
    const mn = perlin(17);
    for (let j = 0; j < mh; j++) {
      for (let i = 0; i < mw; i++) {
        const v = fbm(mn, i * 0.11, j * 0.11, 3);
        const o = (j * mw + i) * 4;
        mi.data[o] = 120;
        mi.data[o + 1] = 96;
        mi.data[o + 2] = 60;
        mi.data[o + 3] = Math.max(0, v) * 34;
      }
    }
    mx.putImageData(mi, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(mc, 0, 0, W, H);

    const lc = document.createElement('canvas');
    lc.width = canvas.width;
    lc.height = canvas.height;
    const lx = lc.getContext('2d');
    lx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lx.fillStyle = 'rgba(0,0,0,0)';
    paintContours(lx, [0, 0, W, H]);
    paintFeatures(lx, [0, 0, W, H]);
    lx.globalCompositeOperation = 'destination-in';

    if (!mobile) {
      const g = lx.createLinearGradient(textRight - 140, 0, textRight + 60, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.22)');
      g.addColorStop(1, 'rgba(0,0,0,1)');
      lx.fillStyle = g;
      lx.fillRect(0, 0, W, H);
    } else {
      /* mobile / tablet: terrain is crisp inside the map box, faint everywhere else
         (so text above and the card below stay clean) */
      const pad = 80;
      const y0 = F.y - pad, hh = F.h + pad * 2, sy = pad / hh;
      const gy = lx.createLinearGradient(0, y0, 0, y0 + hh);
      gy.addColorStop(0, 'rgba(0,0,0,0.08)');
      gy.addColorStop(sy, 'rgba(0,0,0,1)');
      gy.addColorStop(1 - sy, 'rgba(0,0,0,1)');
      gy.addColorStop(1, 'rgba(0,0,0,0.08)');
      lx.fillStyle = gy;
      lx.fillRect(0, 0, W, H);

      const padX = 60;
      const x0 = F.x - padX, ww = F.w + padX * 2, sx = padX / ww;
      const gx = lx.createLinearGradient(x0, 0, x0 + ww, 0);
      gx.addColorStop(0, 'rgba(0,0,0,0.08)');
      gx.addColorStop(sx, 'rgba(0,0,0,1)');
      gx.addColorStop(1 - sx, 'rgba(0,0,0,1)');
      gx.addColorStop(1, 'rgba(0,0,0,0.08)');
      lx.fillStyle = gx;
      lx.fillRect(0, 0, W, H);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(lc, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = ctx.createPattern(grain, 'repeat');
    ctx.fillRect(0, 0, W, H);
    paintFolds(ctx);
  }

  /* ═══════════════ LOUPE (MAGNIFYING RETICLE) ═══════════════ */
  const R = 76, M = 1.9, D = R * 2 + 48;
  const lctx = loupe.getContext('2d');
  let routeT = staged ? 0 : 1;
  const L = { x: 0, y: 0, o: 0 }, T = { x: 0, y: 0, o: 0 };
  let tau = 70, raf = 0, last = 0, inView = true, parkable = false, following = false;

  function sizeLoupe() {
    loupe.width = D * dpr;
    loupe.height = D * dpr;
    loupe.style.width = loupe.style.height = `${D}px`;
  }

  function park() {
    if (!S || !F) return;
    const px = S.gate ? S.gate.c[0] + 8 : F.x + F.w * 0.45;
    const py = S.gate ? S.gate.c[1] - 22 : F.y + F.h * 0.5;
    T.x = Math.max(F.x + R + 10, Math.min(F.x + F.w - R - 10, px));
    T.y = Math.max(F.y + R + 10, Math.min(F.y + F.h - R - 10, py));
    T.o = 0.88;
  }

  function showLoupe() {
    parkable = true;
    if (mobile || !fine) return;
    park();
    L.x = T.x; L.y = T.y;
    T.o = 1;
    if (reduce) L.o = 1;
    wake();
  }

  function drawLoupe() {
    const c = lctx;
    const cx = L.x, cy = L.y;
    const h = D / 2;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, D, D);

    c.save();
    c.shadowColor = ink(0.28);
    c.shadowBlur = 22;
    c.shadowOffsetY = 9;
    c.beginPath();
    c.arc(h, h, R + 3, 0, Math.PI * 2);
    c.fillStyle = PAPER2;
    c.fill();
    c.restore();

    c.save();
    c.beginPath();
    c.arc(h, h, R, 0, Math.PI * 2);
    c.clip();
    c.setTransform(dpr * M, 0, 0, dpr * M, dpr * (h - M * cx), dpr * (h - M * cy));
    const r = R / M;
    const rect = [cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 4];
    c.fillStyle = PAPER;
    c.fillRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]);
    paintContours(c, rect, M);
    paintFeatures(c, rect);
    paintRoute(c, routeT);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    let g = c.createRadialGradient(h, h, R * 0.7, h, h, R);
    g.addColorStop(0, ink(0));
    g.addColorStop(1, ink(0.1));
    c.fillStyle = g;
    c.fillRect(0, 0, D, D);

    g = c.createLinearGradient(0, h - R, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(h, h - R * 0.42, R * 0.78, R * 0.5, 0, Math.PI, Math.PI * 2);
    c.fill();
    c.restore();

    c.lineWidth = 1;
    c.strokeStyle = ink(0.85);
    c.beginPath();
    c.arc(h, h, R + 0.5, 0, Math.PI * 2);
    c.stroke();

    c.lineWidth = 3;
    c.strokeStyle = PAPER2;
    c.beginPath();
    c.arc(h, h, R + 2.5, 0, Math.PI * 2);
    c.stroke();

    c.lineWidth = 0.75;
    c.strokeStyle = ink(0.35);
    c.beginPath();
    c.arc(h, h, R + 4.4, 0, Math.PI * 2);
    c.stroke();

    c.lineWidth = 1;
    c.strokeStyle = ink(0.7);
    c.beginPath();
    for (let q = 0; q < 4; q++) {
      const a = (q * Math.PI) / 2;
      c.moveTo(h + Math.cos(a) * (R - 1), h + Math.sin(a) * (R - 1));
      c.lineTo(h + Math.cos(a) * (R - 8), h + Math.sin(a) * (R - 8));
    }
    c.moveTo(h - 7, h); c.lineTo(h - 2.5, h);
    c.moveTo(h + 2.5, h); c.lineTo(h + 7, h);
    c.moveTo(h, h - 7); c.lineTo(h, h - 2.5);
    c.moveTo(h, h + 2.5); c.lineTo(h, h + 7);
    c.stroke();

    const minX = (F ? F.x : 0) + R + 4;
    const maxX = (F ? Math.min(W - R - 8, F.x + F.w - R - 4) : W - R - 8);
    const clampedX = Math.max(minX, Math.min(maxX, cx));
    const clampedY = Math.max(R + 4, Math.min(H - R - 8, cy));
    loupe.style.transform = `translate3d(${(clampedX - h).toFixed(2)}px, ${(clampedY - h).toFixed(2)}px, 0)`;
    loupe.style.opacity = L.o.toFixed(3);
  }

  function tick(now) {
    const dt = Math.min(48, last ? now - last : 16);
    last = now;
    if (reduce) {
      L.x = T.x; L.y = T.y; L.o = T.o;
    } else {
      const k = 1 - Math.exp(-dt / tau);
      const ko = 1 - Math.exp(-dt / 140);
      L.x += (T.x - L.x) * k;
      L.y += (T.y - L.y) * k;
      L.o += (T.o - L.o) * ko;
    }
    drawLoupe();
    const settled = Math.abs(T.x - L.x) < 0.05 && Math.abs(T.y - L.y) < 0.05 && Math.abs(T.o - L.o) < 0.004 && !routing;
    if (settled) {
      L.x = T.x; L.y = T.y; L.o = T.o;
      drawLoupe();
      raf = 0;
      last = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  const wake = () => {
    if (!raf && inView && S && parkable) raf = requestAnimationFrame(tick);
  };

  /* ═══════════════ ROUTE: dot travels start → Mizan, lens follows, then the card pops ═══════════════ */
  let routing = false;

  function arrive() {
    hero.classList.add('card-in');
    entry.classList.add('is-open');
    entry.style.visibility = '';
    place();
    popCard();
    const mp = pins.find((p) => p.dataset.entry === 'mzn');
    if (mp) {
      mp.classList.add('is-pulse');
      setTimeout(() => mp.classList.remove('is-pulse'), 1900);
    }
    setTimeout(showLoupe, 500);
  }

  function playRoute(ms) {
    if (!routePath || !routePath.getTotalLength) { arrive(); return; }
    routing = true;
    const total = routePath.getTotalLength();
    const dur = Math.max(ms || 0, 2400);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const follow = !mobile && fine;                       // lens only on desktop
    const toHero = (q) => [F.x + (q.x / 1250) * F.w, F.y + (q.y / 1000) * F.h];

    if (revealEl) {
      revealEl.style.transition = 'none';
      revealEl.style.strokeDashoffset = '1';
    }
    hero.classList.add('is-routed');
    routeDot.style.opacity = '1';

    if (follow) {                                         // lens starts on the route's first point
      const [sx, sy] = toHero(routePath.getPointAtLength(0));
      parkable = true;
      L.x = T.x = sx; L.y = T.y = sy; L.o = 0; T.o = 1; tau = 70;
      wake();
    }

    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      routeT = ease(t);
      drawTrail(routeT);                                  // dashed line on the page itself
      if (revealEl) revealEl.style.strokeDashoffset = String(1 - routeT);
      const q = routePath.getPointAtLength(total * routeT);
      routeDot.style.left = `${(q.x / 1250) * 100}%`;
      routeDot.style.top = `${(q.y / 1000) * 100}%`;
      if (follow) {                                       // lens follows the dot
        const [px, py] = toHero(q);
        T.x = px; T.y = py; T.o = 1;
        wake();
      }
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        routing = false;
        routeDot.style.opacity = '0';
        arrive();                                         // card pops, lens glides to its resting spot
      }
    };
    requestAnimationFrame(step);
    wake();
  }

  if (fine && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !S || mobile || !parkable) return;
      const hr = hero.getBoundingClientRect();
      const x = e.clientX - hr.left, y = e.clientY - hr.top;
      const over = e.target === canvas && x > textRight + 24;
      if (over) {
        T.x = x; T.y = y; T.o = 1;
        tau = following ? 60 : 110;
        following = true;
        canvas.style.cursor = 'none';
      } else if (following) {
        following = false;
        tau = 260;
        park();
        canvas.style.cursor = '';
      }
      wake();
    });
    hero.addEventListener('pointerleave', () => {
      if (!following) return;
      following = false;
      tau = 260;
      park();
      canvas.style.cursor = '';
      wake();
    });
  }

  /* ═══════════════ NOTEBOOK CARD SWITCHER ═══════════════ */
  const ORDER = ['mzn', 'ags', 'fhm', 'core'];
  const pages = [...entry.querySelectorAll('.entry__page')];
  const states = [...entry.querySelectorAll('.entry__state [data-entry]')];
  const prev = entry.querySelector('.entry__step--prev');
  const next = entry.querySelector('.entry__step--next');
  let current = 'mzn';

  function dockRect() {
    const cw = entry.offsetWidth || 300, ch = entry.offsetHeight || 380;
    const edge = Math.max(16, (W - 1440) / 2 + 24);
    const minX = textRight + 20;
    const maxX = Math.max(minX, W - edge - cw);
    const desiredX = F.x + F.w * 0.48;
    const x = Math.max(minX, Math.min(maxX, desiredX));
    const maxY = Math.max(16, H - ch - 16);
    const desiredY = F.y + F.h * 0.42;
    const y = Math.max(16, Math.min(maxY, desiredY));
    return [x, y, x + cw, y + ch];
  }

  /* little spring "pop" growing out of the clicked pin */
  function popCard() {
    if (reduce || !entry.animate) return;
    try {
      entry.animate(
        [{ scale: '0.82' }, { scale: '1' }],
        { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      );
    } catch (_) { /* older browsers: no pop, card just appears */ }
  }

  /* Desktop: put the card next to the active pin without covering other pins.
     Mobile: the card sits in normal flow under the map, nothing to position. */
  function place() {
    if (!F) return;
    if (mobile) {
      entry.style.transformOrigin = '50% 0';
      return;
    }
    const pin = pins.find((p) => p.dataset.entry === current);
    if (!pin) return;

    const cw = entry.offsetWidth || 312;
    const ch = entry.offsetHeight || 300;

    const boxOf = (p) => {
      const u = +p.style.getPropertyValue('--u');
      const v = +p.style.getPropertyValue('--v');
      const [x, y] = toPx([u, v]);
      /* dot + label box (label sits left of the dot when u >= 0.6) */
      return { x, y, b: u >= 0.6 ? [x - 176, y - 24, x + 16, y + 24] : [x - 16, y - 24, x + 176, y + 24] };
    };

    const own = boxOf(pin);
    const all = pins.map(boxOf);
    const edge = Math.max(16, (W - 1440) / 2 + 24);
    const minX = textRight + 16;
    const maxX = Math.max(minX, W - edge - cw);
    const minY = 16;
    const maxY = Math.max(minY, H - ch - 16);
    const gap = 16;

    /* right, left, below, above — choose the one that covers the fewest pins */
    const cands = [
      [own.b[2] + gap, own.y - ch / 2],
      [own.b[0] - gap - cw, own.y - ch / 2],
      [own.x - cw / 2, own.b[3] + gap],
      [own.x - cw / 2, own.b[1] - gap - ch],
    ];

    let best = null;
    for (const [cx, cy] of cands) {
      const x = Math.max(minX, Math.min(maxX, cx));
      const y = Math.max(minY, Math.min(maxY, cy));
      let hit = 0;
      for (const o of all) {
        if (!(x + cw < o.b[0] || x > o.b[2] || y + ch < o.b[1] || y > o.b[3])) hit++;
      }
      const score = hit * 1000 + Math.abs(x - cx) + Math.abs(y - cy);
      if (!best || score < best.score) best = { x, y, score };
    }

    entry.style.left = `${Math.round(best.x)}px`;
    entry.style.top = `${Math.round(best.y)}px`;
    entry.style.transformOrigin = `${Math.round(own.x - best.x)}px ${Math.round(own.y - best.y)}px`;
  }

  function open(key) {
    current = key;
    pins.forEach((p) => {
      const on = p.dataset.entry === key;
      p.classList.toggle('is-on', on);
      p.setAttribute('aria-pressed', String(on));
    });
    pages.forEach((p) => {
      p.hidden = p.dataset.entry !== key;
    });
    states.forEach((s) => {
      s.hidden = s.dataset.entry !== key;
    });
    const i = ORDER.indexOf(key);
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= ORDER.length - 1;
    place();
    if (hero.classList.contains('card-in')) popCard();
    if (window.__onCardChange) window.__onCardChange(key);
  }

  pins.forEach((p) => p.addEventListener('click', () => {
    open(p.dataset.entry);
    /* on phones the card is below the map — make sure the user sees it */
    if (mobile && hero.classList.contains('card-in')) {
      entry.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  }));
  if (prev) {
    prev.addEventListener('click', () => {
      const i = ORDER.indexOf(current);
      if (i > 0) open(ORDER[i - 1]);
      if (prev.disabled && next) next.focus();
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      const i = ORDER.indexOf(current);
      if (i < ORDER.length - 1) open(ORDER[i + 1]);
      if (next.disabled && prev) prev.focus();
    });
  }

  /* Visibility observer */
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (!inView && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    } else if (inView) {
      wake();
    }
  }).observe(hero);

  /* Resize listener */
  let lastW = 0, lastH = 0, started = false;
  const resurvey = () => {
    const r = hero.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (!started || (w === lastW && Math.abs(h - lastH) < 2)) return;
    lastW = w; lastH = h;
    entry.style.transition = 'none';
    layout();
    build();
    render();
    sizeLoupe();
    place();
    if (current === 'core') size3DCore();
    void entry.offsetWidth;
    requestAnimationFrame(() => { entry.style.transition = ''; });
    if (parkable && !following) {
      park();
      L.x = T.x; L.y = T.y;
    }
    if (mobile || !fine) {
      T.o = 0; L.o = 0;
      loupe.style.opacity = '0';
    } else if (parkable) {
      T.o = 1;
    }
    wake();
  };
  new ResizeObserver(resurvey).observe(hero);

  /* ═══════════════ CHOREOGRAPHED INTRO ═══════════════ */
  const fonts = document.fonts ? Promise.race([
    Promise.all([
      '500 12px "Red Hat Text"',
      '500 10px "Red Hat Mono"',
      '600 20px "Red Hat Display"'
    ].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 1600))
  ]) : Promise.resolve();

  fonts.then(() => {
    started = true;
    const r = hero.getBoundingClientRect();
    lastW = Math.round(r.width);
    lastH = Math.round(r.height);
    layout();
    build();
    render();
    sizeLoupe();
    open('mzn');
    requestAnimationFrame(() => hero.classList.add('is-ready', 'is-placed'));

    if (!staged) {
      routeT = 1;
      drawTrail(1);
      hero.classList.add('card-in');
      entry.style.visibility = '';
      showLoupe();
      return;
    }

    /* dot leaves the start marker, draws the dashed route, lands on Mizan → card pops */
    setTimeout(() => playRoute(2400), 900);
  });

  /* Safety net: never leave the card hidden if the intro gets interrupted */
  setTimeout(() => {
    if (!hero.classList.contains('card-in')) {
      hero.classList.add('card-in');
      entry.style.visibility = '';
      if (started) place();
    }
  }, 7000);

  /* ═══════════════ FOLDED INSPECTION RECORD OBSERVER ═══════════════ */
  const doc = document.querySelector('.doc');
  if (doc && staged) {
    const r0 = doc.getBoundingClientRect();
    if (r0.top > window.innerHeight) {
      doc.classList.add('is-folded');
      new IntersectionObserver(([e], o) => {
        if (e.isIntersecting) {
          doc.classList.remove('is-folded');
          o.disconnect();
        }
      }, { threshold: 0.35 }).observe(doc);
    }
  }

  /* ═══════════════ TANGERINE OFFER BAND MAP ═══════════════ */
  const band = document.querySelector('.band');
  const bc = band && band.querySelector('.band__map');
  const bpin = band && band.querySelector('.band__pin .pin__dot');

  function renderBand() {
    if (!bc) return;
    const br = band.getBoundingClientRect();
    const bw = Math.round(br.width), bh = Math.round(br.height);
    bc.width = bw * dpr;
    bc.height = bh * dpr;
    const c = bc.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, bw, bh);

    const cell = 6;
    const nx = Math.ceil(bw / cell) + 2, ny = Math.ceil(bh / cell) + 2;
    const fld = new Float32Array(nx * ny);
    const n2 = perlin(41);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const X = (i * cell) / 640, Y = (j * cell) / 640;
        fld[j * nx + i] = -0.5 * Y + 0.35 * X + 0.45 * fbm(n2, X * 1.2 + 3, Y * 1.2 + 9);
      }
    }
    const step = (12 / 640) * 0.9;
    const ls = trace(fld, nx, ny, cell, step);
    let km = Infinity;
    for (const l of ls) km = Math.min(km, l.k);

    c.lineJoin = 'round';
    c.lineCap = 'round';
    for (const l of ls) {
      const pts = chaikin(l.pts, l.closed, 2);
      if (plen(pts) < 30) continue;
      const idx = (l.k - km) % 5 === 0;
      c.strokeStyle = ink(idx ? 0.2 : 0.11);
      c.lineWidth = idx ? 1.1 : 0.7;
      c.stroke(pathOf(pts, l.closed));
    }

    if (bpin) {
      const pr = bpin.getBoundingClientRect();
      const px = pr.left + pr.width / 2 - br.left, py = pr.top + pr.height / 2 - br.top;
      const ang = 1.2;
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const a0 = [px - ux * 900, py - uy * 900], a1 = [px + ux * 900, py + uy * 900];
      const g1 = [px - ux * 9, py - uy * 9], g2 = [px + ux * 9, py + uy * 9];
      const hedge = (from, to) => {
        c.strokeStyle = ink(0.42);
        c.lineWidth = 0.9;
        c.beginPath();
        c.moveTo(...from);
        c.lineTo(...to);
        c.stroke();
        const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
        const dx = (to[0] - from[0]) / len, dy = (to[1] - from[1]) / len;
        const r3 = rng(3);
        c.fillStyle = ink(0.34);
        let sd = 1;
        for (let d = 6; d < len - 6; d += 5.2) {
          sd = -sd;
          const o = sd * (1.6 + r3() * 0.8);
          const rad = 0.85 + r3() * 0.5;
          c.beginPath();
          c.arc(from[0] + dx * d - dy * o, from[1] + dy * d + dx * o, rad, 0, Math.PI * 2);
          c.fill();
        }
      };
      hedge(a0, g1);
      hedge(g2, a1);
      const b0 = [px + 260, py - 700], b1 = [px + 420, py + 700];
      hedge(b0, b1);
      c.fillStyle = ink(0.8);
      for (const p of [g1, g2]) {
        c.beginPath();
        c.arc(p[0], p[1], 1.9, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  if (band) {
    let drawn = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !drawn) {
        drawn = true;
        renderBand();
      }
    }, { rootMargin: '400px' }).observe(band);

    let bw0 = 0;
    new ResizeObserver(() => {
      const w = Math.round(band.getBoundingClientRect().width);
      if (drawn && w !== bw0) {
        bw0 = w;
        renderBand();
      }
    }).observe(band);
  }

  /* ═══════════════ TABLE LOG FILTER ═══════════════ */
  const segTabs = [...document.querySelectorAll('[data-log][aria-pressed]')];
  const tableRows = [...document.querySelectorAll('tr[data-log]')];
  segTabs.forEach((b) => {
    b.addEventListener('click', () => {
      segTabs.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const filter = b.dataset.log;
      tableRows.forEach((r) => {
        r.hidden = filter !== 'all' && r.dataset.log !== filter;
      });
    });
  });

  /* ═══════════════ DISPATCH FORM HANDLING ═══════════════ */
  const form = document.querySelector('form.open');
  if (form) {
    const help = form.querySelector('[aria-live]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('#sender-name');
      const emailInput = form.querySelector('#sender-email');
      const msgInput = form.querySelector('#sender-msg');

      if (!nameInput.value.trim()) {
        help.textContent = 'Please enter your name or organisation.';
        nameInput.focus();
        return;
      }
      if (!emailInput.value.trim() || !emailInput.checkValidity()) {
        help.textContent = 'Please write a valid email address (e.g. name@organisation.com).';
        emailInput.focus();
        return;
      }
      if (!msgInput.value.trim()) {
        help.textContent = 'Please write a brief note regarding your project or role.';
        msgInput.focus();
        return;
      }

      const subject = encodeURIComponent(`Engineering Inquiry from ${nameInput.value.trim()}`);
      const body = encodeURIComponent(`Hello Muhammad,\n\n${msgInput.value.trim()}\n\nBest regards,\n${nameInput.value.trim()}\n${emailInput.value.trim()}`);
      window.location.href = `mailto:muhammadtaha0154@gmail.com?subject=${subject}&body=${body}`;
      help.textContent = 'Opening your mail client... Thank you!';
    });
  }

  /* ═══════════════ MULTI-TONE HAPTIC AUDIO ENGINE (WEB AUDIO API) ═══════════════ */
  let audioCtx = null;
  let hapticsEnabled = true;
  try { hapticsEnabled = localStorage.getItem('furrow_haptics') !== 'false'; } catch (_) { }
  const soundToggle = document.querySelector('#soundToggle');
  if (soundToggle) {
    if (!hapticsEnabled) soundToggle.classList.add('is-muted');
    soundToggle.addEventListener('click', () => {
      hapticsEnabled = !hapticsEnabled;
      try { localStorage.setItem('furrow_haptics', String(hapticsEnabled)); } catch (_) { }
      soundToggle.classList.toggle('is-muted', !hapticsEnabled);
      if (hapticsEnabled) playHapticSound('chime');
    });
  }

  function playHapticSound(type = 'click', param = 1200) {
    if (!hapticsEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;

      if (type === 'latch') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(280, now);
        osc1.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(560, now);
        osc2.frequency.exponentialRampToValueAtTime(140, now + 0.05);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.07);
        osc2.stop(now + 0.07);
      } else if (type === 'chime') {
        [1046.5, 1318.5, 1567.98].forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.03);
          gain.gain.setValueAtTime(0.018, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.14);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.15);
        });
      } else {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const freq = typeof param === 'number' ? param : 1300;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.35, now + 0.012);
        gain.gain.setValueAtTime(0.022, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.013);
      }
    } catch (_) { }
  }

  /* ═══════════════ INTERACTIVE 3D REASONING TENSOR CORE (CANVAS) ═══════════════
     Starts only when the "3D Reasoning Core" card is open (the canvas has no size
     while its page is hidden, which previously left it blank). */
  const tensorCanvas = document.querySelector('#tensorCanvas');
  let tensorCtx = null;
  let coreAnimId = null;
  let coreRunning = false;
  let coreBound = false;
  let coreRotX = 0.45;
  let coreRotY = 0.65;
  let coreVelX = 0;
  let coreVelY = 0.004;
  let isDraggingCore = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  function size3DCore() {
    if (!tensorCanvas) return false;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const w = tensorCanvas.offsetWidth, h = tensorCanvas.offsetHeight;
    if (!w || !h) return false;
    tensorCanvas.width = Math.round(w * d);
    tensorCanvas.height = Math.round(h * d);
    return true;
  }

  function start3DCore() {
    if (!tensorCanvas) return;
    tensorCtx = tensorCanvas.getContext('2d');

    if (!coreBound) {
      coreBound = true;
      tensorCanvas.addEventListener('pointerdown', (e) => {
        isDraggingCore = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        coreVelX = 0;
        coreVelY = 0;
        tensorCanvas.setPointerCapture(e.pointerId);
        playHapticSound('click', 1600);
      });

      tensorCanvas.addEventListener('pointermove', (e) => {
        if (!isDraggingCore) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        coreRotY += dx * 0.014;
        coreRotX += dy * 0.014;
        coreVelX = dy * 0.003;
        coreVelY = dx * 0.003;
      });

      const endDrag = (e) => {
        if (isDraggingCore) {
          isDraggingCore = false;
          try { tensorCanvas.releasePointerCapture(e.pointerId); } catch (_) { }
        }
      };
      tensorCanvas.addEventListener('pointerup', endDrag);
      tensorCanvas.addEventListener('pointercancel', endDrag);
    }

    if (!size3DCore()) return;
    if (!coreRunning) {
      coreRunning = true;
      coreAnimId = requestAnimationFrame(render3DCoreFrame);
    }
  }

  function render3DCoreFrame() {
    if (!tensorCanvas || !tensorCtx || current !== 'core' || !inView) {
      coreRunning = false;
      coreAnimId = null;
      return;
    }
    const d = Math.min(2, window.devicePixelRatio || 1);
    const w = tensorCanvas.width / d;
    const h = tensorCanvas.height / d;

    tensorCtx.setTransform(d, 0, 0, d, 0, 0);
    tensorCtx.clearRect(0, 0, w, h);

    if (!isDraggingCore) {
      coreRotX += coreVelX;
      coreRotY += coreVelY;
      coreVelX *= 0.96;
      coreVelY = coreVelY * 0.96 + 0.0003; // gentle persistent orbit
    }

    const cx = w * 0.5;
    const cy = h * 0.5;
    const scale = Math.min(w, h) * 0.38;

    const rawNodes = [
      [-0.8, -0.6, -0.5, 'T1: Token Inflow'],
      [0.8, -0.6, -0.5, 'T2: Model Prior'],
      [0.8, 0.6, -0.5, 'T3: Stream Tail'],
      [-0.8, 0.6, -0.5, 'T4: Latent Norm'],
      [-0.5, -0.4, 0.6, 'R1: RAT Branch A'],
      [0.5, -0.4, 0.6, 'R2: RAT Branch B'],
      [0.5, 0.4, 0.6, 'R3: Hydraulic Gate'],
      [-0.5, 0.4, 0.6, 'R4: Diagnostic Mast'],
      [0.0, 0.0, 0.1, 'ALPHA GATE: 𝛼-Desk']
    ];

    const cosX = Math.cos(coreRotX), sinX = Math.sin(coreRotX);
    const cosY = Math.cos(coreRotY), sinY = Math.sin(coreRotY);

    const proj = rawNodes.map(([nx, ny, nz, label]) => {
      const x1 = nx * cosY + nz * sinY;
      const y1 = ny;
      const z1 = -nx * sinY + nz * cosY;
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const fov = 3.2;
      const p = fov / (fov + z2);
      return { x: cx + x2 * scale * p, y: cy + y2 * scale * p, z: z2, label, p };
    });

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
      [0, 8], [1, 8], [2, 8], [3, 8],
      [4, 8], [5, 8], [6, 8], [7, 8]
    ];

    edges.forEach(([i, j]) => {
      const a = proj[i], b = proj[j];
      const alpha = Math.max(0.12, Math.min(0.65, (a.z + b.z + 2.5) * 0.18));
      const isCoreLink = i === 8 || j === 8;
      tensorCtx.beginPath();
      tensorCtx.moveTo(a.x, a.y);
      tensorCtx.lineTo(b.x, b.y);
      tensorCtx.lineWidth = isCoreLink ? 1.4 : 1.0;
      tensorCtx.strokeStyle = isCoreLink
        ? `oklch(70% 0.19 40 / ${alpha * 1.5})`
        : `oklch(18% 0.006 60 / ${alpha})`;
      tensorCtx.stroke();
    });

    for (let i = 0; i < 8; i++) {
      const n = proj[i];
      const r = 3.2 * n.p;
      tensorCtx.beginPath();
      tensorCtx.arc(n.x, n.y, r, 0, Math.PI * 2);
      tensorCtx.fillStyle = 'oklch(18% 0.006 60 / 0.85)';
      tensorCtx.fill();
      tensorCtx.lineWidth = 1;
      tensorCtx.strokeStyle = 'oklch(96% 0.011 85)';
      tensorCtx.stroke();
    }

    const coreNode = proj[8];
    const pulse = Math.sin(Date.now() * 0.006) * 1.5;
    const coreR = Math.max(3, 7.5 * coreNode.p + pulse);

    tensorCtx.beginPath();
    tensorCtx.arc(coreNode.x, coreNode.y, coreR + 6, 0, Math.PI * 2);
    tensorCtx.fillStyle = 'oklch(70% 0.19 40 / 0.18)';
    tensorCtx.fill();

    tensorCtx.beginPath();
    tensorCtx.arc(coreNode.x, coreNode.y, coreR, 0, Math.PI * 2);
    tensorCtx.fillStyle = 'oklch(70% 0.19 40)';
    tensorCtx.fill();
    tensorCtx.lineWidth = 1.5;
    tensorCtx.strokeStyle = 'oklch(99.5% 0.005 85)';
    tensorCtx.stroke();

    coreAnimId = requestAnimationFrame(render3DCoreFrame);
  }

  /* Hook for card switching */
  window.__onCardChange = (key) => {
    if (key === 'core') {
      start3DCore();
      playHapticSound('click', 1700);
    }
  };

  /* ═══════════════ AMBIENT STUDIO LIGHTING (TORCH) ═══════════════ */
  const torch = document.querySelector('#ambientTorch');
  if (torch && fine && !reduce) {
    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.3;
    let currX = mouseX, currY = mouseY;
    let torchActive = false;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!torchActive) {
        torchActive = true;
        torch.classList.add('is-active');
      }
    });

    const animTorch = () => {
      currX += (mouseX - currX) * 0.12;
      currY += (mouseY - currY) * 0.12;
      torch.style.setProperty('--tx', `${currX.toFixed(1)}px`);
      torch.style.setProperty('--ty', `${currY.toFixed(1)}px`);
      requestAnimationFrame(animTorch);
    };
    requestAnimationFrame(animTorch);
  }

  /* ═══════════════ FIGURE 4 SIMULATOR ENHANCEMENTS ═══════════════ */
  const simSlider = document.querySelector('#simSlider');
  const simFlowVal = document.querySelector('#simFlowVal');
  const simAlphaBadge = document.querySelector('#simAlphaBadge');
  const simRegimeText = document.querySelector('#simRegimeText');
  const graphAegis = document.querySelector('#graphAegis');
  const graphScrubber = document.querySelector('#graphScrubber');
  const graphTag = document.querySelector('#graphTag');
  const graphTagText = document.querySelector('#graphTagText');
  const graphRadar = document.querySelector('#graphRadar');
  const surgeGateLine = document.querySelector('#surgeGateLine');
  const presetBtns = [...document.querySelectorAll('.sim__preset-btn')];
  let lastWasSurge = false;

  function updateArbitration(flow, triggerClick = false) {
    flow = Math.max(1200, Math.min(22000, Number(flow)));
    if (simFlowVal) simFlowVal.textContent = flow.toLocaleString();
    if (simSlider) simSlider.value = flow;

    let alpha = 0.0;
    let regime = 'Winter Baseflow';
    if (flow < 6000) {
      alpha = (flow - 1200) / 4800 * 0.20;
      regime = 'Winter Baseflow (𝛼≈0.0)';
    } else if (flow < 16000) {
      alpha = 0.20 + (flow - 6000) / 10000 * 0.55;
      regime = 'Pre-Monsoon Transitional';
    } else {
      alpha = 0.75 + (flow - 16000) / 6000 * 0.25;
      regime = '🚨 Monsoon Surge Gate (𝛼=1.0)';
    }
    alpha = Math.min(1.0, Math.max(0.0, alpha));

    const isSurge = flow >= 16000;
    if (surgeGateLine) surgeGateLine.classList.toggle('is-breached', isSurge);

    if (isSurge && !lastWasSurge) {
      playHapticSound('latch');
    }
    lastWasSurge = isSurge;

    if (simAlphaBadge) {
      simAlphaBadge.textContent = `𝛼 = ${alpha.toFixed(2)}`;
      simAlphaBadge.className = isSurge ? 'chip chip--held' : 'chip chip--ok';
    }
    if (simRegimeText) {
      simRegimeText.textContent = regime;
    }

    const peakY = 112 - (alpha * 74);
    if (graphAegis) {
      graphAegis.setAttribute('d', `M 10 120 Q 140 ${118 - alpha * 20}, 270 ${peakY.toFixed(1)} T 530 ${118 - alpha * 18}`);
    }
    if (graphScrubber) {
      graphScrubber.setAttribute('cy', peakY.toFixed(1));
    }
    if (graphTag) {
      graphTag.setAttribute('transform', `translate(270, ${(peakY - 16).toFixed(1)})`);
    }
    if (graphTagText) {
      graphTagText.textContent = `${flow.toLocaleString()} m³/s`;
    }

    presetBtns.forEach((btn) => {
      const bFlow = Number(btn.dataset.flow);
      btn.classList.toggle('is-active', Math.abs(bFlow - flow) < 1500);
    });

    if (triggerClick && !isSurge) {
      playHapticSound('click', 1000 + alpha * 800);
    }
  }

  /* Real-time radar scan line animation on SVG */
  if (graphRadar) {
    let radarX = 10, radarDir = 1;
    const sweepRadar = () => {
      radarX += 2.2 * radarDir;
      if (radarX > 530) { radarX = 530; radarDir = -1; }
      else if (radarX < 10) { radarX = 10; radarDir = 1; }
      graphRadar.setAttribute('x1', radarX.toFixed(1));
      graphRadar.setAttribute('x2', radarX.toFixed(1));
      requestAnimationFrame(sweepRadar);
    };
    requestAnimationFrame(sweepRadar);
  }

  if (simSlider) {
    simSlider.addEventListener('input', (e) => {
      updateArbitration(e.target.value, true);
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      updateArbitration(btn.dataset.flow, true);
    });
  });

  /* ═══════════════ 3D INTERACTIVE TILT ON INSPECTION SHEET ═══════════════ */
  const docCard = document.querySelector('.doc');
  const docSheet = docCard && docCard.querySelector('.doc__sheet');
  if (docCard && docSheet && fine && !reduce) {
    docCard.addEventListener('mousemove', (e) => {
      const rect = docCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotX = (-y * 14).toFixed(2);
      const rotY = (x * 16).toFixed(2);
      docSheet.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    docCard.addEventListener('mouseleave', () => {
      docSheet.style.transform = '';
    });
  }

  /* ═══════════════ SYSTEM HUD / COMMAND PALETTE ═══════════════ */
  const hudTrigger = document.querySelector('#hudTrigger');
  const hudOverlay = document.querySelector('#hudOverlay');
  const hudClose = document.querySelector('#hudClose');
  const hudSearch = document.querySelector('#hudSearch');
  const hudItemsWrap = document.querySelector('#hudItems');
  const hudItems = hudItemsWrap ? [...hudItemsWrap.querySelectorAll('.hud-item')] : [];
  let focusedHudIdx = 0;

  function openHud() {
    if (!hudOverlay) return;
    hudOverlay.hidden = false;
    if (hudSearch) {
      hudSearch.value = '';
      hudSearch.focus();
    }
    updateHudFocus(0);
    playHapticSound('chime');
  }

  function closeHud() {
    if (!hudOverlay) return;
    hudOverlay.hidden = true;
    playHapticSound('click', 1000);
  }

  function updateHudFocus(idx) {
    const visible = hudItems.filter((i) => !i.hidden);
    if (!visible.length) return;
    idx = Math.max(0, Math.min(visible.length - 1, idx));
    focusedHudIdx = idx;
    hudItems.forEach((item) => item.classList.remove('is-focused'));
    visible[idx].classList.add('is-focused');
    visible[idx].scrollIntoView({ block: 'nearest' });
  }

  if (hudTrigger) hudTrigger.addEventListener('click', openHud);
  if (hudClose) hudClose.addEventListener('click', closeHud);
  if (hudOverlay) {
    hudOverlay.addEventListener('click', (e) => {
      if (e.target === hudOverlay) closeHud();
    });
  }

  /* Global Keyboard listener for Cmd+K / Ctrl+K & Esc */
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (hudOverlay && !hudOverlay.hidden) closeHud();
      else openHud();
    } else if (e.key === 'Escape') {
      if (hudOverlay && !hudOverlay.hidden) closeHud();
      if (brandModalOverlay && !brandModalOverlay.hidden) closeBrandModal();
    } else if (hudOverlay && !hudOverlay.hidden) {
      const visible = hudItems.filter((i) => !i.hidden);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateHudFocus(focusedHudIdx + 1);
        playHapticSound('click', 1500);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateHudFocus(focusedHudIdx - 1);
        playHapticSound('click', 1500);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (visible[focusedHudIdx]) {
          visible[focusedHudIdx].click();
          closeHud();
        }
      }
    }
  });

  /* Filter input in HUD */
  if (hudSearch) {
    hudSearch.addEventListener('input', () => {
      const q = hudSearch.value.trim().toLowerCase();
      hudItems.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.hidden = q.length > 0 && !text.includes(q);
      });
      updateHudFocus(0);
    });
  }

  /* Copy BibTeX Citation */
  const hudCopyCite = document.querySelector('#hudCopyCite');
  if (hudCopyCite) {
    hudCopyCite.addEventListener('click', () => {
      const bibtex = `@article{taha2026reasoning,
  author = {Muhammad Taha},
  title = {Empirical Validation of Reasoning Arbitration Transformers (RAT) and Aegis V13 Networks Across Indus Basin Test Cycles},
  year = {2026},
  journal = {Technical Systems & Telemetry Archive},
  pages = {Table 2--3, Figure 4}
}`;
      navigator.clipboard.writeText(bibtex).then(() => {
        const origLabel = hudCopyCite.querySelector('.hud-label').innerHTML;
        hudCopyCite.querySelector('.hud-label').innerHTML = '<strong>Citation Copied to Clipboard (BibTeX)</strong>';
        playHapticSound('chime');
        setTimeout(() => {
          hudCopyCite.querySelector('.hud-label').innerHTML = origLabel;
        }, 2200);
      });
    });
  }

  /* ═══════════════ BRAND IDENTITY SYSTEM MODAL ═══════════════ */
  const brandModalOverlay = document.querySelector('#brandModalOverlay');
  const brandModalClose = document.querySelector('#brandModalClose');
  const hudBrandTrigger = document.querySelector('#hudBrandTrigger');
  const footerBrandLink = document.querySelector('#footerBrandLink');

  function openBrandModal() {
    if (!brandModalOverlay) return;
    brandModalOverlay.hidden = false;
    playHapticSound('chime');
  }

  function closeBrandModal() {
    if (!brandModalOverlay) return;
    brandModalOverlay.hidden = true;
    playHapticSound('click', 1100);
  }

  if (brandModalClose) brandModalClose.addEventListener('click', closeBrandModal);
  if (brandModalOverlay) {
    brandModalOverlay.addEventListener('click', (e) => {
      if (e.target === brandModalOverlay) closeBrandModal();
    });
  }
  if (hudBrandTrigger) {
    hudBrandTrigger.addEventListener('click', () => {
      closeHud();
      openBrandModal();
    });
  }
  if (footerBrandLink) {
    footerBrandLink.addEventListener('click', openBrandModal);
  }

  /* ═══════════════ MAGNETIC MICRO-SPRING CURSOR PHYSICS ═══════════════ */
  if (fine && !reduce) {
    const magnetics = [...document.querySelectorAll('[data-magnetic]')];
    magnetics.forEach((el) => {
      let rafMag = 0;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.22;
        const dy = (e.clientY - cy) * 0.22;
        cancelAnimationFrame(rafMag);
        rafMag = requestAnimationFrame(() => {
          el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(rafMag);
        el.style.transform = '';
      });
    });
  }

  /* Sound on tab & pin clicks */
  segTabs.forEach((b) => b.addEventListener('click', () => playHapticSound('click', 1400)));
  pins.forEach((p) => p.addEventListener('click', () => playHapticSound('click', 1600)));

  /* Export audit log action */
  const saveBtn = document.querySelector('.entry__save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      playHapticSound('chime');
      const origText = saveBtn.textContent;
      saveBtn.textContent = 'Telemetry Log Exported (PDF)';
      setTimeout(() => { saveBtn.textContent = origText; }, 2400);
    });
  }

  /* ═══════════════ GSAP TIMELINE & SCROLLTRIGGER REVEAL ENGINE ═══════════════ */
  function initGsapAnimations() {
    if (typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (reduce) return;

    /* 1. Hero text reveal.
       NOTE: .hero__map is intentionally NOT animated and the map canvas has no parallax:
       a transform on either one shifts the pins/card away from the drawn map. */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('.hero__tagline', { y: 24, opacity: 0, duration: 0.65 })
      .from('.word-inner', {
        y: '120%',
        opacity: 0,
        rotateX: -35,
        stagger: 0.065,
        duration: 0.85,
        ease: 'power4.out'
      }, '-=0.3')
      .from('.hero .lead', { y: 22, opacity: 0, duration: 0.75 }, '-=0.45')
      .from('.hero .actions .btn', {
        y: 18,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: 'back.out(1.4)',
        clearProps: 'transform,opacity'
      }, '-=0.4');

    if (typeof ScrollTrigger === 'undefined') return;

    /* 2. Section Headings Scroll Reveals */
    const headings = [
      '#benchmarks .index__title',
      '#experience .experience__head',
      '#timeline .day__head',
      '#lab .inspect__text > h2',
      '#lab .inspect__text > .lead',
      '#dispatch .band__text'
    ];

    headings.forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        y: 35,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    /* 3. Experience & Education Cards Batch Stagger */
    ScrollTrigger.batch('.exp-card', {
      start: 'top 85%',
      once: true,
      onEnter: (batch) => {
        gsap.from(batch, {
          y: 45,
          opacity: 0,
          stagger: 0.14,
          duration: 0.85,
          ease: 'power3.out',
          overwrite: true
        });
      }
    });

    /* 4. Skills Ribbon Reveal */
    const ribbon = document.querySelector('.skills-ribbon');
    if (ribbon) {
      gsap.from(ribbon, {
        scrollTrigger: { trigger: ribbon, start: 'top 88%', toggleActions: 'play none none none' },
        y: 30,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out'
      });
    }

    /* 5. Benchmark Table Rows Batch Stagger */
    ScrollTrigger.batch('.tbl tbody tr', {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => {
        gsap.from(batch, {
          y: 20,
          opacity: 0,
          stagger: 0.07,
          duration: 0.55,
          ease: 'power2.out',
          overwrite: true
        });
      }
    });

    /* 6. Interactive Arbitration Simulator Reveal */
    const sim = document.getElementById('arbitrationSim');
    if (sim) {
      gsap.from(sim, {
        scrollTrigger: { trigger: sim, start: 'top 85%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out'
      });
    }

    /* 7. Lab Spec Cards Reveal */
    const inspectCards = document.querySelectorAll('.inspect__entry, .doc');
    if (inspectCards.length) {
      gsap.from(inspectCards, {
        scrollTrigger: { trigger: '.inspect__grid', start: 'top 82%', toggleActions: 'play none none none' },
        y: 45,
        opacity: 0,
        stagger: 0.18,
        duration: 0.85,
        ease: 'power3.out'
      });
    }

    /* 8. Dispatch Form & Offer Sheet Reveal */
    const offerSheet = document.querySelector('.offer__sheet');
    if (offerSheet) {
      gsap.from(offerSheet, {
        scrollTrigger: { trigger: offerSheet, start: 'top 85%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out'
      });
    }
  }

  /* Mobile & Tablet Hamburger Navigation Controller */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileNav');
    const close = document.getElementById('mobileNavClose');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (!toggle || !menu) return;

    function openMenu() {
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');
      if (isOpen) closeMenu();
      else openMenu();
    });

    if (close) close.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    menu.querySelectorAll('.mobile-nav__link, .mobile-nav__actions a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
  }

  initMobileNav();

  /* Initialize GSAP reveals */
  initGsapAnimations();
})();