/* Formulated page: "captured moments" gallery.
   To add a photo: put it in /images/gallery/ and add its file name to PHOTOS.
   The order is shuffled on every visit. */
(function () {
  var PHOTOS = [];
  for (var n = 1; n <= 20; n++) PHOTOS.push('/images/gallery/studio-moment-' + (n < 10 ? '0' : '') + n + '.jpg');

  for (var k = PHOTOS.length - 1; k > 0; k--) { // Fisher-Yates shuffle
    var j = Math.floor(Math.random() * (k + 1)); var t = PHOTOS[k]; PHOTOS[k] = PHOTOS[j]; PHOTOS[j] = t;
  }

  var gal = document.querySelector('.bb-gal');
  if (!gal) return;
  var stage = gal.querySelector('.bb-gstage');
  var counter = gal.querySelector('.bb-gside').children[0];
  var thumbs = document.querySelector('.bb-gthumbs');
  var arrows = gal.querySelectorAll('.bb-garr');
  var i = 0;

  function label(k) { return 'Studio moment ' + (k + 1); }

  function show(n) {
    i = (n + PHOTOS.length) % PHOTOS.length;
    stage.innerHTML = '<img src="' + PHOTOS[i] + '" alt="' + label(i) + '" class="bb-gimg">';
    counter.textContent = (i + 1) + ' / ' + PHOTOS.length;
    Array.prototype.forEach.call(thumbs.children, function (b, k) {
      b.classList.toggle('bb-gth-on', k === i);
      b.setAttribute('aria-current', k === i ? 'true' : 'false');
    });
  }

  thumbs.innerHTML = PHOTOS.map(function (src, k) {
    return '<button type="button" class="bb-gth" aria-label="Show ' + label(k) + '" role="listitem"><span class="bb-gthimg" style="background-image: url(' + src + ')"></span></button>';
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
