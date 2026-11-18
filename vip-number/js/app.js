/* VIP Number Finder. Live "on sale" only when Banglalink's public inventory
   returns that exact number. Every other result is a pattern suggestion. */
(function () {
  var BL = "https://web-api.banglalink.net/api/gateway/d2d-service/api/v1/channel";
  var SERIES_FALLBACK = ["01408", "01990", "01953", "01928", "01403"];
  var BUY = {
    gp: "https://www.grameenphone.com/bn/shop/devices/sim",
    robi: "https://www.robi.com.bd/en/sim-services?service=prepaid",
    cirkle: "https://cirkle.digital/en/sim-services",
    bl: "https://banglalink.net/en/order-new-sim",
    tt: "https://sim.teletalk.com.bd:8443/"
  };
  var OPS = ["all", "gp", "robi", "cirkle", "bl", "tt"];
  var MODES = ["ends", "contains", "starts", "pattern", "mask"];
  var PAGE = 24;

  var COPY = {
    bn: {
      q: { ends: "শেষের অঙ্ক", contains: "যে অঙ্ক থাকবে", starts: "যেভাবে শুরু", pattern: "আরও অঙ্ক (ঐচ্ছিক)", mask: "মাস্ক" },
      hint: {
        ends: "যেমন ৭৮৬ বা ০০০০। নম্বর এই অঙ্ক দিয়ে শেষ হবে।",
        contains: "এই অঙ্কগুলো নম্বরের যেকোনো জায়গায় থাকবে।",
        starts: "০১৭, ০১৮, ০১৯৫৩ — পুরো নম্বর এভাবে শুরু।",
        pattern: "নিচ থেকে একটা প্যাটার্ন বাছুন। চাইলে আরও অঙ্ক লিখুন।",
        mask: "X মানে যেকোনো অঙ্ক। যেমন 01X-XX77-77XX।"
      },
      go: "খুঁজুন",
      more: "আরও নম্বর",
      working: "সাজানো হচ্ছে…",
      none: "এই শর্তে কিছু মেলেনি। অন্য অঙ্ক চেষ্টা করুন।",
      count: function (n) { return n + "টি দেখানো হচ্ছে, ভালোগুলো আগে"; },
      liveCount: function (n) { return n + "টি বাংলালিংকের তালিকায়"; },
      liveFail: "বাংলালিংকের তালিকা এই মুহূর্তে আসেনি",
      live: "বাংলালিংকের তালিকায় এখন আছে",
      suggest: "প্যাটার্ন সাজেশন: অপারেটরের কাছে খালি আছে কিনা দেখে নিন।",
      copy: "কপি",
      copied: "কপি হয়েছে",
      fav: "পছন্দ",
      favOn: "পছন্দে আছে",
      buy: "অপারেটরের পেজে দেখুন",
      emptyFav: "পছন্দের নম্বর এই ফোনে থাকবে।",
      hist: "সাম্প্রতিক খোঁজ",
      needPreset: "একটা প্যাটার্ন বাছুন।",
      digitRange: "১ থেকে ৮টি অঙ্ক দিন। পুরো নম্বর হলে ১১টি।",
      startsBad: "০১৩ থেকে ০১৯ দিয়ে শুরু করে লিখুন।",
      opMismatch: "এই শুরুটা বাছাই করা অপারেটরের নয়।",
      maskBad: "১১ ঘর দিন। যেমন 01X-XX77-77XX।",
      score: "স্কোর",
      tier: { platinum: "প্লাটিনাম", gold: "গোল্ড", silver: "সিলভার", standard: "সাধারণ" },
      op: { all: "সব", gp: "গ্রামীণফোন", robi: "রবি", cirkle: "এয়ারটেল/সার্কল", bl: "বাংলালিংক", tt: "টেলিটক" },
      mode: { ends: "শেষে", contains: "ভিতরে", starts: "শুরুতে", pattern: "প্যাটার্ন", mask: "মাস্ক" },
      preset: {
        repeat: "একই অঙ্ক",
        sequence: "ক্রম",
        mirror: "উল্টো",
        abab: "ABAB",
        aabb: "AABB",
        xyyx: "XYYX",
        triple: "তিন/চার",
        pairs: "জোড়া জোড়া",
        lucky: "ভাগ্য ৭৮৬",
        year: "সাল"
      },
      install: "ইনস্টল",
      title: "ভিআইপি নম্বর খুঁজুন"
    },
    en: {
      q: { ends: "Ending digits", contains: "Digits inside", starts: "Starts with", pattern: "Also contains (optional)", mask: "Mask" },
      hint: {
        ends: "Example: 786 or 0000. The number will end with these digits.",
        contains: "These digits can sit anywhere in the number.",
        starts: "017, 018, 01953 — the whole number starts this way.",
        pattern: "Pick a pattern below. Add digits if you want them inside it.",
        mask: "X is any digit. Example: 01X-XX77-77XX."
      },
      go: "Search",
      more: "More numbers",
      working: "Lining them up…",
      none: "Nothing matched. Try different digits.",
      count: function (n) { return "Showing " + n + ", best first"; },
      liveCount: function (n) { return n + " on Banglalink’s list"; },
      liveFail: "Banglalink’s list did not load",
      live: "On Banglalink’s list right now",
      suggest: "pattern suggestion: check availability with the operator",
      copy: "Copy",
      copied: "Copied",
      fav: "Save",
      favOn: "Saved",
      buy: "Check on the operator page",
      emptyFav: "Saved numbers stay on this phone.",
      hist: "Recent searches",
      needPreset: "Pick a pattern.",
      digitRange: "Enter 1 to 8 digits, or 11 for a full number.",
      startsBad: "Start with 013–019.",
      opMismatch: "That prefix is not this operator.",
      maskBad: "Use 11 places. Example: 01X-XX77-77XX.",
      score: "Score",
      tier: { platinum: "Platinum", gold: "Gold", silver: "Silver", standard: "Standard" },
      op: { all: "All", gp: "Grameenphone", robi: "Robi", cirkle: "Airtel/Cirkle", bl: "Banglalink", tt: "Teletalk" },
      mode: { ends: "Ends", contains: "Contains", starts: "Starts", pattern: "Pattern", mask: "Mask" },
      preset: {
        repeat: "Repeating",
        sequence: "Sequence",
        mirror: "Mirror",
        abab: "ABAB",
        aabb: "AABB",
        xyyx: "XYYX",
        triple: "Triple/quad",
        pairs: "Double pairs",
        lucky: "Lucky 786",
        year: "Year"
      },
      install: "Install",
      title: "VIP Number Finder"
    }
  };

  var state = {
    op: "all",
    mode: "ends",
    presets: {},
    run: 0,
    cursor: null,
    spec: null,
    items: [],
    liveFirst: [],
    seen: {},
    live: {},
    liveError: false,
    livePage: 0,
    liveMore: false,
    series: null
  };

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
  }
  function t() { return COPY[lang()]; }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function button(cls, text) {
    var node = el("button", cls, text);
    node.type = "button";
    return node;
  }

  function readList(key) {
    try {
      var list = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }
  function writeList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
  }
  function isFav(national) {
    return readList("vip-number-favs").some(function (item) { return item && item.national === national; });
  }
  function toggleFav(national) {
    var list = readList("vip-number-favs").filter(function (item) { return item && item.national !== national; });
    if (!isFav(national)) list.unshift({ national: national, operator: VipGen.operatorOf(national) });
    writeList("vip-number-favs", list.slice(0, 80));
  }

  function remember(spec) {
    var key = JSON.stringify([spec.op, spec.mode, spec.digits, spec.mask, spec.presets]);
    var list = readList("vip-number-history").filter(function (item) { return item && item.key !== key; });
    list.unshift({ key: key, op: spec.op, mode: spec.mode, digits: spec.digits, mask: spec.mask, presets: spec.presets });
    writeList("vip-number-history", list.slice(0, 12));
  }

  function historyLabel(item) {
    var c = t();
    var bits = [c.op[item.op] || item.op, c.mode[item.mode] || item.mode];
    if (item.mode === "mask") bits.push(item.mask);
    else if (item.digits) bits.push(item.digits);
    if (item.presets && item.presets.length) {
      bits.push(item.presets.map(function (id) { return c.preset[id] || id; }).join(" "));
    }
    return bits.join(" · ");
  }

  function setLang(next) {
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem("vip-lang", next);
      localStorage.setItem("robin-lang", next);
    } catch (e) {}
    renderChrome();
    repaint();
  }

  function renderChrome() {
    var c = t();
    document.title = c.title;
    document.getElementById("go").textContent = c.go;
    document.getElementById("more").textContent = c.more;
    document.getElementById("qLabel").textContent = c.q[state.mode];
    document.getElementById("hint").textContent = c.hint[state.mode];
    var install = document.getElementById("install");
    if (install) install.textContent = c.install;
    var input = document.getElementById("q");
    input.placeholder = state.mode === "mask" ? "01X-XX77-77XX" : (state.mode === "pattern" ? "786" : "786");
    input.inputMode = state.mode === "mask" ? "text" : "numeric";
    renderOps();
    renderModes();
    renderPresets();
    renderQuick();
    renderHistory();
    paintStatus();
  }

  function renderOps() {
    var root = document.getElementById("ops");
    var c = t();
    root.textContent = "";
    OPS.forEach(function (id) {
      var node = button("op" + (state.op === id ? " on" : ""), c.op[id]);
      node.setAttribute("aria-pressed", state.op === id ? "true" : "false");
      var meta = el("small", "", id === "all" ? "" : { gp: "017/013", robi: "018", cirkle: "016", bl: "019/014", tt: "015" }[id]);
      if (meta.textContent) node.appendChild(meta);
      node.addEventListener("click", function () {
        state.op = id;
        renderOps();
      });
      root.appendChild(node);
    });
  }

  function renderModes() {
    var root = document.getElementById("modes");
    var c = t();
    root.textContent = "";
    MODES.forEach(function (id) {
      var node = button("mode" + (state.mode === id ? " on" : ""), c.mode[id]);
      node.setAttribute("aria-pressed", state.mode === id ? "true" : "false");
      node.addEventListener("click", function () {
        state.mode = id;
        renderChrome();
      });
      root.appendChild(node);
    });
  }

  function renderPresets() {
    var root = document.getElementById("presets");
    var c = t();
    root.textContent = "";
    root.hidden = state.mode !== "pattern";
    if (state.mode !== "pattern") return;
    VipGen.PRESET_IDS.forEach(function (id) {
      var node = button("preset" + (state.presets[id] ? " on" : ""), c.preset[id]);
      node.setAttribute("aria-pressed", state.presets[id] ? "true" : "false");
      node.addEventListener("click", function () {
        state.presets[id] = !state.presets[id];
        renderPresets();
      });
      root.appendChild(node);
    });
  }

  function renderQuick() {
    var root = document.getElementById("quick");
    root.textContent = "";
    root.hidden = state.mode === "pattern" || state.mode === "mask";
    if (root.hidden) return;
    ["786", "0000", "1234", "6789", "2024"].forEach(function (chip) {
      var node = button("chip", chip);
      node.addEventListener("click", function () {
        document.getElementById("q").value = chip;
        search(false);
      });
      root.appendChild(node);
    });
  }

  function renderHistory() {
    var root = document.getElementById("history");
    var list = readList("vip-number-history");
    root.textContent = "";
    if (!list.length) return;
    root.appendChild(el("p", "kicker", t().hist));
    var row = el("div", "quick");
    list.forEach(function (item) {
      var node = button("chip", historyLabel(item));
      node.addEventListener("click", function () {
        state.op = item.op || "all";
        state.mode = item.mode || "ends";
        state.presets = {};
        (item.presets || []).forEach(function (id) { state.presets[id] = true; });
        document.getElementById("q").value = item.mode === "mask" ? (item.mask || "") : (item.digits || "");
        renderChrome();
        search(false);
      });
      row.appendChild(node);
    });
    root.appendChild(row);
  }

  function readSpec() {
    var c = t();
    var raw = document.getElementById("q").value;
    var digits = VipScore.digitsOnly(raw);
    if (state.mode === "starts" && digits.charAt(0) === "1") digits = "0" + digits;
    var presets = VipGen.PRESET_IDS.filter(function (id) { return state.presets[id]; });
    var spec = {
      op: state.op,
      mode: state.mode,
      digits: digits,
      presets: presets,
      prefixes: VipGen.prefixesFor(state.op),
      mask: ""
    };
    if (state.mode === "mask") {
      var parsed = VipScore.parseMask(raw);
      if (!parsed.ok) return { error: c.maskBad };
      spec.mask = parsed.mask;
      spec.digits = "";
      return { spec: spec };
    }
    if (state.mode === "pattern") {
      if (!presets.length) return { error: c.needPreset };
      if (digits && (digits.length < 2 || digits.length > 8)) return { error: c.digitRange };
      return { spec: spec };
    }
    if (state.mode === "starts") {
      if (digits.length < 3 || digits.length > 11 || digits.indexOf("01") !== 0) return { error: c.startsBad };
      var ok = spec.prefixes.some(function (p) { return digits.indexOf(p) === 0 || p.indexOf(digits) === 0; });
      if (!ok) return { error: c.opMismatch };
      spec.digits = digits;
      return { spec: spec };
    }
    if (!digits || digits.length > 11) return { error: c.digitRange };
    if (state.mode === "contains" && digits.length > 8) return { error: c.digitRange };
    if (state.mode === "ends" && digits.length > 11) return { error: c.digitRange };
    spec.digits = digits;
    return { spec: spec };
  }

  function matches(national, spec) {
    if (!VipGen.isNational(national)) return false;
    if (spec.prefixes.indexOf(national.slice(0, 3)) < 0) return false;
    if (spec.mode === "ends" && national.slice(-spec.digits.length) !== spec.digits) return false;
    if (spec.mode === "starts" && national.indexOf(spec.digits) !== 0) return false;
    if (spec.mode === "contains" && national.indexOf(spec.digits) < 0) return false;
    if (spec.mode === "mask" && !VipScore.matchesMask(national, spec.mask)) return false;
    if (spec.mode === "pattern") {
      if (spec.digits && national.indexOf(spec.digits) < 0) return false;
      var hit = spec.presets.some(function (id) { return VipScore.hasPreset(national, id); });
      if (!hit) return false;
    }
    return true;
  }

  function paintStatus() {
    var status = document.getElementById("status");
    var c = t();
    if (state.error) {
      status.textContent = state.error;
      return;
    }
    var n = state.liveFirst.length + state.items.length;
    if (!n) {
      status.textContent = state.message || "";
      return;
    }
    var liveN = 0;
    state.liveFirst.concat(state.items).forEach(function (num) { if (state.live[num]) liveN += 1; });
    var text = c.count(n);
    if (liveN) text += " · " + c.liveCount(liveN);
    if (state.liveError) text += " · " + c.liveFail;
    status.textContent = text;
  }

  function groups(national, info) {
    var line = el("p", "num");
    var parts = [national.slice(0, 3), national.slice(3, 7), national.slice(7)];
    var at = 0;
    parts.forEach(function (part, index) {
      if (index) line.appendChild(document.createTextNode(" "));
      var i;
      for (i = 0; i < part.length; i++) {
        var on = info.hi && at >= info.hi.start && at < info.hi.end;
        var bit = document.createElement(on ? "mark" : "span");
        bit.textContent = part.charAt(i);
        line.appendChild(bit);
        at += 1;
      }
    });
    return line;
  }

  function card(national) {
    var c = t();
    var op = VipGen.operatorOf(national);
    var info = VipScore.analyze(national, "");
    var tier = VipScore.tier(info.score);
    var node = el("article", "card");
    node.setAttribute("data-op", op);
    node.setAttribute("data-n", national);
    node.appendChild(groups(national, info));
    var meta = el("div", "meta");
    meta.appendChild(el("span", "badge op-" + op, c.op[op] + " " + national.slice(0, 3)));
    meta.appendChild(el("span", "tier tier-" + tier, c.tier[tier] + " · " + info.score));
    node.appendChild(meta);
    var avail = el("p", state.live[national] ? "avail live" : "avail suggest", state.live[national] ? c.live : c.suggest);
    node.appendChild(avail);
    var actions = el("div", "actions");
    var copyBtn = button("text", c.copy);
    copyBtn.addEventListener("click", function () { copyNumber(national, copyBtn); });
    var fav = button("text", isFav(national) ? c.favOn : c.fav);
    fav.setAttribute("aria-pressed", isFav(national) ? "true" : "false");
    fav.addEventListener("click", function () {
      toggleFav(national);
      fav.textContent = isFav(national) ? c.favOn : c.fav;
      fav.setAttribute("aria-pressed", isFav(national) ? "true" : "false");
      renderFavs();
    });
    var buy = el("a", "buy", c.buy);
    buy.href = BUY[op] || BUY.bl;
    buy.target = "_blank";
    buy.rel = "noopener noreferrer";
    actions.appendChild(copyBtn);
    actions.appendChild(fav);
    actions.appendChild(buy);
    node.appendChild(actions);
    return node;
  }

  function repaint() {
    state.liveFirst.sort(function (a, b) {
      return VipScore.analyze(b, "").score - VipScore.analyze(a, "").score || (a < b ? -1 : 1);
    });
    var root = document.getElementById("list");
    root.textContent = "";
    var frag = document.createDocumentFragment();
    state.liveFirst.concat(state.items).forEach(function (national) { frag.appendChild(card(national)); });
    root.appendChild(frag);
    document.getElementById("more").hidden = !(state.cursor && (!state.cursor.done() || state.liveMore));
    paintStatus();
    renderFavs();
  }

  function copyNumber(national, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = t().copied;
      setTimeout(function () { btn.textContent = old; }, 1100);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(national).then(done, function () { fallbackCopy(national); done(); });
    } else {
      fallbackCopy(national);
      done();
    }
  }
  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (e) {}
    area.remove();
  }

  function renderFavs() {
    var root = document.getElementById("favList");
    var list = readList("vip-number-favs").filter(function (item) { return item && VipGen.isNational(item.national); });
    root.textContent = "";
    if (!list.length) {
      root.appendChild(el("p", "empty", t().emptyFav));
      return;
    }
    list.forEach(function (item) { root.appendChild(card(item.national)); });
  }

  function search(more) {
    var status = document.getElementById("status");
    if (!more) {
      var read = readSpec();
      if (read.error) {
        state.error = read.error;
        state.message = "";
        paintStatus();
        return;
      }
      state.error = "";
      state.message = "";
      state.spec = read.spec;
      state.run += 1;
      state.cursor = VipGen.createCursor(read.spec);
      state.items = [];
      state.liveFirst = [];
      state.seen = {};
      state.live = {};
      state.liveError = false;
      state.livePage = 1;
      state.liveMore = false;
      state.liveBusy = false;
      document.getElementById("list").textContent = "";
      status.textContent = t().working;
      document.getElementById("go").disabled = true;
      remember(read.spec);
      renderHistory();
      var run = state.run;
      setTimeout(function () {
        if (run !== state.run) return;
        try { pull(PAGE); } catch (e) { state.message = t().none; }
        document.getElementById("go").disabled = false;
        if (!state.items.length && !state.liveFirst.length && !state.message) state.message = t().none;
        repaint();
        askLive(read.spec, 1, run);
      }, 20);
      return;
    }
    if (!state.cursor) return;
    pull(PAGE);
    repaint();
    if (state.liveMore && state.spec) askLive(state.spec, state.livePage + 1, state.run);
  }

  function pull(k) {
    if (!state.cursor) return;
    var batch = state.cursor.next(k);
    batch.sort(function (a, b) {
      return VipScore.analyze(b, "").score - VipScore.analyze(a, "").score || (a < b ? -1 : 1);
    });
    batch.forEach(function (national) {
      if (state.seen[national]) return;
      state.seen[national] = 1;
      state.items.push(national);
    });
  }

  function nationalOf(msisdn) {
    var d = String(msisdn || "");
    if (d.indexOf("880") === 0) d = "0" + d.slice(3);
    return /^01\d{9}$/.test(d) ? d : "";
  }

  function longestRun(mask) {
    var best = "";
    var cur = "";
    var i;
    for (i = 0; i < mask.length; i++) {
      var ch = mask.charAt(i);
      if (ch >= "0" && ch <= "9") {
        cur += ch;
        if (cur.length > best.length) best = cur;
      } else cur = "";
    }
    if (best.length < 2) return "";
    return best.slice(0, 6);
  }

  function probesFor(spec) {
    var out = [];
    if (spec.mode === "starts") return out;
    if (spec.digits && spec.digits.length >= 2 && spec.digits.length <= 6) out.push(spec.digits);
    if (spec.mode === "mask") {
      var run = longestRun(spec.mask);
      if (run) out.push(run);
    }
    if (spec.mode === "pattern" && (!spec.digits || spec.digits.length < 2)) {
      var set = spec.presets || [];
      if (set.indexOf("lucky") >= 0) out.push("786");
      else if (set.indexOf("repeat") >= 0) out.push("0000");
      else if (set.indexOf("sequence") >= 0) out.push("1234");
      else if (set.indexOf("year") >= 0) out.push("2000");
    }
    var seen = {};
    return out.filter(function (p) {
      if (seen[p] || p.length < 2 || p.length > 6) return false;
      seen[p] = 1;
      return true;
    }).slice(0, 2);
  }

  function wantsLive(spec) {
    return spec.prefixes.indexOf("014") >= 0 || spec.prefixes.indexOf("019") >= 0;
  }

  function loadSeries() {
    if (state.series) return Promise.resolve(state.series);
    return fetch(BL + "/msisdn-series").then(function (res) {
      if (!res.ok) throw new Error("http");
      return res.json();
    }).then(function (data) {
      var list = ((((data || {}).payload || {}).data || {}).series || []).map(function (item) {
        return String(item.series || "");
      }).filter(function (series) { return /^01\d{3,5}$/.test(series); });
      state.series = list.length ? list : SERIES_FALLBACK.slice();
      return state.series;
    }).catch(function () {
      state.series = SERIES_FALLBACK.slice();
      return state.series;
    });
  }

  function invUrl(prefix, postfix, page) {
    return BL + "/msisdn-inventory?msisdn_prefix=" + encodeURIComponent(prefix) +
      "&msisdn_postfix=" + encodeURIComponent(postfix || "") +
      "&show_special_number=false&page_number=" + page + "&page_size=20";
  }

  function jobsFor(spec, series, page) {
    var bl = series.filter(function (s) {
      return spec.prefixes.some(function (p) { return s.indexOf(p) === 0; });
    });
    if (spec.mode === "starts" && (spec.digits.indexOf("019") === 0 || spec.digits.indexOf("014") === 0)) {
      return bl.filter(function (s) {
        return s.indexOf(spec.digits) === 0 || spec.digits.indexOf(s) === 0;
      }).map(function (s) {
        var prefix = spec.digits.length >= s.length ? spec.digits : s;
        return { prefix: "88" + prefix, postfix: "" };
      });
    }
    return probesFor(spec).reduce(function (jobs, probe) {
      bl.forEach(function (s) { jobs.push({ prefix: "88" + s, postfix: probe }); });
      return jobs;
    }, []);
  }

  function readRows(data) {
    return ((((data || {}).payload || {}).data || {}).msisdns || []).map(function (item) {
      return nationalOf(item.msisdn);
    }).filter(Boolean);
  }

  function addLive(national, run) {
    if (run !== state.run || !state.spec || !matches(national, state.spec)) return;
    state.live[national] = 1;
    if (state.seen[national]) return;
    state.seen[national] = 1;
    state.liveFirst.unshift(national);
  }

  function askLive(spec, page, run) {
    if (!wantsLive(spec) || state.liveBusy) return;
    state.liveBusy = true;
    function finish() {
      if (run === state.run) state.liveBusy = false;
    }
    loadSeries().then(function (series) {
      if (run !== state.run) { finish(); return; }
      var jobs = jobsFor(spec, series, page);
      if (!jobs.length) {
        if (page === 1) exactTop(spec, run, finish);
        else finish();
        return;
      }
      var full = false;
      var failed = 0;
      var pending = jobs.length;
      jobs.forEach(function (job) {
        fetch(invUrl(job.prefix, job.postfix, page)).then(function (res) {
          if (!res.ok) throw new Error("http");
          return res.json();
        }).then(function (data) {
          if (run !== state.run) return;
          var rows = readRows(data);
          if (rows.length >= 20) full = true;
          rows.forEach(function (national) { addLive(national, run); });
        }).catch(function () {
          failed += 1;
        }).then(function () {
          pending -= 1;
          if (pending) return;
          if (run !== state.run) { finish(); return; }
          state.liveError = failed === jobs.length;
          state.livePage = page;
          state.liveMore = full && page < 10;
          if (page === 1 && !Object.keys(state.live).length) exactTop(spec, run, finish);
          else { repaint(); finish(); }
        });
      });
    }).catch(function () { finish(); });
  }

  function exactTop(spec, run, done) {
    var sample = state.items.filter(function (national) { return VipGen.operatorOf(national) === "bl"; }).slice(0, 3);
    if (!sample.length) { if (done) done(); return; }
    var left = sample.length;
    var anyFail = false;
    sample.forEach(function (national) {
      fetch(invUrl("88" + national, "", 1)).then(function (res) {
        if (!res.ok) throw new Error("http");
        return res.json();
      }).then(function (data) {
        if (run !== state.run) return;
        if (readRows(data).indexOf(national) >= 0) addLive(national, run);
      }).catch(function () {
        anyFail = true;
      }).then(function () {
        left -= 1;
        if (left) return;
        if (run === state.run) {
          if (anyFail && !Object.keys(state.live).length) state.liveError = true;
          repaint();
        }
        if (done) done();
      });
    });
  }

  function renderFavsOnLoad() {
    renderFavs();
  }

  document.getElementById("langBtn").addEventListener("click", function () {
    setLang(lang() === "bn" ? "en" : "bn");
  });
  document.getElementById("search").addEventListener("submit", function (event) {
    event.preventDefault();
    search(false);
  });
  document.getElementById("more").addEventListener("click", function () { search(true); });

  var deferredInstall = null;
  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstall = event;
    document.getElementById("install").hidden = false;
  });
  document.getElementById("install").addEventListener("click", function () {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    deferredInstall = null;
    document.getElementById("install").hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  renderChrome();
  renderFavsOnLoad();
})();
