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
  function playOwn() {
    if (audio) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { if (audio && audio.error) return; setPlaying(false); });
    } else {
      synth = synth || makeSynth();
      if (synth) synth.play(); else setPlaying(false);
    }
  }
  function pauseOwn() { if (audio) audio.pause(); if (synth) synth.pause(); }

  // Spotify: the iFrame API embed plays the track (full song when the visitor is logged into Spotify,
  // a 30s preview otherwise). Its playback events drive the album, so its own controls stay in sync.
  var spotify = null, spotifyUri = toUri(fig.dataset.spotify || '');
  function toUri(s) {
    var m = s.match(/(track|album|playlist)[\/:]([A-Za-z0-9]{22})/);
    return m ? 'spotify:' + m[1] + ':' + m[2] : '';
  }
  if (spotifyUri) {
    window.onSpotifyIframeApiReady = function (IFrameAPI) {
      var el = document.getElementById('al-spotify-embed');
      if (!el) return;
      IFrameAPI.createController(el, { uri: spotifyUri, width: '100%', height: 80 }, function (c) {
        spotify = c;
        c.addListener('playback_update', function (e) {
          var paused = !e.data || e.data.isPaused;
          if (!paused) heard = true;
          if (paused === playing) setPlaying(!paused);
        });
        if (wanted) c.play();
      });
    };
    var tag = document.createElement('script');
    tag.src = 'https://open.spotify.com/embed/iframe-api/v1';
    tag.async = true;
    tag.onerror = function () { spotifyUri = ''; if (wanted) playOwn(); }; // blocked or offline: fall back
    document.head.appendChild(tag);
  }

  var wanted = false, heard = false;
  function startSong() {
    wanted = true;
    if (spotifyUri) {
      setPlaying(true); heard = false;
      if (spotify) spotify.play();
      // If Spotify never reports playing (the browser blocked it), stop the spin so the button reads Play again.
      setTimeout(function () { if (spotifyUri && wanted && !heard) { wanted = false; setPlaying(false); } }, 6000);
      return;
    }
    setPlaying(true); playOwn();
  }
  function stopSong() {
    wanted = false;
    setPlaying(false);
    if (spotify) spotify.pause(); else pauseOwn();
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (playing) stopSong(); else startSong();
  });

  // Browsers don't allow sound before the visitor interacts, so the song starts on their first
  // click, tap, Enter or Space anywhere on the page (unless that was the play button itself).
  var started = false;
  function firstGesture(e) {
    if (started) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    started = true;
    off();
    if (e.target.closest && e.target.closest('.al-play, .al-picker')) return;
    if (!playing) startSong();
  }
  function off() {
    document.removeEventListener('pointerdown', firstGesture, true);
    document.removeEventListener('keydown', firstGesture, true);
  }
  document.addEventListener('pointerdown', firstGesture, true);
  document.addEventListener('keydown', firstGesture, true);
})();
