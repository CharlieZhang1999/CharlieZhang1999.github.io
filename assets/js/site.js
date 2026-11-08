// Filters, "expand all", smooth open/close for the timeline, and the project gallery dialogs.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Animate <details> open and close so content slides instead of jumping.
  document.querySelectorAll('details').forEach(function (d) {
    var summary = d.querySelector('summary');
    var body = d.querySelector('.reveal');
    if (!summary || !body || reduce || !body.animate) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      if (d.open) {
        var h = body.offsetHeight;
        var a = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 220, easing: 'ease-in' });
        body.style.overflow = 'hidden';
        a.onfinish = function () { d.open = false; body.style.overflow = ''; delete d.dataset.busy; };
      } else {
        d.open = true;
        var full = body.offsetHeight;
        body.style.overflow = 'hidden';
        var b = body.animate([{ height: '0px', opacity: 0 }, { height: full + 'px', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
        b.onfinish = function () { body.style.overflow = ''; delete d.dataset.busy; };
      }
    });
  });

  // Filter chips: kind for the timeline, technology for project cards.
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var type = group.getAttribute('data-filter-group');
    var scope = group.closest('.sheet') || document;
    var list = scope.querySelector('[data-filter-list]');
    var empty = scope.querySelector('.empty');
    if (!list) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      var v = btn.getAttribute('data-value');
      var shown = 0;
      Array.prototype.forEach.call(list.children, function (item) {
        var match = !v || (type === 'kind'
          ? item.getAttribute('data-kind') === v
          : (item.getAttribute('data-tags') || '').split('|').indexOf(v) !== -1);
        item.classList.toggle('is-hidden', !match);
        if (match) {
          shown++;
          if (!reduce && item.animate) item.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: shown * 40, easing: 'ease-out', fill: 'backwards' });
        }
      });
      if (empty) empty.hidden = shown > 0;
    });
  });

  // Project gallery: open a project's details in a dialog; click outside to close.
  document.querySelectorAll('[data-dialog]').forEach(function (btn) {
    var dlg = document.getElementById(btn.getAttribute('data-dialog'));
    if (!dlg || !dlg.showModal) return;
    btn.addEventListener('click', function () { dlg.showModal(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { btn.focus(); });
  });

  // Expand or collapse every role at once.
  document.querySelectorAll('[data-expand-all]').forEach(function (btn) {
    var all = document.querySelectorAll('.timeline details');
    btn.addEventListener('click', function () {
      var open = btn.textContent.trim() === 'Expand all';
      all.forEach(function (d) { d.open = open; });
      btn.textContent = open ? 'Collapse all' : 'Expand all';
    });
  });
})();
