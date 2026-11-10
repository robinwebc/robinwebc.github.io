/* TODO: WHATSAPP_NUMBER — digits only, country code included (no plus sign).
   Leave this empty until Robin supplies the number. Do not invent one. */
var WHATSAPP_NUMBER = "";

(function () {
  function waHref() {
    return "https://wa.me/" + WHATSAPP_NUMBER;
  }

  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", waHref());
  });

  var themeBtn = document.getElementById("themeBtn");
  var themeColor = document.getElementById("themeColor");

  function langNow() {
    return document.documentElement.getAttribute("data-lang") === "bn" ? "bn" : "en";
  }

  function applyTheme(theme) {
    if (theme !== "dark" && theme !== "light") theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("robin-theme", theme); } catch (e) {}
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#0a0c14" : "#ece8ff");
    if (themeBtn) {
      var dark = theme === "dark";
      themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
      themeBtn.setAttribute("aria-label", langNow() === "en"
        ? (dark ? "Switch to light mode" : "Switch to dark mode")
        : (dark ? "লাইট মোডে যান" : "ডার্ক মোডে যান"));
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    });
  }
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
  }
  if (navLinks) {
    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  var role = document.getElementById("roleText");
  var timer = null;
  var step = { i: 0, n: 0, dir: 1 };

  function phrases() {
    return langNow() === "en"
      ? ["Web Developer", "Android Developer"]
      : ["ওয়েব ডেভেলপার", "অ্যান্ড্রয়েড ডেভেলপার"];
  }

  function tick() {
    if (!role) return;
    var list = phrases();
    var word = list[step.i % list.length];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      role.textContent = list[0];
      return;
    }
    step.n += step.dir;
    if (step.n > word.length) {
      step.dir = -1;
      step.n = word.length;
      role.textContent = word;
      timer = setTimeout(tick, 1100);
      return;
    }
    if (step.n < 0) {
      step.dir = 1;
      step.n = 0;
      step.i = (step.i + 1) % list.length;
      role.textContent = "";
      timer = setTimeout(tick, 260);
      return;
    }
    role.textContent = word.slice(0, step.n);
    timer = setTimeout(tick, step.dir > 0 ? 78 : 42);
  }

  function restartTyping() {
    clearTimeout(timer);
    step = { i: 0, n: 0, dir: 1 };
    if (role) role.textContent = "";
    tick();
  }

  new MutationObserver(function () {
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    restartTyping();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });

  restartTyping();
})();
