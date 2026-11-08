// Underline tabs, filters, expand-all, smooth <details>, and the projects reel with its segmented map.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // Smooth open/close for <details> that have a .reveal body.
  each(document.querySelectorAll('details'), function (d) {
    var summary = d.querySelector('summary');
    var body = d.querySelector('.reveal');
    if (!summary || !body || reduce || !body.animate) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      body.style.overflow = 'hidden';
      if (d.open) {
        var a = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 220, easing: 'ease-in' });
        a.onfinish = function () { d.open = false; body.style.overflow = ''; delete d.dataset.busy; };
      } else {
        d.open = true;
        var b = body.animate([{ height: '0px', opacity: 0 }, { height: body.offsetHeight + 'px', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
        b.onfinish = function () { body.style.overflow = ''; delete d.dataset.busy; };
      }
    });
  });

  // Underline tabs: slide the line under the pressed tab.
  function moveLine(group) {
    var line = group.querySelector('.utabs-line');
    var on = group.querySelector('[aria-pressed="true"]');
    if (!line || !on) return;
    line.style.width = on.offsetWidth + 'px';
    line.style.transform = 'translate(' + on.offsetLeft + 'px,' + (on.offsetTop + on.offsetHeight - 2) + 'px)';
  }
  function allLines() { each(document.querySelectorAll('.utabs'), moveLine); }
  window.addEventListener('resize', allLines);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(allLines);
  allLines();

  // Projects reel with segmented map. Map and reel stay in sync in both directions.
  var reels = [];
  each(document.querySelectorAll('[data-reel]'), function (block) {
    var reel = block.querySelector('.reel');
    var slides = Array.prototype.slice.call(block.querySelectorAll('.slide'));
    var segs = Array.prototype.slice.call(block.querySelectorAll('.seg'));
    var details = block.querySelectorAll('.rd');
    var label = block.querySelector('.seg-label');
    var count = block.querySelector('.reel-count');
    var prev = block.querySelector('[data-step="-1"]');
    var next = block.querySelector('[data-step="1"]');
    var cur = 0, lock = 0, timer;
    var visible = function () { return slides.filter(function (s) { return !s.classList.contains('is-hidden'); }); };
    var offset = function (s) { return reel.scrollLeft + s.getBoundingClientRect().left - reel.getBoundingClientRect().left; };

    function mark() {
      var vis = visible();
      var pos = vis.indexOf(slides[cur]);
      slides.forEach(function (s, i) { s.classList.toggle('is-on', i === cur); });
      segs.forEach(function (g, i) {
        var vi = vis.indexOf(slides[i]);
        g.classList.toggle('is-on', i === cur);
        g.classList.toggle('is-done', vi > -1 && vi < pos);
        if (i === cur) g.setAttribute('aria-current', 'step'); else g.removeAttribute('aria-current');
      });
      each(details, function (d) { d.hidden = +d.dataset.i !== cur; });
      if (label) {
        var n = segs[cur];
        label.innerHTML = '<strong></strong>';
        label.firstChild.textContent = n.querySelector('.seg-name').textContent;
        label.appendChild(document.createTextNode(n.querySelector('.seg-date').textContent));
      }
      if (count) count.innerHTML = '<strong>' + (pos + 1) + '</strong> / ' + vis.length;
      if (prev) prev.disabled = pos <= 0;
      if (next) next.disabled = pos >= vis.length - 1;
    }
    function go(i, instant) {
      cur = i;
      lock = Date.now();
      reel.scrollTo({ left: offset(slides[i]), behavior: instant || reduce ? 'auto' : 'smooth' });
      mark();
    }
    function step(d) {
      var vis = visible(), pos = vis.indexOf(slides[cur]) + d;
      if (vis[pos]) go(slides.indexOf(vis[pos]));
    }
    segs.forEach(function (g, i) { g.addEventListener('click', function () { go(i); }); });
    slides.forEach(function (s, i) { s.querySelector('.slide-pic').addEventListener('click', function () { go(i); }); });
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    reel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    reel.addEventListener('scroll', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (Date.now() - lock < 800) return;
        var vis = visible(), best = vis[0], bd = Infinity;
        vis.forEach(function (s) { var d = Math.abs(offset(s) - reel.scrollLeft); if (d < bd) { bd = d; best = s; } });
        if (reel.scrollLeft + reel.clientWidth >= reel.scrollWidth - 4) best = vis[vis.length - 1];
        var i = slides.indexOf(best);
        if (best && i !== cur) { cur = i; mark(); }
      }, 90);
    });
    reels.push({ block: block, slides: slides, segs: segs, go: go, visible: visible });
    mark();
  });

  // Filters (experience type or project technology), driven by underline tabs.
  each(document.querySelectorAll('[data-filter-group]'), function (group) {
    var type = group.getAttribute('data-filter-group');
    var scope = group.closest('.sheet') || document;
    var list = scope.querySelector('[data-filter-list]');
    var empty = scope.querySelector('.empty');
    if (!list) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      each(group.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      moveLine(group);
      var v = btn.getAttribute('data-value');
      var matches = function (el) {
        if (!v) return true;
        return type === 'kind' ? el.getAttribute('data-kind') === v
          : (el.getAttribute('data-tags') || '').split('|').indexOf(v) !== -1;
      };
      var shown = 0;
      each(list.children, function (item) {
        var ok = matches(item);
        item.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      reels.forEach(function (r) {
        if (!r.block.contains(list)) return;
        r.segs.forEach(function (g) { g.classList.toggle('is-hidden', !matches(g)); });
        r.block.querySelector('.segmap').style.setProperty('--n', shown || 1);
        var first = r.visible()[0];
        if (first) r.go(r.slides.indexOf(first), true);
      });
    });
  });

  // Expand or collapse every role at once.
  each(document.querySelectorAll('[data-expand-all]'), function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.textContent.trim() === 'Expand all';
      each(document.querySelectorAll('.chron details'), function (d) { d.open = open; });
      btn.textContent = open ? 'Collapse all' : 'Expand all';
    });
  });
})();
