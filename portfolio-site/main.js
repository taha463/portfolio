(function () {
  const REPO_DEFAULTS = {
    'Mistral-7B-MultiLoRA-Legal': {
      name: 'taha463/Mistral-7B-MultiLoRA-Legal',
      url: 'https://github.com/taha463/Mistral-7B-MultiLoRA-Legal',
      language: 'Python',
      description: 'Fine-tuning Mistral-7B with 3 Multi-LoRA heads and DeBERTa-v3 evidence-guided probability arbitration on LawInstruct.',
      stat1Label: 'IID Token F1',
      stat1Value: '0.6623',
      stat2Label: 'IID Exact Match',
      stat2Value: '46.67%',
      pushedAt: null,
    },
    'socratic-tutor': {
      name: 'taha463/socratic-tutor',
      url: 'https://github.com/taha463/socratic-tutor',
      language: 'TypeScript',
      description: 'Local-first Next.js 15 and LangGraph multi-agent pedagogical tutor with SQLite WAL storage and in-browser Pyodide Python.',
      stat1Label: 'Answer Leak',
      stat1Value: '0.0%',
      stat2Label: 'CI Suite',
      stat2Value: '71 tests',
      pushedAt: null,
    },
    'aegis-frontend': {
      name: 'taha463/aegis-frontend',
      url: 'https://github.com/taha463/aegis-frontend',
      language: 'JavaScript',
      description: 'Bilingual flood prediction and disaster assistance PWA for Pakistan backed by Indus Basin river forecasting.',
      stat1Label: 'Nowshera KGE',
      stat1Value: '0.89',
      stat2Label: 'Mangla Recall',
      stat2Value: '0.87',
      pushedAt: null,
    },
  };

  function formatRelativeTime(isoDate, nowMs) {
    if (!isoDate) {
      return 'Active';
    }
    const ts = Date.parse(isoDate);
    if (Number.isNaN(ts)) {
      return 'Active';
    }
    const ref = typeof nowMs === 'number' ? nowMs : Date.now();
    const diffDays = Math.max(0, Math.floor((ref - ts) / 86400000));
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return '1d ago';
    }
    if (diffDays < 30) {
      return `${diffDays}d ago`;
    }
    const months = Math.floor(diffDays / 30);
    if (months < 12) {
      return `${months}mo ago`;
    }
    return `${Math.floor(months / 12)}y ago`;
  }

  function getRepoSummary(key, liveMap, nowMs) {
    const base = REPO_DEFAULTS[key] || REPO_DEFAULTS['Mistral-7B-MultiLoRA-Legal'];
    const live = liveMap && liveMap[key] ? liveMap[key] : null;
    return {
      name: base.name,
      url: live && live.html_url ? live.html_url : base.url,
      language: live && live.language ? live.language : base.language,
      description: live && live.description ? live.description : base.description,
      stat1Label: base.stat1Label,
      stat1Value: base.stat1Value,
      stat2Label: base.stat2Label,
      stat2Value: base.stat2Value,
      pushedLabel: formatRelativeTime(live && live.pushed_at ? live.pushed_at : base.pushedAt, nowMs),
    };
  }

  function buildKnotPoints(cx, cy, scale) {
    const s = Math.max(0.55, Math.min(1.15, Number(scale) || 0.85));
    const raw = [
      [0, 0],
      [42, -6],
      [88, 4],
      [108, 26],
      [84, 44],
      [40, 28],
      [-2, 4],
      [-46, 0],
      [-92, 12],
      [-106, 36],
      [-78, 48],
      [-36, 26],
      [4, 6],
      [16, 34],
      [22, 66],
      [42, 92],
      [74, 98],
    ];
    return raw.map(([dx, dy]) => ({ x: cx + dx * s, y: cy + dy * s }));
  }

  function computeLinePath(points) {
    if (!Array.isArray(points) || points.length < 2) {
      return '';
    }
    const out = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
    for (let i = 1; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const mx = (curr.x + next.x) / 2;
      const my = (curr.y + next.y) / 2;
      out.push(`Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}, ${mx.toFixed(1)} ${my.toFixed(1)}`);
    }
    const last = points[points.length - 1];
    out.push(`L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`);
    return out.join(' ');
  }

  const core = { formatRelativeTime, getRepoSummary, buildKnotPoints, computeLinePath };
  globalThis.__portfolioCore = core;

  if (typeof document === 'undefined' || typeof document.querySelector !== 'function') {
    return;
  }

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = (() => {
      try {
        return localStorage.getItem('portfolio-theme');
      } catch {
        return null;
      }
    })();

    let current = saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light';

    function apply(theme, persist) {
      current = theme;
      root.dataset.theme = theme;
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      }
      if (persist) {
        try {
          localStorage.setItem('portfolio-theme', theme);
        } catch {
          return;
        }
      }
    }

    apply(current, false);

    if (toggle) {
      toggle.addEventListener('click', () => {
        apply(current === 'dark' ? 'light' : 'dark', true);
      });
    }
  }

  function initEyes() {
    const eyes = document.getElementById('heroEyes');
    const pupils = document.getElementById('eyePupils');
    const wrap = document.getElementById('heroEyesWrap');
    if (!eyes || !pupils || !wrap) {
      return;
    }

    if (!reducedMotion) {
      window.addEventListener('pointermove', (event) => {
        const rect = eyes.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / 280));
        const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / 240));
        pupils.style.transform = `translate(${(dx * 10).toFixed(2)}px, ${(dy * 8).toFixed(2)}px)`;
      });

      function scheduleBlink() {
        const delay = 2500 + Math.random() * 3400;
        window.setTimeout(() => {
          eyes.classList.add('blink');
          window.setTimeout(() => {
            eyes.classList.remove('blink');
            scheduleBlink();
          }, 125);
        }, delay);
      }
      scheduleBlink();
    }

    wrap.addEventListener('pointerenter', () => eyes.classList.add('surprised'));
    wrap.addEventListener('pointerleave', () => eyes.classList.remove('surprised'));
    wrap.addEventListener('click', () => {
      eyes.classList.add('blink', 'surprised');
      window.setTimeout(() => eyes.classList.remove('blink'), 135);
      window.setTimeout(() => eyes.classList.remove('surprised'), 520);
    });
  }

  function initLine() {
    const page = document.getElementById('page');
    const svg = document.getElementById('line');
    const pathEl = document.getElementById('linePath');
    const tip = document.getElementById('tip');
    if (!page || !svg || !pathEl || !tip) {
      return;
    }

    let totalLen = 0;
    let samples = [];
    let currentLen = 0;
    let targetLen = 0;
    let velocity = 0;
    let smoothScrollY = window.scrollY;
    let rafId = 0;
    let lastTime = 0;
    let introLen = 0;

    function rectRel(el) {
      const pRect = page.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return {
        left: r.left - pRect.left,
        right: r.right - pRect.left,
        top: r.top - pRect.top,
        bottom: r.bottom - pRect.top,
        width: r.width,
        height: r.height,
        cx: r.left - pRect.left + r.width / 2,
        cy: r.top - pRect.top + r.height / 2,
      };
    }

    function lengthAtY(targetY) {
      if (samples.length === 0) {
        return 0;
      }
      let best = samples[0].len;
      for (let i = 0; i < samples.length; i++) {
        if (samples[i].y <= targetY) {
          best = samples[i].len;
        }
      }
      return best;
    }

    function sampleAtLength(len) {
      if (samples.length < 2) {
        return { x: 0, y: 0, dx: 0, dy: 1 };
      }
      const clamped = Math.max(0, Math.min(totalLen, len));
      let lo = 0;
      let hi = samples.length - 1;
      while (lo + 1 < hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].len <= clamped) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      const a = samples[lo];
      const b = samples[hi];
      const t = (clamped - a.len) / (b.len - a.len || 1);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        dx: b.x - a.x,
        dy: b.y - a.y,
      };
    }

    function targetLengthForScroll(scrollY) {
      const vh = window.innerHeight || 900;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const endEase = Math.max(0, Math.min(1, (scrollY - (maxScroll - vh * 0.65)) / (vh * 0.65)));
      const smoothEnd = endEase * endEase * (3 - 2 * endEase);
      const viewportRatio = 0.68 + 0.42 * smoothEnd;
      if (scrollY >= maxScroll - 4) {
        return totalLen;
      }
      return Math.max(introLen, lengthAtY(scrollY + vh * viewportRatio));
    }

    function drawAt(len) {
      const clamped = Math.max(0, Math.min(totalLen, len));
      pathEl.style.strokeDashoffset = String(totalLen - clamped);
      const pt = sampleAtLength(clamped);
      const mag = Math.hypot(pt.dx, pt.dy) || 1;
      const tilt = Math.max(-1, Math.min(1, pt.dx / mag)) * 14;
      tip.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
      tip.classList.toggle('on', clamped > 40 && clamped < totalLen - 3);
    }

    function buildPath() {
      const width = page.clientWidth;
      const height = page.scrollHeight;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('width', String(width));
      svg.setAttribute('height', String(height));

      const isDesktop = width >= 820;
      const padX = isDesktop ? Math.max(28, Math.min(72, width * 0.045)) : 20;
      const leftEdge = padX;
      const rightEdge = width - padX;

      const lead = document.getElementById('a-lead');
      const phrase = document.getElementById('a-phrase');
      const work = document.getElementById('work-title');
      const prints = document.getElementById('prints-title');
      const links = document.getElementById('a-links');

      const pts = [];

      if (lead) {
        const r = rectRel(lead);
        const dropX = Math.min(rightEdge, r.right + (isDesktop ? 28 : 16));
        pts.push({ x: dropX, y: -12 });
        pts.push({ x: dropX, y: Math.max(0, r.top - 6) });
        pts.push({ x: dropX, y: r.bottom + 10 });
        pts.push({ x: r.cx, y: r.bottom + 14 });
        pts.push({ x: Math.max(leftEdge, r.left - (isDesktop ? 20 : 6)), y: r.bottom + 10 });
        pts.push({ x: isDesktop ? Math.max(leftEdge, r.left - 56) : leftEdge, y: r.bottom + (isDesktop ? 130 : 48) });
      } else {
        pts.push({ x: rightEdge, y: -12 });
      }

      if (phrase) {
        const r = rectRel(phrase);
        if (isDesktop) {
          pts.push({ x: leftEdge + 24, y: r.top - 72 });
          pts.push({ x: width * 0.48, y: r.top - 52 });
          pts.push({ x: Math.min(rightEdge, r.right + 28), y: r.top - 32 });
          pts.push({ x: Math.min(rightEdge, r.right + 20), y: r.bottom + 12 });
          pts.push({ x: r.cx, y: r.bottom + 16 });
          pts.push({ x: Math.max(leftEdge, r.left - 10), y: r.bottom + 12 });
          pts.push({ x: rightEdge, y: r.bottom + 90 });
        } else {
          pts.push({ x: leftEdge, y: r.top - 30 });
          pts.push({ x: leftEdge, y: r.bottom + 36 });
        }
      }

      if (work) {
        const r = rectRel(work);
        pts.push({ x: isDesktop ? rightEdge : leftEdge, y: r.top - 36 });
        pts.push({ x: isDesktop ? rightEdge - 8 : leftEdge, y: r.bottom + 180 });
      }

      if (prints) {
        const r = rectRel(prints);
        pts.push({ x: isDesktop ? leftEdge : rightEdge, y: r.top - 32 });
        pts.push({ x: isDesktop ? leftEdge + 10 : rightEdge, y: r.bottom + 140 });
      }

      if (links) {
        const r = rectRel(links);
        const rx = Math.min(r.width * 0.68, width * 0.44);
        const ry = Math.max(r.height * 0.92, 46);
        pts.push({ x: r.cx - rx * 0.85, y: r.cy - ry * 0.75 });
        pts.push({ x: r.cx, y: r.cy - ry });
        pts.push({ x: r.cx + rx, y: r.cy - ry * 0.35 });
        pts.push({ x: r.cx + rx * 0.92, y: r.cy + ry * 0.65 });
        pts.push({ x: r.cx, y: r.cy + ry });
        pts.push({ x: r.cx - rx * 0.9, y: r.cy + ry * 0.55 });
        pts.push({ x: r.cx - rx * 0.72, y: r.cy - ry * 0.25 });
        pts.push({ x: r.cx, y: r.cy + ry + 6 });
        const knot = buildKnotPoints(r.cx, r.cy + ry + 14, Math.min(1, r.width / 320));
        knot.forEach((k) => pts.push(k));
      } else {
        const knot = buildKnotPoints(width / 2, height - 110, 0.85);
        knot.forEach((k) => pts.push(k));
      }

      const d = computeLinePath(pts);
      pathEl.setAttribute('d', d);
      totalLen = typeof pathEl.getTotalLength === 'function' ? pathEl.getTotalLength() : 0;
      samples = [];

      if (totalLen > 0) {
        const step = Math.max(6, totalLen / 750);
        for (let l = 0; l <= totalLen; l += step) {
          const p = pathEl.getPointAtLength(l);
          samples.push({ x: p.x, y: p.y, len: l });
        }
        const lastP = pathEl.getPointAtLength(totalLen);
        samples.push({ x: lastP.x, y: lastP.y, len: totalLen });
      }

      const leadRect = lead ? rectRel(lead) : null;
      introLen = leadRect ? lengthAtY(leadRect.bottom + 24) : Math.min(totalLen, 240);

      if (reducedMotion || totalLen === 0) {
        pathEl.style.strokeDasharray = 'none';
        pathEl.style.strokeDashoffset = '0';
        tip.classList.remove('on');
        return;
      }

      pathEl.style.strokeDasharray = `${totalLen} ${totalLen}`;
      targetLen = targetLengthForScroll(window.scrollY);
      currentLen = Math.max(introLen, Math.min(totalLen, currentLen || targetLen));
      drawAt(currentLen);
      kick();
    }

    function tick(now) {
      rafId = 0;
      if (reducedMotion || totalLen === 0) {
        return;
      }
      const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
      lastTime = now;

      smoothScrollY += (window.scrollY - smoothScrollY) * (1 - Math.exp(-dt / 0.14));
      if (Math.abs(window.scrollY - smoothScrollY) < 0.5) {
        smoothScrollY = window.scrollY;
      }

      targetLen = targetLengthForScroll(smoothScrollY);
      const diff = targetLen - currentLen;
      const desiredVel = diff >= 0 ? Math.min(6400, diff / 0.16 + 40) : Math.max(-7200, diff / 0.12 - 40);
      velocity += (desiredVel - velocity) * (1 - Math.exp(-dt / 0.08));
      const next = currentLen + velocity * dt;

      if ((diff >= 0 && next >= targetLen) || (diff <= 0 && next <= targetLen)) {
        currentLen = targetLen;
        velocity = 0;
      } else {
        currentLen = next;
      }

      drawAt(currentLen);

      if (Math.abs(targetLen - currentLen) > 0.5 || smoothScrollY !== window.scrollY) {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    function kick() {
      if (reducedMotion || totalLen === 0) {
        return;
      }
      if (!rafId) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    }

    buildPath();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => window.requestAnimationFrame(buildPath));
    }
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => window.requestAnimationFrame(buildPath));
      ro.observe(page);
    }
    window.addEventListener('load', buildPath);
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', buildPath);
  }

  function initGithubLive() {
    const tabs = Array.from(document.querySelectorAll('#ghTabs .tab-pill'));
    const statusEl = document.getElementById('ghSyncStatus');
    const nameEl = document.getElementById('ghRepoName');
    const langEl = document.getElementById('ghRepoLang');
    const descEl = document.getElementById('ghRepoDesc');
    const stat1 = document.getElementById('ghStat1');
    const stat2 = document.getElementById('ghStat2');
    const stat3 = document.getElementById('ghStat3');
    const statLabels = Array.from(document.querySelectorAll('.live-stats span'));

    if (tabs.length === 0 || !nameEl) {
      return;
    }

    const liveMap = {};
    let activeKey = 'Mistral-7B-MultiLoRA-Legal';

    function render(key) {
      activeKey = key;
      const summary = getRepoSummary(key, liveMap);
      nameEl.textContent = summary.name;
      nameEl.href = summary.url;
      if (langEl) {
        langEl.textContent = summary.language;
      }
      if (descEl) {
        descEl.textContent = summary.description;
      }
      if (statLabels[0]) {
        statLabels[0].textContent = summary.stat1Label;
      }
      if (statLabels[1]) {
        statLabels[1].textContent = summary.stat2Label;
      }
      if (stat1) {
        stat1.textContent = summary.stat1Value;
      }
      if (stat2) {
        stat2.textContent = summary.stat2Value;
      }
      if (stat3) {
        stat3.textContent = summary.pushedLabel;
      }
      tabs.forEach((btn) => {
        const active = btn.dataset.repo === key;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });
    }

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.repo) {
          render(btn.dataset.repo);
        }
      });
    });

    render(activeKey);

    if (typeof fetch === 'function') {
      fetch('https://api.github.com/users/taha463/repos?per_page=30&sort=updated')
        .then((res) => (res.ok ? res.json() : null))
        .then((repos) => {
          if (!Array.isArray(repos)) {
            return;
          }
          repos.forEach((r) => {
            if (r && r.name && REPO_DEFAULTS[r.name]) {
              liveMap[r.name] = r;
            }
          });
          if (statusEl) {
            statusEl.textContent = 'Live synced · github.com/taha463';
          }
          render(activeKey);
        })
        .catch(() => {
          return;
        });
    }
  }

  function initBenchmarks() {
    const filterBtns = Array.from(document.querySelectorAll('#benchFilters .chip-btn'));
    const rows = Array.from(document.querySelectorAll('#benchTable tbody tr'));

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const log = btn.dataset.log || 'all';
        filterBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        rows.forEach((row) => {
          row.hidden = log !== 'all' && row.dataset.log !== log;
        });
      });
    });
  }

  function initPrintsAndLightbox() {
    const pile = document.getElementById('pile');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    const lbCap = document.getElementById('lightboxCaption');
    const lbClose = document.getElementById('lightboxClose');
    const lbScrim = document.getElementById('lightboxScrim');
    const lbPrev = document.getElementById('lightboxPrev');
    const lbNext = document.getElementById('lightboxNext');

    if (!pile) {
      return;
    }

    const prints = Array.from(pile.querySelectorAll('.print'));
    let zTop = 10;
    let activeIdx = 0;
    let lastLightboxFocus = null;

    const layoutRatios = [
      { rx: 0.03, ry: 0.04, r: -4.2 },
      { rx: 0.34, ry: 0.02, r: 2.8 },
      { rx: 0.66, ry: 0.07, r: -3.1 },
      { rx: 0.12, ry: 0.42, r: 3.4 },
      { rx: 0.42, ry: 0.44, r: -2.6 },
      { rx: 0.70, ry: 0.45, r: 4.0 },
      { rx: 0.25, ry: 0.22, r: -1.8 },
    ];

    function placeDefault() {
      const w = pile.clientWidth || 800;
      const h = pile.clientHeight || 520;
      prints.forEach((card, i) => {
        const slot = layoutRatios[i % layoutRatios.length];
        const cardW = card.offsetWidth || 220;
        const cardH = card.offsetHeight || 150;
        const x = Math.max(4, Math.min(w - cardW - 4, Math.round(w * slot.rx)));
        const y = Math.max(4, Math.min(h - cardH - 4, Math.round(h * slot.ry)));
        card.dataset.x = String(x);
        card.dataset.y = String(y);
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
        card.style.setProperty('--r', `${slot.r}deg`);
        card.style.zIndex = String(i + 1);
      });
      zTop = prints.length + 2;
    }

    function showLightbox(index) {
      if (!lightbox || !lbImg || !lbCap) {
        return;
      }
      if (lightbox.hidden) {
        lastLightboxFocus = document.activeElement;
      }
      activeIdx = (index + prints.length) % prints.length;
      const card = prints[activeIdx];
      const img = card.querySelector('img');
      if (img) {
        lbImg.src = img.getAttribute('src') || '';
        lbImg.alt = img.getAttribute('alt') || '';
      }
      lbCap.textContent = card.dataset.caption || '';
      lightbox.hidden = false;
      if (lbClose) {
        lbClose.focus();
      }
    }

    function closeLightbox() {
      if (lightbox) {
        lightbox.hidden = true;
      }
      if (lastLightboxFocus && typeof lastLightboxFocus.focus === 'function') {
        lastLightboxFocus.focus();
        lastLightboxFocus = null;
      }
    }

    prints.forEach((card, idx) => {
      let dragging = false;
      let moved = false;
      let startX = 0;
      let startY = 0;
      let originX = 0;
      let originY = 0;

      card.addEventListener('pointerdown', (event) => {
        dragging = true;
        moved = false;
        startX = event.clientX;
        startY = event.clientY;
        originX = Number(card.dataset.x || 0);
        originY = Number(card.dataset.y || 0);
        zTop += 1;
        card.style.zIndex = String(zTop);
        card.classList.add('dragging');
        if (card.setPointerCapture) {
          card.setPointerCapture(event.pointerId);
        }
      });

      card.addEventListener('pointermove', (event) => {
        if (!dragging) {
          return;
        }
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        if (Math.hypot(dx, dy) > 6) {
          moved = true;
        }
        const nextX = originX + dx;
        const nextY = originY + dy;
        card.dataset.x = String(nextX);
        card.dataset.y = String(nextY);
        card.style.setProperty('--x', `${nextX}px`);
        card.style.setProperty('--y', `${nextY}px`);
      });

      function endDrag() {
        if (!dragging) {
          return;
        }
        dragging = false;
        card.classList.remove('dragging');
      }

      card.addEventListener('pointerup', endDrag);
      card.addEventListener('pointercancel', endDrag);

      card.addEventListener('click', () => {
        if (moved) {
          moved = false;
          return;
        }
        showLightbox(idx);
      });
    });

    if (lbClose) {
      lbClose.addEventListener('click', closeLightbox);
    }
    if (lbScrim) {
      lbScrim.addEventListener('click', closeLightbox);
    }
    if (lbPrev) {
      lbPrev.addEventListener('click', () => showLightbox(activeIdx - 1));
    }
    if (lbNext) {
      lbNext.addEventListener('click', () => showLightbox(activeIdx + 1));
    }

    window.addEventListener('keydown', (event) => {
      if (!lightbox || lightbox.hidden) {
        return;
      }
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        showLightbox(activeIdx - 1);
      } else if (event.key === 'ArrowRight') {
        showLightbox(activeIdx + 1);
      }
    });

    placeDefault();
    window.addEventListener('resize', placeDefault);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEyes();
    initLine();
    initGithubLive();
    initBenchmarks();
    initPrintsAndLightbox();
  });
})();
