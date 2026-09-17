/* Shared behaviour for every page: keyboard focus styles, theme toggle,
   Let’s chat intake dialog, scroll reveal, and local preview links.
   Loaded with defer, so the whole page (including the footer) exists first. */

(function () {
  var root = document.documentElement;
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Tab' || ev.key === 'Enter' || ev.key === ' ') root.classList.add('using-keyboard');
  }, true);
  document.addEventListener('pointerdown', function () { root.classList.remove('using-keyboard'); }, true);
})();

// When previewing from the file system, point clean URLs like /projectclimate at projectclimate.html.
(function () {
  if (location.protocol !== 'file:') return;
  document.querySelectorAll('a[href^="/"]').forEach(function (a) {
    var h = a.getAttribute('href');
    var hash = h.indexOf('#') > -1 ? h.slice(h.indexOf('#')) : '';
    var path = h.replace(/#.*/, '').replace(/^\//, '');
    a.setAttribute('href', (path ? path + '.html' : 'index.html') + hash);
  });
})();

(function () {
  var btn = document.querySelector('.theme-toggle');
  var root = document.documentElement;
  function label() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.querySelector('.theme-toggle__label').textContent = dark ? 'Light' : 'Dark';
  }
  label();
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
  // Follow system changes until the visitor picks a theme.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (ev) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    if (saved) return;
    root.setAttribute('data-theme', ev.matches ? 'dark' : 'light');
    label();
  });
})();
  
// Fade rows up as they scroll into view, and back out as they leave (as on the Figma site).
(function () {
  var items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('can-reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('is-in', e.isIntersecting); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
  items.forEach(function (el) { io.observe(el); });
})();
  
(function () {
  var dialog = document.getElementById('intake');
  var openers = document.querySelectorAll('.nav__cta');
  if (!dialog || !dialog.showModal) return;
  var form = dialog.querySelector('form');
  var formWrap = dialog.querySelector('.intake__form-wrap');
  var done = dialog.querySelector('.intake__done');
  var error = dialog.querySelector('.intake__error');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATSAPP = '61466567953', EMAIL = 'rowenabaulch@outlook.com', closing = null;

  function open() {
    clearTimeout(closing);
    dialog.classList.remove('is-open');
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('has-drawer');
    requestAnimationFrame(function () { requestAnimationFrame(function () { dialog.classList.add('is-open'); }); });
  }
  function close() {
    dialog.classList.remove('is-open');
    document.documentElement.classList.remove('has-drawer');
    closing = setTimeout(function () { dialog.close(); }, reduce ? 0 : 450);
  }

  openers.forEach(function (b) { b.addEventListener('click', open); });
  dialog.querySelector('.intake__close').addEventListener('click', close);
  dialog.addEventListener('cancel', function (ev) { ev.preventDefault(); close(); });
  // A click on the dimmed area outside the panel closes it.
  dialog.addEventListener('click', function (ev) { if (ev.target === dialog) close(); });

  function message() {
    var d = new FormData(form);
    var help = d.getAll('help');
    var lines = ['Hi Ro, I’d like to work with you.', ''];
    lines.push('Name: ' + d.get('name').trim());
    if (d.get('company').trim()) lines.push('Company: ' + d.get('company').trim());
    if (d.get('email').trim()) lines.push('Email: ' + d.get('email').trim());
    if (help.length) lines.push('Help with: ' + help.join(', '));
    if (d.get('timeline')) lines.push('Timeline: ' + d.get('timeline'));
    lines.push('', d.get('details').trim());
    return lines.join('\n');
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = form.elements.name.value.trim(), details = form.elements.details.value.trim();
    if (!name || !details) {
      error.hidden = false;
      (name ? form.elements.details : form.elements.name).focus();
      return;
    }
    error.hidden = true;
    var channel = ev.submitter && ev.submitter.value === 'email' ? 'email' : 'whatsapp';
    var text = message();
    if (channel === 'whatsapp') {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    } else {
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Let’s chat: ' + name) + '&body=' + encodeURIComponent(text);
    }
    done.querySelector('[data-channel]').textContent = channel === 'email' ? 'your email app' : 'WhatsApp';
    formWrap.hidden = true;
    done.hidden = false;
    done.focus();
  });

  dialog.querySelector('[data-intake-reset]').addEventListener('click', function () {
    done.hidden = true;
    formWrap.hidden = false;
    form.elements.name.focus();
  });
})();
  
/* Looping video thumbnails hold still for anyone who asks for less motion.
   The poster frame stays, so the card still shows what the project is. */
(function () {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('video[autoplay]').forEach(function (video) {
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');
    video.pause();
  });
})();
