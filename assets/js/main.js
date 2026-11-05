/* Charlie Zhang — site behaviour. Content lives in content/site.js */
(() => {
  const S = window.SITE || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (tag, attrs = {}, html = "") => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v);
    }
    if (html) el.innerHTML = html;
    return el;
  };
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  /* ---------- Hero ---------- */
  $("#portrait").src = S.portrait || "";
  $("#portraitCaption").textContent = S.portraitCaption || "";
  $("#intro").textContent = S.intro || "";
  $("#year").textContent = new Date().getFullYear();

  const clock = $("#clock");
  const tick = () => {
    const d = new Date();
    clock.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · local";
  };
  tick();
  setInterval(tick, 30000);

  /* ---------- About ---------- */
  const st = $("#statement");
  st.innerHTML = (S.statement || "").split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  $("#facts").innerHTML = (S.facts || [])
    .map((f) => `<div><dt class="mono">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
    .join("");

  /* ---------- Work ---------- */
  const projects = $("#projects");
  (S.projects || []).forEach((p, i) => {
    const li = h("li", { class: "project" });
    li.innerHTML = `
      <button class="project__row" type="button" aria-expanded="false">
        <span class="project__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="project__title">${esc(p.title)}</span>
        <span class="project__role">${esc(p.role || "")}</span>
        <span class="project__year">${esc(p.year || "")}</span>
        <span class="project__plus" aria-hidden="true"></span>
      </button>
      <div class="project__body"><div class="project__inner"><div class="project__grid">
        ${p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy" />` : ""}
        <div class="project__text">
          <p class="project__summary">${esc(p.summary || "")}</p>
          <ul class="project__points">${(p.points || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          ${p.link ? `<a class="pill" href="${esc(p.link)}" target="_blank" rel="noopener">View project ↗</a>` : ""}
        </div>
      </div></div></div>`;
    const btn = $(".project__row", li);
    btn.addEventListener("click", () => {
      const open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    li.dataset.cover = p.cover || "";
    projects.appendChild(li);
  });

  // Floating preview following the cursor over project rows
  const preview = $(".preview");
  const pimg = $("img", preview);
  let px = 0, py = 0, tx = 0, ty = 0;
  $$(".project").forEach((li) => {
    li.addEventListener("mouseenter", () => {
      if (li.classList.contains("open") || !li.dataset.cover) return;
      pimg.src = li.dataset.cover;
      preview.classList.add("on");
    });
    li.addEventListener("mouseleave", () => preview.classList.remove("on"));
    li.addEventListener("click", () => preview.classList.remove("on"));
  });

  $("#experience").innerHTML = (S.experience || [])
    .map((e) => `<li><span>${esc(e.when)}</span><span>${esc(e.role)}</span><span>${esc(e.org)}</span></li>`)
    .join("");
  const resume = $("#resumeLink");
  if (S.links?.resume) resume.href = S.links.resume; else resume.remove();

  /* ---------- Photos + lightbox ---------- */
  const photos = S.photos || [];
  $("#gallery").innerHTML = photos
    .map(
      (p, i) => `<figure class="shot reveal" data-i="${i}" tabindex="0" role="button" aria-label="Open photo: ${esc(p.caption)}">
        <div class="shot__img"><img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="lazy" data-speed="${(i % 3) * 0.04 + 0.03}" /></div>
        <figcaption><span>${esc(p.caption)}</span><span>${esc([p.place, p.date].filter(Boolean).join(" · "))}</span></figcaption>
      </figure>`
    )
    .join("");
  const lb = $("#lightbox");
  let cur = 0;
  const showPhoto = (i) => {
    cur = (i + photos.length) % photos.length;
    const p = photos[cur];
    $("img", lb).src = p.src;
    $("img", lb).alt = p.caption;
    $("figcaption", lb).textContent = `${String(cur + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")} — ${p.caption}`;
  };
  const openLayer = (el) => {
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("on"));
    document.documentElement.style.overflow = "hidden";
  };
  const closeLayer = (el) => {
    el.classList.remove("on");
    setTimeout(() => {
      el.hidden = true;
      if (el.id === "videoModal") $(".modal__frame", el).innerHTML = "";
    }, 350);
    document.documentElement.style.overflow = "";
  };
  $$(".shot").forEach((f) => {
    const go = () => { showPhoto(+f.dataset.i); openLayer(lb); };
    f.addEventListener("click", go);
    f.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
  });
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
    if (/\.(mp4|webm)$/i.test(url)) return url;
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

  /* ---------- Ideal world ---------- */
  $("#idealLines").innerHTML = (S.idealWorld || []).map((l) => `<li class="reveal"><span>${esc(l)}</span></li>`).join("");

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
    .map(([k, v]) => `<a class="pill" href="${k === "email" ? "mailto:" + esc(v) : esc(v)}" ${k === "email" ? "" : 'target="_blank" rel="noopener"'}>${names[k] || k} <span>↗</span></a>`)
    .join("");

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Scroll-driven effects ---------- */
  const door = $("#door"), stage = $(".door__stage"), frame = $(".door__frame");
  const words = $$(".w", st);
  const portrait = $("#portrait");
  const glow = $(".hero__glow");
  const parallax = $$("[data-speed]");
  let vh = innerHeight, vw = innerWidth;
  addEventListener("resize", () => { vh = innerHeight; vw = innerWidth; });

  const onScroll = () => {
    const y = scrollY;
    // Hero parallax
    if (y < vh * 1.2) {
      portrait.style.transform = `translateY(${-y * 0.08}px)`;
    }
    // Statement words light up
    const r = st.getBoundingClientRect();
    const prog = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
    const n = Math.floor(prog * words.length * 1.05);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
    // Door
    const dr = door.getBoundingClientRect();
    const p = clamp(-dr.top / (dr.height - vh));
    const io2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const o = io2(clamp((p - 0.04) / 0.4));
    const fw = frame.offsetWidth, fh = frame.offsetHeight;
    const cover = Math.max(vw / fw, vh / fh) * 2.4;
    const s = 1 + Math.pow(clamp((p - 0.4) / 0.5), 2.2) * (cover - 1);
    stage.style.setProperty("--p", p.toFixed(4));
    frame.style.setProperty("--o", o.toFixed(4));
    frame.style.setProperty("--s", s.toFixed(4));
    // Gentle parallax on photos
    parallax.forEach((img) => {
      const b = img.parentElement.getBoundingClientRect();
      if (b.bottom < 0 || b.top > vh) return;
      const c = (b.top + b.height / 2 - vh / 2) / vh;
      img.style.transform = `translateY(${c * -100 * img.dataset.speed}%) scale(1.12)`;
    });
  };
  let ticking = false;
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Cursor + hero glow ---------- */
  const cursor = $(".cursor");
  let cx = vw / 2, cy = vh / 2, mx = cx, my = cy;
  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    tx = e.clientX + 24; ty = e.clientY - 120;
    if (scrollY < vh) glow.style.transform = `translate(${(e.clientX / vw - 0.5) * 80}px, ${(e.clientY / vh - 0.5) * 80}px)`;
  });
  document.addEventListener("mouseover", (e) => {
    cursor.classList.toggle("is-hover", !!e.target.closest("a, button, .shot, [role=button]"));
  });
  const loop = () => {
    cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    px += (tx - px) * 0.12; py += (ty - py) * 0.12;
    preview.style.transform = `translate(${px}px, ${py}px) rotate(${(tx - px) * 0.03}deg)`;
    requestAnimationFrame(loop);
  };
  if (!reduce) loop();

  /* ---------- Intro ---------- */
  const done = () => {
    document.body.classList.remove("is-loading");
    setTimeout(() => {
      document.body.classList.add("ready");
      $$(".hero .reveal").forEach((el) => el.classList.add("in"));
    }, reduce ? 0 : 450);
  };
  const wait = reduce ? 0 : 1300;
  const start = performance.now();
  const fin = () => setTimeout(done, Math.max(0, wait - (performance.now() - start)));
  if (document.readyState === "complete") fin(); else addEventListener("load", fin);
  setTimeout(done, 3500); // never block on slow assets
})();
