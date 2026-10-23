/* Formulated page gallery.
   To add a photo: put the image in /images/gallery/ and add an entry below.
   Entries with src: '' show a "photo to come" placeholder. */
(function () {
  var GALLERY = [
    { src: '', when: 'Kiev · late 1970s', title: 'Summer camp band' },
    { src: '', when: 'Kiev · late 1970s', title: 'Summer camp band, on stage' },
    { src: '/images/gallery/voice-industrie-psychotica-cassette.jpg', when: 'Edmonton · early 1990s', title: 'Voice Industrie, Psychotica cassette' }
  ];

  var gal = document.querySelector('.bb-gal');
  if (!gal) return;
  var stage = gal.querySelector('.bb-gstage');
  var side = gal.querySelector('.bb-gside').children; // counter, when, title, arrows
  var thumbs = document.querySelector('.bb-gthumbs');
  var arrows = gal.querySelectorAll('.bb-garr');
  var i = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function show(n) {
    i = (n + GALLERY.length) % GALLERY.length;
    var g = GALLERY[i];
    stage.innerHTML = g.src
      ? '<img src="' + esc(g.src) + '" alt="' + esc(g.title) + '" class="bb-gimg">'
      : '<div class="bb-slot" style="aspect-ratio: auto; width: 100%; height: 100%"><span class="bb-mono">Photo to come</span><span>' + esc(g.title) + '</span></div>';
    side[0].textContent = (i + 1) + ' / ' + GALLERY.length;
    side[1].textContent = g.when;
    side[2].textContent = g.title;
    Array.prototype.forEach.call(thumbs.children, function (b, k) {
      b.classList.toggle('bb-gth-on', k === i);
      b.setAttribute('aria-current', k === i ? 'true' : 'false');
    });
  }

  thumbs.innerHTML = GALLERY.map(function (g, k) {
    var inner = g.src
      ? '<span class="bb-gthimg" style="background-image: url(' + esc(g.src) + ')"></span>'
      : '<span class="bb-gthimg bb-gthph">Photo</span>';
    return '<button type="button" class="bb-gth" aria-label="Show ' + esc(g.title) + '" role="listitem">' + inner + '</button>';
  }).join('');
  Array.prototype.forEach.call(thumbs.children, function (b, k) { b.addEventListener('click', function () { show(k); }); });
  arrows[0].addEventListener('click', function () { show(i - 1); });
  arrows[1].addEventListener('click', function () { show(i + 1); });
  gal.parentNode.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  show(0);
})();
