// Home hero: the one-line "now playing" song row. Plays the song through Spotify's iFrame API,
// starts it on the visitor's first click or tap (browsers block sound before that), and switches row styles.
(function () {
  var np = document.querySelector('.np');
  if (!np) return;
  var STYLES = ['eq', 'ticker', 'type', 'wave', 'line'];
  var KEY = 'npStyle';
  var row = np.querySelector('.np-row');
  var picks = document.querySelectorAll('.np-picker [data-pick]');

  // Wave style moves letter by letter, so wrap each visible letter once (screen readers use the button label).
  Array.prototype.forEach.call(np.querySelectorAll('.np-run:not(.np-dup) .np-title, .np-run:not(.np-dup) .np-artist'), function (el, k) {
    var text = el.textContent, off = k ? 18 : 0;
    el.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.className = 'np-ch'; s.textContent = text[i]; s.style.setProperty('--i', i + off);
      el.appendChild(s);
    }
  });

  // Style picker: ?line=wave in the URL wins, then the visitor's last pick, then _data/song.yml.
  function setStyle(st, save) {
    if (STYLES.indexOf(st) < 0) return;
    np.setAttribute('data-style', st);
    Array.prototype.forEach.call(picks, function (b) { b.setAttribute('aria-checked', String(b.dataset.pick === st)); });
    if (save) { try { localStorage.setItem(KEY, st); } catch (e) {} }
  }
  var first = null;
  try { first = new URLSearchParams(location.search).get('line') || localStorage.getItem(KEY); } catch (e) {}
  setStyle(STYLES.indexOf(first) >= 0 ? first : np.dataset.style, false);
  Array.prototype.forEach.call(picks, function (b) {
    b.addEventListener('click', function () { setStyle(b.dataset.pick, true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var i = (STYLES.indexOf(np.dataset.style) + d + STYLES.length) % STYLES.length;
      setStyle(STYLES[i], true);
      document.querySelector('.np-picker [data-pick="' + STYLES[i] + '"]').focus();
    });
  });

  // Fallback sound: an own audio file from _data/song.yml, else a soft synth loop. Used only without Spotify.
  var audio = null, synth = null, playing = false;
  if (np.dataset.src) {
    audio = new Audio(np.dataset.src);
    audio.loop = true;
    audio.preload = 'none';
    audio.addEventListener('timeupdate', function () { if (audio.duration) progress(audio.currentTime / audio.duration); });
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
  function playOwn() {
    if (audio) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { setPlaying(false); });
    } else {
      synth = synth || makeSynth();
      if (synth) synth.play(); else setPlaying(false);
    }
  }
  function pauseOwn() { if (audio) audio.pause(); if (synth) synth.pause(); }
  function progress(f) { np.style.setProperty('--p', Math.max(0, Math.min(1, f)).toFixed(4)); }
  function setPlaying(on) {
    playing = on;
    np.classList.toggle('is-playing', on);
    if (on) np.classList.add('is-on');
    row.setAttribute('aria-pressed', String(on));
    row.setAttribute('aria-label', row.getAttribute('aria-label').replace(/^(Play|Pause)/, on ? 'Pause' : 'Play'));
  }

  // Spotify: the iFrame API embed plays the track (full song for visitors logged into Spotify,
  // a 30s preview otherwise). Its playback events drive the row, so its own controls stay in sync.
  var spotify = null, wanted = false, heard = false;
  var spotifyUri = (function (s) {
    var m = s.match(/(track|album|playlist)[\/:]([A-Za-z0-9]{22})/);
    return m ? 'spotify:' + m[1] + ':' + m[2] : '';
  })(np.dataset.spotify || '');
  if (spotifyUri) {
    window.onSpotifyIframeApiReady = function (IFrameAPI) {
      var el = document.getElementById('np-spotify');
      if (!el) return;
      IFrameAPI.createController(el, { uri: spotifyUri, width: '100%', height: 80 }, function (c) {
        spotify = c;
        np.classList.add('has-player');
        c.addListener('playback_update', function (e) {
          var d = e.data || {}, paused = d.isPaused !== false;
          if (d.duration) progress(d.position / d.duration);
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

  function startSong() {
    wanted = true;
    setPlaying(true);
    if (!spotifyUri) { playOwn(); return; }
    heard = false;
    if (spotify) spotify.play();
    // If Spotify never reports playing (the browser blocked it), flip the row back to Play.
    setTimeout(function () { if (spotifyUri && wanted && !heard) { wanted = false; setPlaying(false); } }, 6000);
  }
  function stopSong() {
    wanted = false;
    setPlaying(false);
    if (spotify) spotify.pause(); else pauseOwn();
  }
  row.addEventListener('click', function () { if (playing) stopSong(); else startSong(); });

  // Browsers don't allow sound before the visitor interacts, so the song starts on their first
  // click, tap, Enter or Space anywhere on the page (the row and the picker handle their own clicks).
  var started = false;
  function firstGesture(e) {
    if (started) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    started = true;
    document.removeEventListener('pointerdown', firstGesture, true);
    document.removeEventListener('keydown', firstGesture, true);
    if (e.target.closest && e.target.closest('.np-row, .np-picker')) return;
    if (!playing) startSong();
  }
  document.addEventListener('pointerdown', firstGesture, true);
  document.addEventListener('keydown', firstGesture, true);
})();
