/* Collected page: interest survey sent to Netlify Forms in the background.
   Ticked plates and products are joined into one field each, so every answer is kept.
   Without JavaScript the form still posts normally and lands on /thank-you. */
(function () {
  var form = document.querySelector('form[name="collected-interest"]');
  var thanks = document.querySelector('[data-thanks]');
  if (!form || !thanks) return;
  function join(name) {
    return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (c) { return c.value; }).join(', ');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.querySelector('input[name="plates"]').value = join('plate');
    form.querySelector('input[name="products"]').value = join('product');
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    var fd = new FormData(form); fd.delete('plate'); fd.delete('product');
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString() })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); form.hidden = true; thanks.hidden = false; thanks.focus();
      })
      .catch(function () { form.submit(); })
      .then(function () { btn.disabled = false; btn.textContent = 'Send my picks'; });
  });
  var again = thanks.querySelector('[data-again]');
  if (again) again.addEventListener('click', function () { thanks.hidden = true; form.hidden = false; });
})();

/* Product views: small thumbnails switch the main mock-up (front, sides, handle left or right). */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.bb-views'), function (group) {
    var card = group.closest('.bb-pc'); if (!card) return;
    var main = card.querySelector('[data-zoom-src]');
    var btns = group.querySelectorAll('.bb-vw');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        var src = b.getAttribute('data-view-src');
        main.style.backgroundImage = 'url(' + src + ')';
        main.setAttribute('data-zoom-src', src);
        var name = (main.getAttribute('aria-label') || '').split(' mock-up')[0];
        main.setAttribute('aria-label', name + ' mock-up, ' + b.getAttribute('aria-label').toLowerCase());
        main.setAttribute('data-zoom-alt', main.getAttribute('aria-label'));
        Array.prototype.forEach.call(btns, function (o) { var on = o === b; o.classList.toggle('bb-vw-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      });
    });
  });
})();
