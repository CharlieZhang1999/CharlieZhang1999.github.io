/* Charlie Zhang — a small multiverse. Content lives in content/site.js */
(() => {
  const S = window.SITE || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- Universe shuffle ---------- */
  const UNI_COUNT = 5;
  const UNI_NAMES = ["cobalt", "candy", "matcha", "daylight", "tangerine"];
  let uni = 1;
  try { uni = parseInt(localStorage.getItem("uni")) || 1; } catch (e) {}
  const applyUni = () => {
    document.documentElement.setAttribute("data-uni", uni);
    $("#uniName").textContent = `universe 0${uni}`;
    $("#footUni").textContent = `currently in universe 0${uni} · “${UNI_NAMES[uni - 1]}”`;
    try { localStorage.setItem("uni", uni); } catch (e) {}
  };
  const shuffle = () => {
    uni = (uni % UNI_COUNT) + 1;
    applyUni();
    const b = $("#shuffleBtn");
    b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
  };
  applyUni();
  $("#shuffleBtn").addEventListener("click", shuffle);
  $("#shuffleBtn2").addEventListener("click", shuffle);

  /* ---------- Hero ---------- */
  $("#intro").textContent = S.intro || "";
  $("#year").textContent = new Date().getFullYear();
  const WORDS = S.heroWords || ["universe", "workshop", "archive", "playlist", "darkroom", "notebook"];
  let wi = 0;
  const swap = $("#swapWord");
  if (!reduce) setInterval(() => {
    wi = (wi + 1) % WORDS.length;
    swap.textContent = WORDS[wi];
    swap.classList.remove("swap"); void swap.offsetWidth; swap.classList.add("swap");
  }, 2600);
  const badges = S.badges || [];
  $("#heroBadges").innerHTML = badges
    .map((b, i) => {
      const pos = [
        "right:6%;top:16%", "right:16%;bottom:26%", "right:5%;top:40%",
        "left:52%;top:11%", "right:24%;top:24%", "left:62%;bottom:14%",
      ][i % 6];
      return `<li style="${pos};--r:${rand(-5, 5).toFixed(1)}deg;animation-delay:${-i * 1.3}s">${esc(b)}</li>`;
    })
    .join("");
  const tick = (S.ticker || ["software", "design", "film", "music", "photography", "writing"]);
  $("#ticker").innerHTML = (tick.map((t) => `<span>${esc(t)}</span><i>✦</i>`).join("")).repeat(2);

  /* ---------- About ---------- */
  const st = $("#statement");
  st.innerHTML = (S.statement || "").split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  $("#facts").innerHTML = (S.facts || [])
    .map((f) => `<dl class="chip"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></dl>`)
    .join("");

  /* ---------- Work ---------- */
  $("#projects").innerHTML = (S.projects || [])
    .map(
      (p, i) => `<article class="card reveal" data-i="${i}">
        <div class="card__cover"><img src="${esc(p.cover)}" alt="" loading="lazy" /><span class="card__year">${esc(p.year || "")}</span></div>
        <div class="card__body">
          <div class="card__top"><h3>${esc(p.title)}</h3><span class="card__role">${esc(p.role || "")}</span></div>
          <p class="card__summary">${esc(p.summary || "")}</p>
          <div class="card__more"><div>
            <ul class="card__points">${(p.points || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            ${p.link ? `<p style="margin:14px 0 0"><a class="btn btn--line" href="${esc(p.link)}" target="_blank" rel="noopener">View project ↗</a></p>` : ""}
          </div></div>
          <div class="card__foot">
            <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
            <button class="card__toggle" type="button" aria-expanded="false">Details <i>+</i></button>
          </div>
        </div>
      </article>`
    )
    .join("");
  $$(".card").forEach((card) => {
    const btn = $(".card__toggle", card);
    btn.addEventListener("click", () => {
      const open = card.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.firstChild.textContent = open ? "Close " : "Details ";
    });
  });

  $("#experience").innerHTML = (S.experience || [])
    .map((e) => `<li><span>${esc(e.when)}</span><span>${esc(e.role)}</span><span>${esc(e.org)}</span></li>`)
    .join("");
  const resume = $("#resumeLink");
  if (S.links?.resume) resume.href = S.links.resume; else resume.remove();

  /* ---------- Photo board (draggable polaroids) ---------- */
  const photos = S.photos || [];
  const board = $("#board");
  const isBoard = () => innerWidth > 920;
  photos.forEach((p, i) => {
    const f = document.createElement("figure");
    f.className = "polaroid";
    f.dataset.i = i;
    f.innerHTML = `<img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="lazy" draggable="false" />
      <figcaption><span>${esc(p.caption)}</span><span class="d">${esc([p.place, p.date].filter(Boolean).join(" · "))}</span></figcaption>`;
    board.appendChild(f);
  });
  const scatter = () => {
    if (!isBoard()) return;
    const bw = board.clientWidth, bh = board.clientHeight;
    const items = $$(".polaroid", board);
    const cols = Math.ceil(Math.sqrt(items.length * (bw / Math.max(bh, 1))));
    const rows = Math.ceil(items.length / cols);
    const order = items.map((_, i) => i).sort(() => Math.random() - 0.5);
    items.forEach((f, i) => {
      const w = f.offsetWidth || 200, h = f.offsetHeight || 230;
      const cell = order[i], cw = bw / cols, ch = bh / rows;
      const bx = (cell % cols) * cw, by = Math.floor(cell / cols) * ch;
      f.style.left = Math.min(Math.max(bx + rand(-cw * 0.14, cw - w * 0.72), 6), bw - w - 6) + "px";
      f.style.top = Math.min(Math.max(by + rand(-ch * 0.12, ch - h * 0.6), 6), bh - h - 6) + "px";
      f.style.transform = `rotate(${rand(-9, 9).toFixed(1)}deg)`;
      f.style.zIndex = i + 1;
    });
  };
  let zTop = photos.length + 1;
  let dragging = null, moved = false, ox = 0, oy = 0;
  board.addEventListener("pointerdown", (e) => {
    const f = e.target.closest(".polaroid");
    if (!f || !isBoard()) return;
    dragging = f; moved = false;
    const r = f.getBoundingClientRect(), br = board.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    f.dataset.bx = br.left; f.dataset.by = br.top;
    f.classList.add("drag"); f.style.zIndex = ++zTop;
    f.setPointerCapture(e.pointerId);
  });
  board.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = true;
    dragging.style.left = e.clientX - dragging.dataset.bx - ox + "px";
    dragging.style.top = e.clientY - dragging.dataset.by - oy + "px";
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging.classList.remove("drag");
    const f = dragging; dragging = null;
    if (!moved) openPhoto(+f.dataset.i);
  };
  board.addEventListener("pointerup", endDrag);
  board.addEventListener("pointercancel", endDrag);
  board.addEventListener("click", (e) => {
    const f = e.target.closest(".polaroid");
    if (f && !isBoard()) openPhoto(+f.dataset.i);
  });
  $("#scatterBtn").addEventListener("click", scatter);
  addEventListener("load", scatter);
  let wasBoard = isBoard();
  addEventListener("resize", () => { const n = isBoard(); if (n !== wasBoard) { wasBoard = n; if (n) scatter(); } });

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  let cur = 0;
  const showPhoto = (i) => {
    cur = (i + photos.length) % photos.length;
    const p = photos[cur];
    $("img", lb).src = p.src;
    $("img", lb).alt = p.caption;
    $("figcaption", lb).textContent = `${String(cur + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")} — ${p.caption}`;
  };
  const openLayer = (el) => { el.hidden = false; requestAnimationFrame(() => el.classList.add("on")); document.documentElement.style.overflow = "hidden"; };
  const closeLayer = (el) => {
    el.classList.remove("on");
    setTimeout(() => { el.hidden = true; if (el.id === "videoModal") $(".modal__frame", el).innerHTML = ""; }, 320);
    document.documentElement.style.overflow = "";
  };
  const openPhoto = (i) => { showPhoto(i); openLayer(lb); };
  $(".lightbox__nav--prev", lb).addEventListener("click", () => showPhoto(cur - 1));
  $(".lightbox__nav--next", lb).addEventListener("click", () => showPhoto(cur + 1));
  $$("[data-close]").forEach((b) => b.addEventListener("click", () => closeLayer(b.closest("[role=dialog]"))));
  $$("[role=dialog]").forEach((d) => d.addEventListener("click", (e) => e.target === d && closeLayer(d)));
  document.addEventListener("keydown", (e) => {
    if (!lb.hidden) {
      if (e.key === "ArrowLeft") showPhoto(cur - 1);
      if (e.key === "ArrowRight") showPhoto(cur + 1);
    }
    if (e.key === "Escape") $$("[role=dialog]").forEach((d) => !d.hidden && closeLayer(d));
  });

  /* ---------- Vlogs ---------- */
  const embed = (url) => {
    if (!url) return null;
    let m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`;
    m = url.match(/(BV[\w]+)/);
    if (m) return `https://player.bilibili.com/player.html?bvid=${m[1]}&autoplay=1&high_quality=1`;
    return url;
  };
  const vm = $("#videoModal");
  $("#reels").innerHTML = (S.vlogs || [])
    .map(
      (v, i) => `<button class="reel reveal" type="button" data-i="${i}">
        <div class="reel__thumb"><img src="${esc(v.thumb)}" alt="" loading="lazy" /><span class="reel__play" aria-hidden="true"></span>${v.length ? `<span class="reel__len">${esc(v.length)}</span>` : ""}</div>
        <div class="reel__meta"><h3>${esc(v.title)}</h3><span>${esc(v.note || "")}</span></div>
      </button>`
    )
    .join("");
  $$(".reel").forEach((b) =>
    b.addEventListener("click", () => {
      const v = S.vlogs[+b.dataset.i];
      const src = embed(v.url);
      const frame = $(".modal__frame", vm);
      if (!src) frame.innerHTML = `<div><div class="soon">Coming soon</div><p class="mono">${esc(v.title)}</p></div>`;
      else if (/\.(mp4|webm)$/i.test(src)) frame.innerHTML = `<video src="${esc(src)}" controls autoplay playsinline style="width:100%;height:100%"></video>`;
      else frame.innerHTML = `<iframe src="${esc(src)}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="${esc(v.title)}"></iframe>`;
      openLayer(vm);
    })
  );

  /* ---------- Music ---------- */
  const music = S.music || [];
  const audio = $("#audio");
  const record = $("#record"), arm = $("#tonearm"), playBtn = $("#playBtn"), tl = $("#trackLink");
  let track = 0, playing = false;
  const setPlaying = (on) => {
    playing = on;
    record.classList.toggle("playing", on);
    arm.classList.toggle("on", on);
    playBtn.textContent = on ? "Pause" : "Play";
    if (audio.src && on) audio.play().catch(() => {});
    if (!on) audio.pause();
  };
  const loadTrack = (i) => {
    track = i;
    const t = music[i];
    $("#recordCover").src = t.cover;
    $("#trackTitle").textContent = t.title;
    $("#trackArtist").textContent = t.artist;
    $("#trackNote").textContent = t.note || "";
    if (t.link) { tl.href = t.link; tl.style.display = ""; } else tl.style.display = "none";
    audio.pause();
    if (t.audio) audio.src = t.audio; else audio.removeAttribute("src");
    $$(".tracks li").forEach((li, k) => li.classList.toggle("active", k === i));
    if (playing) setPlaying(true);
  };
  $("#tracks").innerHTML = music
    .map((t, i) => `<li><button type="button" data-i="${i}"><span class="i">${String(i + 1).padStart(2, "0")}</span><span class="t">${esc(t.title)}</span><span class="a">${esc(t.artist)}</span></button></li>`)
    .join("");
  $$(".tracks button").forEach((b) => b.addEventListener("click", () => { loadTrack(+b.dataset.i); setPlaying(true); }));
  playBtn.addEventListener("click", () => setPlaying(!playing));
  audio.addEventListener("ended", () => { loadTrack((track + 1) % music.length); setPlaying(true); });
  if (music.length) loadTrack(0);

  /* ---------- Ideal world: plant stars ---------- */
  $("#idealLines").innerHTML = (S.idealWorld || []).map((l) => `<li class="reveal"><span>${esc(l)}</span></li>`).join("");
  const ideal = $("#ideal");
  const sc = $("#starCanvas");
  const sctx = sc.getContext("2d");
  const stars = [];
  const sizeStarCanvas = () => { sc.width = ideal.clientWidth; sc.height = ideal.clientHeight; };
  addEventListener("resize", sizeStarCanvas);
  addEventListener("load", sizeStarCanvas);
  const drawStar = (x, y, r, rot, color, alpha) => {
    sctx.save(); sctx.translate(x, y); sctx.rotate(rot); sctx.globalAlpha = alpha; sctx.fillStyle = color;
    sctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const rr = i % 2 ? r * 0.4 : r;
      const a = (i * Math.PI) / 4;
      sctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
    }
    sctx.closePath(); sctx.fill(); sctx.restore();
  };
  let starAnim = null;
  const renderStars = (t) => {
    sctx.clearRect(0, 0, sc.width, sc.height);
    let alive = false;
    for (const s of stars) {
      const age = (t - s.born) / 1000;
      const pulse = 1 + Math.sin(age * 2.2 + s.ph) * 0.12;
      const a = age < 0.35 ? age / 0.35 : 1;
      if (a < 1 || !reduce) alive = true;
      drawStar(s.x, s.y, s.r * pulse * (age < 0.35 ? 0.6 + 1.1 * a - 0.7 * a * a : 1), s.rot + (reduce ? 0 : age * 0.12), s.c, a * 0.9);
    }
    starAnim = alive && !reduce ? requestAnimationFrame(renderStars) : (reduce ? null : requestAnimationFrame(renderStars));
    if (reduce && !alive) starAnim = null;
  };
  const uniAcc = () => getComputedStyle(document.documentElement).getPropertyValue("--acc").trim() || "#3b3bff";
  ideal.addEventListener("click", (e) => {
    const r = ideal.getBoundingClientRect();
    sizeStarCanvas();
    const colors = [uniAcc(), "#ffd43a", "#171614"];
    for (let i = 0; i < 3; i++) {
      stars.push({
        x: e.clientX - r.left + (i ? rand(-34, 34) : 0),
        y: e.clientY - r.top + (i ? rand(-30, 30) : 0),
        r: i ? rand(5, 10) : rand(12, 19),
        rot: rand(0, Math.PI), ph: rand(0, 6), c: colors[i % 3], born: performance.now(),
      });
    }
    if (stars.length > 140) stars.splice(0, stars.length - 140);
    $("#starCount").textContent = `(${Math.round(stars.length / 3)} planted)`;
    if (starAnim == null) starAnim = requestAnimationFrame(renderStars);
  });

  /* ---------- Writing ---------- */
  const posts = (S.posts || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  $("#posts").innerHTML = posts
    .map(
      (p) => `<li class="post reveal" data-cat="${esc(p.category)}"><a href="post.html?p=${encodeURIComponent(p.slug)}">
        <time datetime="${esc(p.date)}">${fmt(p.date)}</time>
        <div class="body"><h3>${esc(p.title)}</h3><p>${esc(p.excerpt || "")}</p></div>
        <span class="cat">${esc(p.category || "")}</span>
        <span class="arrow" aria-hidden="true">→</span>
      </a></li>`
    )
    .join("");
  const cats = ["All", ...new Set(posts.map((p) => p.category).filter(Boolean))];
  const filters = $("#filters");
  filters.innerHTML = cats.map((c, i) => `<button type="button" class="${i ? "" : "active"}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  $$("button", filters).forEach((b) =>
    b.addEventListener("click", () => {
      $$("button", filters).forEach((x) => x.classList.toggle("active", x === b));
      $$(".post").forEach((p) => p.classList.toggle("hide", b.dataset.c !== "All" && p.dataset.cat !== b.dataset.c));
    })
  );

  /* ---------- Contact ---------- */
  const L = S.links || {};
  const big = $("#emailBig");
  if (L.email) big.href = `mailto:${L.email}`;
  else if (L.linkedin) { big.href = L.linkedin; big.target = "_blank"; big.rel = "noopener"; }
  const names = { email: "Email", github: "GitHub", linkedin: "LinkedIn", resume: "Résumé", instagram: "Instagram", bilibili: "Bilibili", youtube: "YouTube", xiaohongshu: "小红书", spotify: "Spotify" };
  $("#socials").innerHTML = Object.entries(L)
    .filter(([, v]) => v)
    .map(([k, v]) => `<a class="btn btn--line" href="${k === "email" ? "mailto:" + esc(v) : esc(v)}" ${k === "email" ? "" : 'target="_blank" rel="noopener"'}>${names[k] || k} ↗</a>`)
    .join("");

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Scroll effects: statement + portal ---------- */
  const portal = $("#memory"), stage = $(".portal__stage"), ring = $(".portal__ring");
  const words = $$(".w", st);
  let vh = innerHeight, vw = innerWidth;
  addEventListener("resize", () => { vh = innerHeight; vw = innerWidth; });
  const onScroll = () => {
    const r = st.getBoundingClientRect();
    const prog = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
    const n = Math.floor(prog * words.length * 1.05);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
    const dr = portal.getBoundingClientRect();
    const p = clamp(-dr.top / (dr.height - vh));
    const rw = ring.offsetWidth || 300;
    const cover = (Math.hypot(vw, vh) / rw) * 1.15;
    const s = 1 + Math.pow(clamp((p - 0.18) / 0.72), 1.8) * (cover - 1);
    stage.style.setProperty("--p", p.toFixed(4));
    ring.style.setProperty("--p", p.toFixed(4));
    ring.style.setProperty("--s", s.toFixed(4));
  };
  let ticking = false;
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Background blobs (canvas, follows cursor) ---------- */
  const bc = $("#blobs"), bctx = bc.getContext("2d");
  const sizeB = () => { bc.width = innerWidth; bc.height = innerHeight; };
  sizeB(); addEventListener("resize", sizeB);
  let mx = innerWidth * 0.7, my = innerHeight * 0.3, cx = mx, cy = my;
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
  const getTokens = () => {
    const cs = getComputedStyle(document.documentElement);
    return [cs.getPropertyValue("--acc-soft").trim(), cs.getPropertyValue("--acc3").trim(), cs.getPropertyValue("--acc2").trim()];
  };
  const blobDefs = [
    { x: 0.82, y: 0.2, r: 0.34, sp: 0.00022, follow: 0.1 },
    { x: 0.12, y: 0.75, r: 0.3, sp: 0.00017, follow: 0 },
    { x: 0.5, y: 0.45, r: 0.22, sp: 0.00028, follow: 0.05 },
  ];
  const hex2rgb = (h) => {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return [parseInt(h.slice(0, 2), 16) || 230, parseInt(h.slice(2, 4), 16) || 230, parseInt(h.slice(4, 6), 16) || 255];
  };
  const drawBlobs = (t) => {
    bctx.clearRect(0, 0, bc.width, bc.height);
    cx += (mx - cx) * 0.03; cy += (my - cy) * 0.03;
    const cols = getTokens();
    blobDefs.forEach((b, i) => {
      const bx = b.x * bc.width + Math.sin(t * b.sp + i * 2.1) * bc.width * 0.06 + (cx - bc.width / 2) * b.follow;
      const by = b.y * bc.height + Math.cos(t * b.sp * 1.3 + i) * bc.height * 0.07 + (cy - bc.height / 2) * b.follow;
      const r = b.r * Math.min(bc.width, bc.height) * (1 + Math.sin(t * 0.0004 + i) * 0.06);
      const [cr, cg, cbl] = hex2rgb(cols[i % cols.length] || "#e4e4ff");
      const g = bctx.createRadialGradient(bx, by, 0, bx, by, r);
      g.addColorStop(0, `rgba(${cr},${cg},${cbl},0.5)`);
      g.addColorStop(1, `rgba(${cr},${cg},${cbl},0)`);
      bctx.fillStyle = g;
      bctx.beginPath(); bctx.arc(bx, by, r, 0, 7); bctx.fill();
    });
    if (!reduce) requestAnimationFrame(drawBlobs);
  };
  drawBlobs(0);
  if (reduce) { /* one static frame drawn above */ }
})();
