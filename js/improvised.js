/* Casual Loopers session log: audio player and lineup filter.
   To add a take: put the audio file in /audio and add a line to LOG (newest first),
   then add a matching row on improvised.html. */
(function () {
  var LOG = [
  {
    "id": "2026-10-11-steadfast-february",
    "date": "2026-10-11",
    "name": "Steadfast February",
    "lineup": "Duo",
    "bass": false,
    "src": "/audio/2026-10-11-steadfast-february.m4a",
    "dur": 580.2
  },
  {
    "id": "2026-10-04-alive-chain",
    "date": "2026-10-04",
    "name": "Alive Chain",
    "lineup": "Duo",
    "bass": false,
    "src": "/audio/2026-10-04-alive-chain.m4a",
    "dur": 828.0
  },
  {
    "id": "2026-09-27-clever-tortoise",
    "date": "2026-09-27",
    "name": "Clever Tortoise",
    "lineup": "Duo",
    "bass": false,
    "src": "/audio/2026-09-27-clever-tortoise.m4a",
    "dur": 713.0
  },
  {
    "id": "2026-09-27-chivalrous-stinger",
    "date": "2026-09-27",
    "name": "Chivalrous Stinger",
    "lineup": "Duo",
    "bass": false,
    "src": "/audio/2026-09-27-chivalrous-stinger.m4a",
    "dur": 642.3
  },
  {
    "id": "2026-09-20-rare-walk",
    "date": "2026-09-20",
    "name": "Rare Walk",
    "lineup": "Duo",
    "bass": false,
    "src": "/audio/2026-09-20-rare-walk.m4a",
    "dur": 646.5
  },
  {
    "id": "2026-09-06-handsomely",
    "date": "2026-09-06",
    "name": "Handsomely",
    "lineup": "Duo",
    "bass": false,
    "src": "/audio/2026-09-06-handsomely.m4a",
    "dur": 800.6
  }
];
  var rows = Array.prototype.slice.call(document.querySelectorAll('.bb-arow'));
  if (!rows.length) return;
  var a = new Audio(); a.preload = 'none';
  var cur = -1, err = false;
  var PLAY = '<svg width="14" height="16" viewBox="0 0 18 20" aria-hidden="true"><path d="M3 1.5v17l14-8.5z" fill="#F2EDE0"></path></svg>';
  var PAUSE = '<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><rect x="1" y="1" width="4" height="14" fill="#F2EDE0"></rect><rect x="9" y="1" width="4" height="14" fill="#F2EDE0"></rect></svg>';
  function fmt(x) { x = Math.max(0, Math.floor(x || 0)); var m = Math.floor(x / 60), r = x % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function paint() {
    rows.forEach(function (row, i) {
      var x = LOG[i], on = i === cur, playing = on && !a.paused;
      var d = on && a.duration && isFinite(a.duration) ? a.duration : x.dur;
      var frac = on ? Math.min(1, (a.currentTime || 0) / d) : 0;
      row.classList.toggle('bb-on', on);
      var b = row.querySelector('.bb-apl');
      b.innerHTML = playing ? PAUSE : PLAY;
      b.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + x.name);
      row.querySelector('.bb-atime').textContent = on ? (err ? 'Can\u2019t play' : fmt(a.currentTime) + ' / ' + fmt(d)) : fmt(x.dur);
      var bars = row.querySelectorAll('.bb-bars span'), n = bars.length;
      for (var k = 0; k < n; k++) bars[k].style.background = on ? ((k + 0.5) / n <= frac ? '#F2EDE0' : '#5A5855') : '#4A4844';
      var seek = row.querySelector('.bb-seek');
      if (document.activeElement !== seek) seek.value = Math.round(frac * 1000);
    });
  }
  function load(i) { cur = i; err = false; a.src = LOG[i].src; }
  ['timeupdate', 'play', 'pause', 'ended', 'loadedmetadata'].forEach(function (ev) { a.addEventListener(ev, paint); });
  a.addEventListener('error', function () { if (cur >= 0) { err = true; paint(); } });
  a.addEventListener('playing', function () { err = false; });
  rows.forEach(function (row, i) {
    row.querySelector('.bb-apl').addEventListener('click', function () {
      if (cur !== i) { load(i); a.play().catch(function () {}); }
      else if (a.paused) { a.play().catch(function () {}); } else { a.pause(); }
      paint();
    });
    row.querySelector('.bb-seek').addEventListener('change', function (e) {
      var frac = Number(e.target.value) / 1000;
      if (cur !== i) {
        load(i);
        var go = function () { a.removeEventListener('loadedmetadata', go); a.currentTime = frac * (a.duration || LOG[i].dur); a.play().catch(function () {}); };
        a.addEventListener('loadedmetadata', go); a.load();
      } else { a.currentTime = frac * (a.duration || LOG[i].dur); }
      paint();
    });
  });
  // lineup filter
  var group = document.querySelector('[aria-label="Filter by lineup"]');
  var empty = document.querySelector('[data-log-empty]');
  if (group) {
    var keys = ['all', 'duo', 'bass'];
    var btns = Array.prototype.slice.call(group.querySelectorAll('button'));
    btns.forEach(function (btn, bi) {
      btn.addEventListener('click', function () {
        var f = keys[bi], shown = 0;
        btns.forEach(function (o, oi) {
          var on = oi === bi;
          o.setAttribute('aria-pressed', on ? 'true' : 'false');
          o.style.background = on ? '#F2EDE0' : 'transparent';
          o.style.color = on ? '#0B0B0B' : '#F2EDE0';
          o.style.borderColor = on ? '#F2EDE0' : '#4A4844';
        });
        rows.forEach(function (row, i) {
          var vis = f === 'all' || (f === 'bass' ? LOG[i].bass : !LOG[i].bass);
          row.style.display = vis ? '' : 'none'; if (vis) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }
})();
