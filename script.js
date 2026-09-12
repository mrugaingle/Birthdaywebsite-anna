(function () {
  const photosEl = document.getElementById("photos");
  const stringsEl = document.getElementById("strings");
  const noteEl = document.getElementById("note");
  const boardEl = document.getElementById("board");

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
    () => { const p = document.createElement("div"); p.className = "tape tape-pink"; return p; },
    () => { const p = document.createElement("div"); p.className = "tape tape-blue"; return p; },
    () => { const p = document.createElement("div"); p.className = "tape tape-yellow"; return p; },
  ];

  const cards = [];

  function buildCards() {
    photosEl.innerHTML = "";
    cards.length = 0;

    const list = (CONFIG.photos || []);
    const cardWidth = window.innerWidth <= 720 ? 165 : 220;
    const cols = Math.max(2, Math.min(4, Math.floor(window.innerWidth / (cardWidth + 60))));
    const rows = Math.ceil(list.length / cols);
    const cellW = photosEl.clientWidth / cols;
    const cellH = cardWidth + 140; // photo + caption + breathing room

    photosEl.style.height = (rows * cellH + 80) + "px";

    list.forEach((p, i) => {
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

      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (rand() - 0.5) * (cellW * 0.35);
      const jitterY = (rand() - 0.5) * 40;
      const left = col * cellW + (cellW - cardWidth) / 2 + jitterX;
      const top = row * cellH + jitterY + 20;
      const rotate = (typeof p.rotate === "number") ? p.rotate : (rand() * 14 - 7);

      card.style.left = Math.max(10, left) + "px";
      card.style.top = top + "px";
      card.style.transform = `rotate(${rotate}deg)`;

      photosEl.appendChild(card);
      cards.push(card);
    });
  }

  function drawStrings() {
    const boardRect = boardEl.getBoundingClientRect();
    stringsEl.setAttribute("width", boardEl.scrollWidth);
    stringsEl.setAttribute("height", boardEl.scrollHeight);
    stringsEl.setAttribute("viewBox", `0 0 ${boardEl.scrollWidth} ${boardEl.scrollHeight}`);
    stringsEl.innerHTML = "";

    if (!noteEl || cards.length === 0) return;

    const noteRect = noteEl.getBoundingClientRect();
    const noteX = noteRect.left - boardRect.left + noteRect.width / 2;
    const noteY = noteRect.top - boardRect.top + noteRect.height;

    // connect the note to a handful of photos (every 3rd-ish) for a mind-map feel
    cards.forEach((card, i) => {
      if (i % 3 !== 0) return;
      const r = card.getBoundingClientRect();
      const x = r.left - boardRect.left + r.width / 2;
      const y = r.top - boardRect.top;

      const midX = (noteX + x) / 2;
      const midY = (noteY + y) / 2 - 40 - rand() * 30;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        `M ${noteX} ${noteY} Q ${midX} ${midY} ${x} ${y}`
      );
      stringsEl.appendChild(path);
    });
  }

  function render() {
    buildCards();
    // wait a frame so layout settles before measuring for strings
    requestAnimationFrame(() => requestAnimationFrame(drawStrings));
  }

  render();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 200);
  });
})();
