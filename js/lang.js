(function () {
  var KEY = "robin-lang";

  function apply(lang) {
    if (lang !== "en" && lang !== "bn") lang = "en";
    var root = document.documentElement;
    root.setAttribute("data-lang", lang);
    root.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}

    document.querySelectorAll("[data-lang-set]").forEach(function (btn) {
      var on = btn.getAttribute("data-lang-set") === lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    document.querySelectorAll("[data-title-bn]").forEach(function (el) {
      var value = el.getAttribute(lang === "en" ? "data-title-en" : "data-title-bn");
      if (!value) return;
      if (el.tagName === "META") el.setAttribute("content", value);
      else if (el.tagName === "BODY") document.title = value;
    });

    document.querySelectorAll("[data-desc-bn]").forEach(function (el) {
      var value = el.getAttribute(lang === "en" ? "data-desc-en" : "data-desc-bn");
      if (value && el.tagName === "META") el.setAttribute("content", value);
    });

    document.querySelectorAll("[data-alt-bn]").forEach(function (el) {
      var value = el.getAttribute(lang === "en" ? "data-alt-en" : "data-alt-bn");
      if (value) el.setAttribute("alt", value);
    });

    var locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.setAttribute("content", lang === "en" ? "en_US" : "bn_BD");
  }

  document.addEventListener("click", function (event) {
    var toggle = event.target.closest("[data-lang-toggle]");
    if (toggle) {
      apply(document.documentElement.getAttribute("data-lang") === "en" ? "bn" : "en");
      return;
    }
    var btn = event.target.closest("[data-lang-set]");
    if (!btn) return;
    apply(btn.getAttribute("data-lang-set"));
  });

  apply(document.documentElement.getAttribute("data-lang") === "bn" ? "bn" : "en");
})();
