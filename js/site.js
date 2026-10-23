/* brodband productions: shared page behaviour */
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
