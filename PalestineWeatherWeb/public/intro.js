// The opening, once per visit: the cloud rises, the rays come out one by one, then the name.
(function () {
  var el = document.getElementById('intro');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('pw.intro') === '1'; sessionStorage.setItem('pw.intro', '1'); } catch (e) {}
  if (seen || still || location.pathname !== '/') { el.remove(); return; }
  el.hidden = false;
  var done = function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 380); };
  el.addEventListener('click', done);
  setTimeout(done, 2600);
})();
