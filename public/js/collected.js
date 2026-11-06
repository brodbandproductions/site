/* Collected page: interest survey sent to Netlify Forms in the background.
   Picks made on the cards and ticked ideas are joined into one field each, so every answer is kept.
   Without JavaScript the form still posts normally and lands on /thank-you. */
(function () {
  var form = document.querySelector('form[name="collected-interest"]');
  var thanks = document.querySelector('[data-thanks]');
  var picks = { plate: [], product: [] };
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function sameValue(el, v) { return el.getAttribute('data-value') === v; }
  function set(kind, v, on) {
    var i = picks[kind].indexOf(v);
    if (on && i < 0) picks[kind].push(v);
    if (!on && i > -1) picks[kind].splice(i, 1);
    each('[data-pick-btn="' + kind + '"]', function (b) {
      if (!sameValue(b, v)) return;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var card = b.closest('.bb-pc, .bb-gp'); if (card) card.classList.toggle('bb-on', on);
    });
    render();
  }
  function render() {
    ['plate', 'product'].forEach(function (kind) {
      var ul = document.querySelector('[data-chips="' + kind + '"]'), empty = document.querySelector('[data-empty="' + kind + '"]');
      if (ul) {
        ul.innerHTML = '';
        picks[kind].forEach(function (v) {
          var li = document.createElement('li'); li.className = 'bb-chip'; li.appendChild(document.createTextNode(v));
          var x = document.createElement('button'); x.type = 'button'; x.className = 'bb-chip-x'; x.textContent = '×';
          x.setAttribute('aria-label', 'Remove ' + v);
          x.addEventListener('click', function () { set(kind, v, false); });
          li.appendChild(x); ul.appendChild(li);
        });
      }
      if (empty) empty.classList.toggle('bb-hide', picks[kind].length > 0);
    });
    var a = picks.plate.length, b = picks.product.length, t = [];
    if (a) t.push(a + (a > 1 ? ' engravings' : ' engraving'));
    if (b) t.push(b + (b > 1 ? ' items' : ' item'));
    var c = document.querySelector('[data-pick-count]'); if (c) c.textContent = t.join(' · ');
    bar();
  }
  var pickbar = document.querySelector('[data-pickbar]'), section = document.getElementById('picks');
  function bar() {
    if (!pickbar) return;
    var near = section && section.getBoundingClientRect().top < window.innerHeight * 0.85;
    var on = (picks.plate.length + picks.product.length) > 0 && !near && !(form && form.hidden);
    pickbar.classList.toggle('bb-pickbar-on', on);
    document.documentElement.classList.toggle('bb-bar-on', on);
  }
  window.addEventListener('scroll', bar, { passive: true });
  window.addEventListener('resize', bar);
  // A click anywhere on an engraving or product card picks it; the magnifier and view thumbnails keep their own jobs.
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.bb-pk-z, .bb-vw, a, input, label, .bb-chip-x')) return;
    var btn = t.closest('[data-pick-btn]');
    if (!btn) { var card = t.closest('.bb-gp, .bb-pc'); if (card) btn = card.querySelector('[data-pick-btn]'); }
    if (!btn) return;
    set(btn.getAttribute('data-pick-btn'), btn.getAttribute('data-value'), btn.getAttribute('aria-pressed') !== 'true');
  });
  if (!form || !thanks) return;
  function ideas() { return Array.prototype.map.call(form.querySelectorAll('input[data-pick="idea"]:checked'), function (c) { return c.value; }); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.querySelector('input[name="engravings"]').value = picks.plate.join(', ');
    form.querySelector('input[name="products"]').value = picks.product.concat(ideas()).join(', ');
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    var fd = new FormData(form);
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString() })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        picks.plate.slice().forEach(function (v) { set('plate', v, false); });
        picks.product.slice().forEach(function (v) { set('product', v, false); });
        form.hidden = true; thanks.hidden = false; thanks.focus(); bar();
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
    var main = card.querySelector('.bb-pimg'), lens = card.querySelector('.bb-pk-z');
    var btns = group.querySelectorAll('.bb-vw');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        var src = b.getAttribute('data-view-src');
        main.style.backgroundImage = 'url(' + src + ')';
        if (lens) lens.setAttribute('data-zoom-src', src);
        var name = (main.getAttribute('aria-label') || '').split(' mock-up')[0];
        main.setAttribute('aria-label', name + ' mock-up, ' + b.getAttribute('aria-label').toLowerCase());
        if (lens) lens.setAttribute('data-zoom-alt', main.getAttribute('aria-label'));
        Array.prototype.forEach.call(btns, function (o) { var on = o === b; o.classList.toggle('bb-vw-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      });
    });
  });
})();
