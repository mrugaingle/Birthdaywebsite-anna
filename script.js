(function () {
  const photosEl = document.getElementById("photos");
  const stringsEl = document.getElementById("strings");
  const noteEl = document.getElementById("note");
  const canvasEl = document.getElementById("canvas");

  document.getElementById("banner-name").textContent = CONFIG.name || "";
  document.getElementById("note-message").textContent = CONFIG.message || "";
  document.getElementById("note-from").textContent = CONFIG.from || "";

  // simple seeded random so the scatter is stable across reloads/resizes
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(1337);

  const fasteners = [
    () => { const p = document.createElement("div"); p.className = "pin-dot pin-coral"; return p; },
    () => { const p = document.createElement("div"); p.className = "pin-dot pin-sage"; return p; },
    () => { const p = document.createElement("div"); p.className = "pin-dot pin-mustard"; return p; },
    () => { const p = document.createElement("div"); p.className = "pin-dot pin-rose"; return p; },
    () => { const p = document.createElement("div"); p.className = "pin-dot pin-blue"; return p; },
    () => { const p = document.createElement("div"); p.className = "tape tape-pink"; return p; },
    () => { const p = document.createElement("div"); p.className = "tape tape-blue"; return p; },
    () => { const p = document.createElement("div"); p.className = "tape tape-yellow"; return p; },
  ];

  const cards = [];

  function makeCard(p, cardWidth) {
    const card = document.createElement("div");
    card.className = "photo-card";
    card.style.width = cardWidth + "px";

    const fastenerFn = fasteners[Math.floor(rand() * fasteners.length)];
    card.appendChild(fastenerFn());

    const img = document.createElement("img");
    img.src = "photos/" + p.file;
    img.alt = p.caption || "";
    img.loading = "lazy";
    card.appendChild(img);

    if (p.caption) {
      const cap = document.createElement("div");
      cap.className = "photo-caption";
      cap.textContent = p.caption;
      card.appendChild(cap);
    }
    return card;
  }

  function buildRadial(list, cardWidth) {
    const cardH = cardWidth + 70; // photo + caption + padding
    const canvasWidth = Math.min(canvasEl.clientWidth || 1200, 1200);
    const count = list.length;

    // radius grows with photo count, but stays inside the available width
    const maxRadius = canvasWidth / 2 - cardWidth / 2 - 10;
    const wantedRadius = cardWidth * 0.85 + count * 20;
    const radius = Math.max(cardWidth * 0.75, Math.min(maxRadius, wantedRadius));

    const canvasHeight = radius * 2 + cardH + 40;
    canvasEl.style.height = canvasHeight + "px";

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const angleOffset = -90; // first photo starts at the top

    list.forEach((p, i) => {
      const card = makeCard(p, cardWidth);
      const angle = (angleOffset + (360 / count) * i + (rand() - 0.5) * 12) * (Math.PI / 180);
      const r = radius * (0.9 + rand() * 0.2);
      const x = centerX + r * Math.cos(angle) - cardWidth / 2;
      const y = centerY + r * Math.sin(angle) - cardH / 2;
      const rotate = (typeof p.rotate === "number") ? p.rotate : (rand() * 16 - 8);

      card.style.left = x + "px";
      card.style.top = y + "px";
      card.style.transform = `rotate(${rotate}deg)`;

      photosEl.appendChild(card);
      cards.push(card);
    });
  }

  function buildStacked(list, cardWidth) {
    // fallback for narrow screens: simple scattered grid, note pinned above it
    const cols = Math.max(2, Math.floor((canvasEl.clientWidth || 320) / (cardWidth + 40)));
    const cellW = (canvasEl.clientWidth || 320) / cols;
    const cellH = cardWidth + 130;
    const rows = Math.ceil(list.length / cols);
    const topOffset = 260; // room for the note above

    canvasEl.style.height = (topOffset + rows * cellH + 40) + "px";

    list.forEach((p, i) => {
      const card = makeCard(p, cardWidth);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (rand() - 0.5) * (cellW * 0.3);
      const jitterY = (rand() - 0.5) * 30;
      const rotate = (typeof p.rotate === "number") ? p.rotate : (rand() * 14 - 7);

      card.style.left = Math.max(8, col * cellW + (cellW - cardWidth) / 2 + jitterX) + "px";
      card.style.top = (topOffset + row * cellH + jitterY) + "px";
      card.style.transform = `rotate(${rotate}deg)`;

      photosEl.appendChild(card);
      cards.push(card);
    });

    // reposition the note to sit above the stacked photos instead of centered
    noteEl.style.top = "110px";
  }

  function render() {
    photosEl.innerHTML = "";
    cards.length = 0;
    noteEl.style.top = "50%"; // reset (buildStacked may override)

    const list = CONFIG.photos || [];
    const isNarrow = window.innerWidth <= 720;
    const cardWidth = isNarrow ? 150 : 220;
    const glowEl = document.querySelector(".note-glow");

    if (isNarrow) {
      if (glowEl) glowEl.style.display = "none";
      buildStacked(list, cardWidth);
    } else {
      if (glowEl) glowEl.style.display = "block";
      buildRadial(list, cardWidth);
    }

    requestAnimationFrame(() => requestAnimationFrame(drawStrings));
  }

  function drawStrings() {
    const canvasRect = canvasEl.getBoundingClientRect();
    stringsEl.setAttribute("width", canvasEl.scrollWidth);
    stringsEl.setAttribute("height", canvasEl.scrollHeight);
    stringsEl.setAttribute("viewBox", `0 0 ${canvasEl.scrollWidth} ${canvasEl.scrollHeight}`);
    stringsEl.innerHTML = "";

    if (!noteEl || cards.length === 0) return;

    const noteRect = noteEl.getBoundingClientRect();
    const noteX = noteRect.left - canvasRect.left + noteRect.width / 2;
    const noteY = noteRect.top - canvasRect.top + noteRect.height / 2;

    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const x = r.left - canvasRect.left + r.width / 2;
      const y = r.top - canvasRect.top + r.height / 2;

      const midX = (noteX + x) / 2 + (rand() - 0.5) * 20;
      const midY = (noteY + y) / 2 + (rand() - 0.5) * 20;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${noteX} ${noteY} Q ${midX} ${midY} ${x} ${y}`);
      stringsEl.appendChild(path);
    });
  }

  render();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 200);
  });
})();
