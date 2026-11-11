// Home hero: the running album. Switches designs, plays the song, and eases the spin up and down.
(function () {
  var fig = document.querySelector('.album');
  if (!fig) return;
  var LOOKS = ['sleeve', 'turntable', 'orbit', 'cassette', 'disc'];
  var KEY = 'albumLook';
  var btn = fig.querySelector('.al-play');
  var picks = fig.querySelectorAll('[data-pick]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Design picker: ?look=orbit in the URL wins, then the visitor's last pick, then _data/song.yml.
  function setLook(look, save) {
    if (LOOKS.indexOf(look) < 0) return;
    fig.setAttribute('data-look', look);
    Array.prototype.forEach.call(picks, function (b) { b.setAttribute('aria-checked', String(b.dataset.pick === look)); });
    if (save) { try { localStorage.setItem(KEY, look); } catch (e) {} }
    requestAnimationFrame(function () { rate = -1; ease(); });
  }
  var start = null;
  try { start = new URLSearchParams(location.search).get('look') || localStorage.getItem(KEY); } catch (e) {}
  setLook(LOOKS.indexOf(start) >= 0 ? start : fig.dataset.look, false);
  Array.prototype.forEach.call(picks, function (b) {
    b.addEventListener('click', function () { setLook(b.dataset.pick, true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var i = (LOOKS.indexOf(fig.dataset.look) + d + LOOKS.length) % LOOKS.length;
      setLook(LOOKS[i], true);
      fig.querySelector('[data-pick="' + LOOKS[i] + '"]').focus();
    });
  });

  // Spin: idles slowly, speeds up while the song plays.
  var IDLE = 0.22, rate = IDLE, target = IDLE, raf = 0;
  function spinners() {
    if (!fig.getAnimations) return [];
    return fig.getAnimations({ subtree: true }).filter(function (a) { return /^al-spin/.test(a.animationName || ''); });
  }
  function ease() {
    cancelAnimationFrame(raf);
    if (rate < 0) rate = target;
    (function step() {
      rate += (target - rate) * 0.06;
      if (Math.abs(target - rate) < 0.005) rate = target;
      spinners().forEach(function (a) { a.playbackRate = rate; });
      if (rate !== target) raf = requestAnimationFrame(step);
    })();
  }
  ease();

  // Sound: the audio file from _data/song.yml, or a soft synth loop while that is still a placeholder.
  var audio = null, synth = null, playing = false;
  if (fig.dataset.src) {
    audio = new Audio(fig.dataset.src);
    audio.loop = true;
    audio.preload = 'none';
    audio.addEventListener('error', function () { audio = null; if (playing) { synth = synth || makeSynth(); if (synth) synth.play(); } });
  }
  function makeSynth() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ctx = new AC();
    var out = ctx.createGain(); out.gain.value = 0.0;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    var dly = ctx.createDelay(); dly.delayTime.value = 0.33;
    var fb = ctx.createGain(); fb.gain.value = 0.32;
    lp.connect(out); lp.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(out);
    out.connect(ctx.destination);
    var bpm = 88, eighth = 60 / bpm / 2;
    // Cmaj7, Am7, Fmaj7, G6 as MIDI notes; bass is the first note an octave down.
    var chords = [[48, 64, 67, 71, 72], [45, 64, 67, 69, 72], [41, 64, 65, 69, 72], [43, 62, 67, 71, 74]];
    var order = [1, 2, 3, 4, 2, 3, 1, 3];
    var step = 0, next = 0, timer = 0;
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function note(m, t, len, vol, type) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = hz(m);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, t + len);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t + len + 0.05);
    }
    function schedule() {
      while (next < ctx.currentTime + 0.25) {
        var c = chords[Math.floor(step / 8) % 4], i = step % 8;
        note(c[order[i]], next, eighth * 3, 0.09, 'triangle');
        if (i === 0) { note(c[0] - 12, next, eighth * 7, 0.16, 'sine'); note(c[0], next, eighth * 7, 0.05, 'sine'); }
        if (i === 4) note(c[0] - 12, next, eighth * 3, 0.1, 'sine');
        next += eighth; step++;
      }
    }
    return {
      play: function () {
        ctx.resume();
        next = Math.max(next, ctx.currentTime + 0.05);
        out.gain.cancelScheduledValues(ctx.currentTime);
        out.gain.setTargetAtTime(0.9, ctx.currentTime, 0.3);
        clearInterval(timer); timer = setInterval(schedule, 80); schedule();
      },
      pause: function () {
        out.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        clearInterval(timer);
        setTimeout(function () { if (!playing) ctx.suspend(); }, 600);
      }
    };
  }
  function setPlaying(on) {
    playing = on;
    fig.classList.toggle('is-playing', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^(Play|Pause)/, on ? 'Pause' : 'Play'));
    target = on ? 1 : IDLE;
    if (!reduce) ease();
  }
  btn.addEventListener('click', function () {
    if (!playing) {
      setPlaying(true);
      if (audio) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () { if (audio && audio.error) return; setPlaying(false); });
      } else {
        synth = synth || makeSynth();
        if (synth) synth.play(); else setPlaying(false);
      }
    } else {
      setPlaying(false);
      if (audio) audio.pause();
      if (synth) synth.pause();
    }
  });
})();
