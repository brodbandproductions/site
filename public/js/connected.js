/* Contact form: sends to Netlify Forms in the background and shows the thank-you note.
   Without JavaScript the form still posts normally and lands on /thank-you. */
(function () {
  var form = document.querySelector('form[name="contact"]');
  var thanks = document.querySelector('[data-thanks]');
  if (!form || !thanks) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); form.hidden = true; thanks.hidden = false; thanks.focus && thanks.focus();
      })
      .catch(function () { form.submit(); })
      .then(function () { btn.disabled = false; btn.textContent = 'Send'; });
  });
  var again = thanks.querySelector('[data-again]');
  if (again) again.addEventListener('click', function () { thanks.hidden = true; form.hidden = false; });
})();
