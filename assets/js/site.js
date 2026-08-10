/* Mobile nav toggle. */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
})();

/* Client-side episode search. Podpage ran this server-side; there are few
   enough episodes that filtering the rendered cards is enough. */
(function () {
  var input = document.querySelector('[data-search-target]');
  if (!input) return;
  var grid = document.querySelector(input.dataset.searchTarget);
  var empty = document.querySelector('.no-results');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search-text]'));

  input.addEventListener('input', function () {
    var query = input.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var match = !query || card.dataset.searchText.indexOf(query) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
  });
})();

/* Form submission without leaving the site.

   Apps Script: POST JSON as text/plain. text/plain is a "simple" content type
   so the browser skips the CORS preflight, and the web app's redirect to
   script.googleusercontent.com carries Access-Control-Allow-Origin: *, so we
   can read the real result and report actual success or failure.

   Google Forms: its endpoint returns an opaque response, so we post with
   no-cors and report success optimistically.

   Without JS both forms still submit as ordinary POSTs. */
(function () {
  var forms = document.querySelectorAll('form[data-apps-script], form[data-google-form]');

  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    var isAppsScript = form.hasAttribute('data-apps-script');

    function report(message, ok) {
      if (!status) return;
      status.textContent = message;
      status.hidden = false;
      status.classList.toggle('form-status--error', !ok);
    }

    function send() {
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      if (!isAppsScript) {
        return fetch(form.action, {
          method: 'POST',
          mode: 'no-cors',
          body: new FormData(form),
        }).then(function () { return { status: 'ok' }; });
      }

      return fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      }).then(function (response) { return response.json(); });
    }

    form.addEventListener('submit', function (event) {
      if (!window.fetch || (form.reportValidity && !form.reportValidity())) return;
      event.preventDefault();
      if (button) button.disabled = true;

      send().then(function (result) {
        if (result && result.status === 'ok') {
          form.reset();
          report(form.dataset.thanks, true);
        } else {
          report((result && result.message) || 'Sorry — that did not send. Please try again.', false);
        }
      }).catch(function () {
        report('Sorry — that did not send. Please try again.', false);
      }).then(function () {
        if (button) button.disabled = false;
      });
    });
  });
})();
