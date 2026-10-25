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
