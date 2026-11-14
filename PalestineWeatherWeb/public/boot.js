// The last sky seen on the home page, before the first paint, so pages open on it.
try { document.documentElement.dataset.sky = JSON.parse(localStorage.getItem('pw.sky')) || 'day'; } catch { document.documentElement.dataset.sky = 'day'; }
// The light mode, when the visitor chose it, before the first paint.
try { if (JSON.parse(localStorage.getItem('pw.theme')) === 'light') document.documentElement.dataset.theme = 'light'; } catch { /* the usual look */ }
