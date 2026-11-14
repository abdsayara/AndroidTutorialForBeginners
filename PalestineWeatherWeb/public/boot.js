// The last sky seen on the home page, before the first paint, so pages open on it.
try { document.documentElement.dataset.sky = JSON.parse(localStorage.getItem('pw.sky')) || 'day'; } catch { document.documentElement.dataset.sky = 'day'; }
