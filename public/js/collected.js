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
