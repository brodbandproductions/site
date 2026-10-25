/* brodband productions: shared page behaviour */
// Always open a page at the top on load or reload (links to a #section still jump there)
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
if (!location.hash) { window.scrollTo(0, 0); }
(function () {
  // Mobile menu
  var btn = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('bb-mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.hasAttribute('hidden');
      if (open) { menu.removeAttribute('hidden'); } else { menu.setAttribute('hidden', ''); }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Back to top: fades in near the bottom of the page
  var top = document.querySelector('.bb-top');
  if (top) {
    var check = function () {
      var de = document.documentElement, y = window.scrollY || de.scrollTop || 0;
      var near = y > 200 && (y + window.innerHeight) >= (de.scrollHeight - 320);
      top.classList.toggle('bb-top-on', near);
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  }

  // Click-to-play YouTube: video thumbnails become an embedded player in place
  function ytId(href) {
    var m = /youtu\.be\/([\w-]{11})/.exec(href) || /[?&]v=([\w-]{11})/.exec(href);
    return m ? m[1] : null;
  }
  var thumbSel = '.bb-fimg, .bb-lthumb, [style*="aspect-ratio: 16 / 9"]';
  Array.prototype.forEach.call(document.querySelectorAll('a[href*="youtu"]'), function (a) {
    var id = ytId(a.getAttribute('href'));
    var thumb = a.querySelector(thumbSel);
    if (!id || !thumb) return;
    a.setAttribute('data-yt', id);
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab clicks through
      e.preventDefault();
      var box = document.createElement('div');
      box.className = a.className;
      while (a.firstChild) box.appendChild(a.firstChild);
      a.parentNode.replaceChild(box, a);
      var t = box.querySelector(thumbSel);
      var wrap = document.createElement('div');
      wrap.className = 'bb-yt';
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = a.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.setAttribute('allowfullscreen', '');
      wrap.appendChild(f);
      t.parentNode.replaceChild(wrap, t);
    });
  });
})();

/* Zoom: click an engraved image (opening plates, Formulated banner and cards) to view it large; click again to return */
(function () {
  var imgs = document.querySelectorAll('.bb-plate > div, .bb-c2img');
  if (!imgs.length) return;
  var css = document.createElement('style');
  css.textContent =
    '.bb-zoomable{cursor:zoom-in;transition:box-shadow .25s,border-color .25s}' +
    '.bb-plate:has(.bb-zoomable){transition:border-color .25s,box-shadow .25s}' +
    '.bb-plate:has(.bb-zoomable:hover),.bb-plate:has(.bb-zoomable:focus-visible){border-color:#E9D3A0;box-shadow:0 0 22px rgba(242,222,170,0.25)}' +
    '.bb-c2img.bb-zoomable:hover,.bb-c2img.bb-zoomable:focus-visible{border-color:#E9D3A0;box-shadow:0 0 18px rgba(242,222,170,0.25)}' +
    '.bb-zoomable:focus-visible{outline:2px solid #E9D3A0;outline-offset:3px}' +
    '.bb-zoom{position:fixed;inset:0;z-index:100;background:rgba(11,11,11,0.94);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;cursor:zoom-out;opacity:0;transition:opacity .25s}' +
    '.bb-zoom.bb-zoom-on{opacity:1}' +
    '.bb-zoom img{max-width:100%;max-height:100%;width:auto;height:auto;border:1.5px solid #F2EDE0;padding:8px;background:#0B0B0B;box-sizing:border-box;transform:scale(.96);transition:transform .25s}' +
    '.bb-zoom.bb-zoom-on img{transform:scale(1)}' +
    '@media (prefers-reduced-motion:reduce){.bb-zoom,.bb-zoom img{transition:none}}';
  document.head.appendChild(css);

  var box = null, last = null;
  function close() {
    if (!box) return;
    var b = box; box = null;
    b.classList.remove('bb-zoom-on');
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 250);
    document.removeEventListener('keydown', onKey);
    if (last) last.focus({ preventScroll: true });
  }
  function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); } }
  function open(el) {
    var m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(el).backgroundImage || '');
    if (!m) return;
    last = el;
    box = document.createElement('div');
    box.className = 'bb-zoom';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Enlarged image. Click or press Escape to close.');
    box.tabIndex = -1;
    var img = document.createElement('img');
    img.src = m[1];
    img.alt = el.getAttribute('aria-label') || '';
    box.appendChild(img);
    box.addEventListener('click', close);
    document.body.appendChild(box);
    requestAnimationFrame(function () { if (box) { box.classList.add('bb-zoom-on'); box.focus({ preventScroll: true }); } });
    document.addEventListener('keydown', onKey);
  }
  Array.prototype.forEach.call(imgs, function (el) {
    el.classList.add('bb-zoomable');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    var label = el.getAttribute('aria-label');
    el.setAttribute('aria-label', 'Enlarge image' + (label ? ': ' + label : ''));
    el.addEventListener('click', function () { open(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } });
  });
})();

/* Logo hover: a gold shimmer sweeps across the letters and a string under the logo is plucked */
(function () {
  var img = document.querySelector('header img.bb-logo');
  if (!img || !img.parentNode) return;
  var link = img.parentNode;
  var css = document.createElement('style');
  css.textContent =
    '.bb-logofx{position:relative;display:block;line-height:0}' +
    '.bb-logofx::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;' +
    '-webkit-mask:url(/images/brodband-logo.svg) center / 100% 100% no-repeat;mask:url(/images/brodband-logo.svg) center / 100% 100% no-repeat;' +
    'background:linear-gradient(105deg,transparent 35%,rgba(255,240,205,.95) 48%,#E9D3A0 52%,transparent 65%) 0 0 / 300% 100% no-repeat;background-position:120% 0}' +
    '.bb-logofx.bb-shine::after{animation:bb-sweep 1.4s ease-in-out forwards}' +
    '@keyframes bb-sweep{0%{opacity:1;background-position:120% 0}100%{opacity:1;background-position:-20% 0}}' +
    '.bb-logofx canvas{position:absolute;left:0;bottom:-11px;width:100%;height:14px;pointer-events:none}' +
    '@media (prefers-reduced-motion:reduce){.bb-logofx.bb-shine::after{animation:none}}';
  document.head.appendChild(css);

  var wrap = document.createElement('span');
  wrap.className = 'bb-logofx';
  link.insertBefore(wrap, img);
  wrap.appendChild(img);
  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  wrap.appendChild(cv);
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var start = 0, raf = 0;

  function size() {
    var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function draw(t) {
    var w = cv.clientWidth, h = cv.clientHeight, el = (t - start) / 1000;
    var amp = 4 * Math.exp(-el * 3.2), alpha = Math.max(0, 1 - el / 1.6);
    ctx.clearRect(0, 0, w, h);
    if (alpha <= 0) { raf = 0; return; }
    ctx.beginPath();
    for (var x = 0; x <= w; x += 2) {
      var u = x / w;
      var y = h / 2 + amp * Math.sin(Math.PI * u) * Math.sin(el * 48) + amp * 0.35 * Math.sin(2 * Math.PI * u) * Math.sin(el * 77);
      if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(233,211,160,' + alpha + ')';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = 'rgba(242,222,170,' + (alpha * 0.6) + ')';
    ctx.shadowBlur = 6;
    ctx.stroke();
    raf = requestAnimationFrame(draw);
  }
  function play() {
    if (reduce) return;
    wrap.classList.remove('bb-shine'); void wrap.offsetWidth; wrap.classList.add('bb-shine');
    size(); start = performance.now();
    if (!raf) raf = requestAnimationFrame(draw);
  }
  link.addEventListener('mouseenter', play);
  link.addEventListener('focus', play);
})();
