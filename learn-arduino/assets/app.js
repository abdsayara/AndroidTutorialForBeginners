(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  const base = document.body.dataset.base || ".";
  const page = document.body.dataset.page || "";

  // ---------- Shared header & footer ----------
  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <div class="container nav">
        <a class="brand" href="${base}/index.html"><span class="brand-logo">∞</span><span data-i18n="site.name"></span></a>
        <nav class="nav-links">
          <a href="${base}/index.html" class="${page === "home" ? "active" : ""}" data-i18n="nav.home"></a>
          <a href="${base}/index.html#experiments" class="${page.startsWith("exp") ? "active" : ""}" data-i18n="nav.experiments"></a>
          <a href="${base}/index.html#kit" data-i18n="nav.kit"></a>
          <a href="${base}/index.html#about" data-i18n="nav.about"></a>
          <span class="controls">
            <button class="btn-ghost" id="lang-btn" data-i18n="lang.toggle"></button>
            <button class="btn-ghost" id="theme-btn" aria-label="theme" data-i18n="theme.toggle"></button>
          </span>
        </nav>
      </div>`;
  }
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `<div class="container"><span data-i18n="footer.text"></span> © ${new Date().getFullYear()}</div>`;
  }

  // ---------- i18n ----------
  let lang = store.get("lang") || "ar";
  const t = (key) => (I18N[lang] && I18N[lang][key]) ?? (I18N.en[key] ?? key);
  window.t = t;

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
    const titleKey = document.body.dataset.titleKey;
    document.title = (titleKey ? t(titleKey) + " | " : "") + t("site.name");
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }
  document.getElementById("lang-btn")?.addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    store.set("lang", lang);
    applyLang();
  });

  // ---------- Theme ----------
  const savedTheme = store.get("theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  document.getElementById("theme-btn")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    store.set("theme", next);
  });

  // ---------- Code copy buttons ----------
  document.querySelectorAll(".code-block").forEach((block) => {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.dataset.i18n = "copy";
    btn.addEventListener("click", () => {
      navigator.clipboard?.writeText(block.querySelector("pre").innerText);
      btn.innerHTML = t("copied");
      setTimeout(() => (btn.innerHTML = t("copy")), 1500);
    });
    block.appendChild(btn);
  });

  applyLang();
})();
