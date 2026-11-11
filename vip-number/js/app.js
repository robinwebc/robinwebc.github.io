/* Public number search for Robin's VIP finder.
   Banglalink is called the same way as banglalink.net/en/order-new-sim.
   Robi and Cirkle are not searched here. Grameenphone needs the optional proxy. */
(function () {
  /* Paste your Cloudflare Worker origin after deploy, with no trailing slash.
     Example: "https://vip-number-proxy.your-name.workers.dev"
     Visitors then get Grameenphone stock numbers too. Until then, leave this empty. */
  var GP_PROXY = "";

  var API = "https://web-api.banglalink.net/api/gateway/d2d-service/api/v1/channel";
  var BUY = {
    robi: "https://www.robi.com.bd/en/sim-services?service=prepaid",
    cirkle: "https://cirkle.digital/en/sim-services",
    bl: "https://banglalink.net/en/order-new-sim",
    gp: "https://www.grameenphone.com/bn/shop/devices/sim"
  };
  var GP_PRODUCTS = [
    { nid: 211, prefix: "017" },
    { nid: 213, prefix: "013" }
  ];
  var FALLBACK_SERIES = ["01408", "01990", "01953", "01928", "01403"];
  var CODE_NAME = { N: "Normal", G: "Gold", S: "Silver", P: "Platinum" };
  var FILTERS = ["repeat", "sequence", "mirror", "aabb", "abab", "abcabc", "lucky", "many", "birthday", "year"];
  var MODES = ["contains", "ends", "starts", "pattern"];
  var CHIPS = ["786", "000", "111", "1234", "999"];

  var COPY = {
    bn: {
      q: "ডিজিট বা প্যাটার্ন",
      hint: {
        contains: "২ থেকে ৬ ডিজিট। বাংলালিংক এই অঙ্কগুলো নম্বরের ভিতরে খোঁজে। যেমন ৭৮৬।",
        ends: "২ থেকে ৬ ডিজিট। যে নম্বরগুলো এগুলো দিয়ে শেষ, সেগুলো রাখা হবে।",
        starts: "০১৯ বা ০১৪ দিয়ে লিখুন। যেমন ০১৯৫৩।",
        pattern: "যেমন ০১৯**৭৮৬***। তারকা মানে যেকোনো অঙ্ক।"
      },
      birth: "জন্মদিন বা সাল (ঐচ্ছিক)",
      go: "খুঁজুন",
      more: "আরও নম্বর",
      searching: "অপারেটরের তালিকা আনা হচ্ছে…",
      count: function (n) { return n + "টি নম্বর, ভালোগুলো আগে"; },
      none: "এই শর্তে এখন নম্বর মেলেনি। অন্য অঙ্ক চেষ্টা করুন।",
      needBl: "খুঁজতে বাংলালিংক চালু রাখুন। বাকি অপারেটরের কারণ নিচে।",
      needPrefix: "০১৯ বা ০১৪, অন্তত একটা সিরিজ চালু রাখুন।",
      digits: "২ থেকে ৬টি অঙ্ক দিন।",
      startsHint: "শুরুতে খুঁজতে ০১৯ বা ০১৪ দিয়ে লিখুন।",
      patternLen: "প্যাটার্ন ১১ অঙ্ক (০১৯**৭৮৬***) অথবা শেষের ৮ ঘর।",
      copied: "কপি হয়েছে",
      copy: "কপি",
      share: "শেয়ার",
      fav: "পছন্দ",
      favOn: "পছন্দে আছে",
      buy: "অফিসিয়াল পেজে কিনুন",
      emptyFav: "পছন্দের নম্বর এখানে থাকবে, শুধু এই ফোনে।",
      price: function (n) { return "৳" + n; },
      cat: { Normal: "সাধারণ", Gold: "গোল্ড", Silver: "সিলভার", Platinum: "প্লাটিনাম" },
      tags: {
        repeat: "একই অঙ্ক",
        sequence: "ক্রম",
        mirror: "উল্টো",
        aabb: "AABB",
        abab: "ABAB",
        abcabc: "ABCABC",
        lucky: "৭৮৬",
        many: "এক অঙ্ক বেশি",
        birthday: "জন্মদিন",
        year: "সাল"
      },
      modes: { contains: "ভিতরে আছে", ends: "শেষে", starts: "শুরুতে", pattern: "প্যাটার্ন" },
      live: "কেনা যায়",
      soon: "এখানে নয়",
      prefixes: "সিরিজ",
      score: "স্কোর",
      fail: "বাংলালিংকের তালিকা এই মুহূর্তে আসেনি। একটু পরে আবার চেষ্টা করুন।",
      cached: "একটু আগের তালিকা দেখানো হচ্ছে।",
      shareText: function (n) { return "এই নম্বরটা দেখুন: " + n; },
      notes: {
        robi: {
          t: "রবি ০১৮",
          p: "রবির সিম পেজ নম্বর আনে fetchAvailaleSimList সার্ভার অ্যাকশন দিয়ে। টোকেন না থাকলে উত্তর captchaFailed। টোকেনটি robi.com.bd-এর Cloudflare Turnstile, তাই অন্য সাইট থেকে নেওয়া যায় না। আমরা ক্যাপচা এড়াই না। নম্বর দেখে কিনতে তাদের পেজ খুলুন।"
        },
        cirkle: {
          t: "সার্কল ০১৬",
          p: "এয়ারটেল বাংলাদেশ এখন সার্কল। bd.airtel.com সরিয়ে দেয় cirkle.digital-এ, আর হোমপেজে সিম কেনার লিংক /sim-services। এই ঠিকানা তাদের ফায়ারওয়ালে আটকে যায়, তাই পাবলিক সার্চ কল বের করা যায়নি। একই কোম্পানির রবি পেজ নম্বরের আগে Turnstile চায়। এখান থেকে সার্কল সার্চ চালু নেই।"
        },
        gp: {
          t: "গ্রামীণফোন ০১৭ / ০১৩",
          p: "গ্রামীণফোনের শপ এখন স্টক নম্বর দেখায়। কলটি bkshopthc.grameenphone.com/api/v1/sim/get-list, লগইন লাগে না। কিন্তু CORS শুধু grameenphone.com-কে ছাড়ে, তাই এই পেজ সরাসরি পড়তে পারে না। ডিজিট সার্চ নেই: একবারে অল্প কয়েকটি স্টক নম্বর। আগে নম্বর বাছাই বন্ধ ছিল, এখন শপ পেজে স্টক আছে। প্রক্সি বসালে এখানেও আসবে।"
        }
      },
      proxyLabel: "প্রক্সির ঠিকানা (ঐচ্ছিক)",
      proxySave: "প্রক্সি সেভ",
      proxySteps: "ডিপ্লয়",
      proxyHelp: "১) ফ্রি Cloudflare অ্যাকাউন্ট খুলুন। ২) এই রিপোর vip-number/proxy ফোল্ডারে npx wrangler login তারপর npx wrangler deploy। ৩) workers.dev ঠিকানাটি ওপরের ঘরে সেভ করুন। সবার জন্য চাইলে সেই ঠিকানা js/app.js-এর GP_PROXY-তে বসিয়ে আবার পাবলিশ করুন।"
    },
    en: {
      q: "Digits or pattern",
      hint: {
        contains: "2 to 6 digits. Banglalink looks for these digits inside a number. Try 786.",
        ends: "2 to 6 digits. Only numbers that end with them are kept.",
        starts: "Start with 019 or 014. For example 01953.",
        pattern: "Example: 019**786***. A star is any digit."
      },
      birth: "Birthday or year (optional)",
      go: "Search",
      more: "More numbers",
      searching: "Asking the operator for the current list…",
      count: function (n) { return n + (n === 1 ? " number, best first" : " numbers, best first"); },
      none: "Nothing matched. Try different digits.",
      needBl: "Turn on Banglalink to search. The other networks are explained below.",
      needPrefix: "Keep at least one of 019 or 014 on.",
      digits: "Enter 2 to 6 digits.",
      startsHint: "For “starts with”, begin with 019 or 014.",
      patternLen: "Use 11 characters (019**786***) or the last 8.",
      copied: "Copied",
      copy: "Copy",
      share: "Share",
      fav: "Save",
      favOn: "Saved",
      buy: "Buy on the official page",
      emptyFav: "Saved numbers stay here, only on this phone.",
      price: function (n) { return "৳" + n; },
      cat: { Normal: "Normal", Gold: "Gold", Silver: "Silver", Platinum: "Platinum" },
      tags: {
        repeat: "Repeated",
        sequence: "Sequence",
        mirror: "Mirror",
        aabb: "AABB",
        abab: "ABAB",
        abcabc: "ABCABC",
        lucky: "786",
        many: "One digit a lot",
        birthday: "Birthday",
        year: "Year"
      },
      modes: { contains: "Contains", ends: "Ends with", starts: "Starts with", pattern: "Pattern" },
      live: "On sale",
      soon: "Not here",
      prefixes: "Series",
      score: "Score",
      fail: "Banglalink’s list did not load. Try again in a moment.",
      cached: "Showing the list from a moment ago.",
      shareText: function (n) { return "Look at this number: " + n; },
      notes: {
        robi: {
          t: "Robi 018",
          p: "Robi’s SIM page loads numbers with the fetchAvailaleSimList server action. Without a token the answer is captchaFailed. That token is Cloudflare Turnstile locked to robi.com.bd, so another site cannot take it. This tool does not bypass the captcha. Open their page to see numbers and buy."
        },
        cirkle: {
          t: "Cirkle 016",
          p: "Airtel Bangladesh is now Cirkle. bd.airtel.com redirects to cirkle.digital, and the homepage links to /sim-services. That address is rejected by their firewall from here, so the public search call could not be read. Robi, on the same company’s web stack, asks for Turnstile before it lists numbers. Cirkle search is not available in this tool."
        },
        gp: {
          t: "Grameenphone 017 / 013",
          p: "Grameenphone’s shop does list stock numbers now. The call is bkshopthc.grameenphone.com/api/v1/sim/get-list and it does not need a login. CORS only allows grameenphone.com, so this page cannot read it directly. There is no digit search: each response is a small batch of stock. Number choice was reported paused earlier; the shop page currently returns stock. A proxy turns it on here."
        }
      },
      proxyLabel: "Proxy URL (optional)",
      proxySave: "Save proxy",
      proxySteps: "Deploy",
      proxyHelp: "1) Open a free Cloudflare account. 2) In vip-number/proxy run npx wrangler login, then npx wrangler deploy. 3) Save the workers.dev URL above. To turn it on for everyone, put that URL in GP_PROXY at the top of js/app.js and publish again."
    }
  };

  var state = {
    ops: { robi: false, cirkle: false, bl: true, gp: false },
    p019: true,
    p014: true,
    mode: "contains",
    filters: {},
    page: 1,
    lastKey: "",
    busy: false
  };

  var mem = new Map();
  var chain = Promise.resolve();
  var lastAt = 0;
  var runId = 0;

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
  }
  function t() { return COPY[lang()]; }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function paced(task) {
    var job = chain.then(function () {
      var wait = Math.max(0, 420 - (Date.now() - lastAt));
      return sleep(wait).then(task).then(function (value) {
        lastAt = Date.now();
        return value;
      });
    });
    chain = job.then(function () {}, function () {});
    return job;
  }

  function cachedGet(url, ttl, fresh) {
    var now = Date.now();
    if (!fresh) {
      var hit = mem.get(url);
      if (hit && now - hit.t < ttl) return Promise.resolve({ data: hit.data, cached: true });
      try {
        var raw = sessionStorage.getItem("vip-cache:" + url);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && now - parsed.t < ttl) {
            mem.set(url, parsed);
            return Promise.resolve({ data: parsed.data, cached: true });
          }
        }
      } catch (e) {}
    }
    return paced(function () {
      var ctrl = typeof AbortController === "function" ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : 0;
      return fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error("http");
        return res.json();
      });
    }).then(function (data) {
      var rec = { t: Date.now(), data: data };
      mem.set(url, rec);
      try { sessionStorage.setItem("vip-cache:" + url, JSON.stringify(rec)); } catch (e) {}
      return { data: data, cached: false };
    });
  }

  function loadSeries(fresh) {
    return cachedGet(API + "/msisdn-series", 10 * 60 * 1000, fresh).then(function (pack) {
      var list = ((((pack.data || {}).payload || {}).data || {}).series || []);
      var out = [];
      list.forEach(function (item) {
        var series = String(item.series || "");
        if (/^01\d{3,5}$/.test(series)) out.push(series);
      });
      if (!out.length) throw new Error("empty");
      return out;
    }).catch(function () { return FALLBACK_SERIES.slice(); });
  }

  function loadPrices(fresh) {
    return cachedGet(API + "/products/new_sim", 10 * 60 * 1000, fresh).then(function (pack) {
      var product = ((((pack.data || {}).payload || {}).data || {}).product || {});
      var map = {};
      (product.bundle || []).forEach(function (row) {
        if (row.connection_type !== "PREPAID" || row.sim_kit_type !== "Physical") return;
        var price = Number(row.discount_price || row.regular_price || 0);
        if (price > 0 && row.number_category) map[row.number_category] = price;
      });
      return map;
    }).catch(function () { return {}; });
  }

  function selectedSeries(all) {
    return all.filter(function (series) {
      if (series.indexOf("019") === 0) return state.p019;
      if (series.indexOf("014") === 0) return state.p014;
      return false;
    });
  }

  function inventoryUrl(prefix, postfix, page) {
    return API + "/msisdn-inventory?msisdn_prefix=" + encodeURIComponent(prefix) +
      "&msisdn_postfix=" + encodeURIComponent(postfix || "") +
      "&show_special_number=false&page_number=" + page + "&page_size=15";
  }

  function nationalOf(msisdn) {
    var d = String(msisdn || "");
    if (d.indexOf("880") === 0) d = "0" + d.slice(3);
    return /^01\d{9}$/.test(d) ? d : "";
  }

  function jobsFor(series, mode, digits, parsed) {
    var jobs = [];
    if (mode === "pattern") {
      var lead = parsed.lead || "";
      var nationalLead = (parsed.op || "") + lead;
      var probe = (parsed.probe || "").slice(0, 6);
      if (probe.length === 1) probe = "";
      series.forEach(function (s) {
        if (parsed.op && s.indexOf(parsed.op) !== 0) return;
        var prefix;
        if (nationalLead && (s.indexOf(nationalLead) === 0 || nationalLead.indexOf(s) === 0)) {
          prefix = "88" + (nationalLead.length >= s.length ? nationalLead : s);
        } else if (!parsed.op && !lead) {
          prefix = "88" + s;
        } else if (!parsed.op && lead && s.slice(3).indexOf(lead) === 0) {
          prefix = "88" + s;
        } else if (!lead) {
          prefix = "88" + s;
        } else return;
        if (prefix.length > 13) return;
        jobs.push({ prefix: prefix, postfix: prefix.length > ("88" + s).length ? "" : probe, series: s });
      });
      return jobs;
    }
    if (!digits) {
      series.forEach(function (s) { jobs.push({ prefix: "88" + s, postfix: "", series: s }); });
      return jobs;
    }
    if (mode === "starts") {
      series.forEach(function (s) {
        if (s.indexOf(digits) !== 0 && digits.indexOf(s) !== 0) return;
        var prefix = "88" + (digits.length >= s.length ? digits : s);
        if (prefix.length <= 13) jobs.push({ prefix: prefix, postfix: "", series: s });
      });
      return jobs;
    }
    series.forEach(function (s) {
      jobs.push({ prefix: "88" + s, postfix: digits, series: s });
    });
    return jobs;
  }

  function keep(national, mode, digits, parsed) {
    if (!national) return false;
    if (mode === "pattern") return VipScore.matchesMask(national, parsed);
    if (!digits) return true;
    if (mode === "ends") return national.slice(-digits.length) === digits;
    if (mode === "starts") return national.indexOf(digits) === 0;
    return national.indexOf(digits) >= 0;
  }

  function categoryOf(item) {
    if (item.number_category) return String(item.number_category);
    return CODE_NAME[item.number_category_code] || "";
  }

  function readFavs() {
    try {
      var list = JSON.parse(localStorage.getItem("vip-number-favs") || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }
  function writeFavs(list) {
    try { localStorage.setItem("vip-number-favs", JSON.stringify(list.slice(0, 40))); } catch (e) {}
  }
  function isFav(national) {
    return readFavs().some(function (item) { return item.national === national; });
  }

  function gpProxy() {
    var stored = "";
    try { stored = localStorage.getItem("vip-gp-proxy") || ""; } catch (e) {}
    return (stored || GP_PROXY || "").replace(/\/$/, "");
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(cls, text, attrs) {
    var node = el("button", cls, text);
    node.type = "button";
    if (attrs) {
      Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    }
    return node;
  }

  function renderNumber(national, hi, seriesLen) {
    var line = el("p", "num");
    var hyphenAt = seriesLen || 5;
    var i;
    for (i = 0; i < national.length; i++) {
      if (i === hyphenAt) line.appendChild(document.createTextNode("-"));
      var on = hi && i >= hi.start && i < hi.end;
      var bit = document.createElement(on ? "mark" : "span");
      bit.textContent = national.charAt(i);
      line.appendChild(bit);
    }
    return line;
  }

  function renderOps() {
    var root = document.getElementById("ops");
    root.textContent = "";
    var spec = [
      ["robi", "robi", "018", false],
      ["cirkle", "cirkle", "016", false],
      ["bl", "banglalink", "019 · 014", true],
      ["gp", "GP", "017 · 013", false]
    ];
    spec.forEach(function (item) {
      var id = item[0];
      var node = button("op", "", { "data-op": id, "aria-pressed": state.ops[id] ? "true" : "false" });
      node.appendChild(el("span", "word", item[1]));
      node.appendChild(el("span", "meta", item[2]));
      node.appendChild(el("span", item[3] ? "pill" : "pill wait", item[3] ? t().live : t().soon));
      node.addEventListener("click", function () {
        state.ops[id] = !state.ops[id];
        renderOps();
        renderPrefixes();
        renderNotes();
      });
      root.appendChild(node);
    });
  }

  function renderPrefixes() {
    var row = document.getElementById("prefixes");
    row.textContent = "";
    row.hidden = !state.ops.bl;
    if (!state.ops.bl) return;
    ["019", "014"].forEach(function (prefix) {
      var on = prefix === "019" ? state.p019 : state.p014;
      var node = button("mini", prefix, { "aria-pressed": on ? "true" : "false" });
      node.addEventListener("click", function () {
        if (prefix === "019") state.p019 = !state.p019;
        else state.p014 = !state.p014;
        renderPrefixes();
      });
      row.appendChild(node);
    });
  }

  function renderModes() {
    var root = document.getElementById("modes");
    root.textContent = "";
    MODES.forEach(function (mode) {
      var node = button("mode", t().modes[mode], { "aria-pressed": state.mode === mode ? "true" : "false" });
      node.addEventListener("click", function () {
        state.mode = mode;
        renderModes();
        renderFormText();
      });
      root.appendChild(node);
    });
  }

  function renderFilters() {
    var root = document.getElementById("filters");
    root.textContent = "";
    FILTERS.forEach(function (name) {
      var node = button("filter", t().tags[name], { "aria-pressed": state.filters[name] ? "true" : "false" });
      node.addEventListener("click", function () {
        state.filters[name] = !state.filters[name];
        renderFilters();
        if (state.rows) paint(state.rows, false);
      });
      root.appendChild(node);
    });
  }

  function renderChips() {
    var root = document.getElementById("chips");
    root.textContent = "";
    CHIPS.forEach(function (chip) {
      var node = button("chip", chip);
      node.addEventListener("click", function () {
        document.getElementById("q").value = chip;
        state.mode = "contains";
        renderModes();
        renderFormText();
        search(false);
      });
      root.appendChild(node);
    });
  }

  function renderFormText() {
    document.getElementById("qLabel").textContent = t().q;
    document.getElementById("qHint").textContent = t().hint[state.mode];
    document.getElementById("birthLabel").textContent = t().birth;
    document.getElementById("go").textContent = t().go;
    document.getElementById("more").textContent = t().more;
    var title = lang() === "en" ? "Find a VIP number" : "ভিআইপি নম্বর খুঁজুন";
    document.title = title;
  }

  function renderNotes() {
    var root = document.getElementById("notes");
    root.textContent = "";
    ["robi", "cirkle", "gp"].forEach(function (id) {
      if (!state.ops[id]) return;
      var copy = t().notes[id];
      var box = el("article", "note");
      box.appendChild(el("h2", "", copy.t));
      box.appendChild(el("p", "", copy.p));
      var link = el("a", "buy", t().buy);
      link.href = BUY[id];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.setProperty("--tone", id === "robi" ? "var(--robi)" : id === "cirkle" ? "var(--cirkle)" : "var(--gp)");
      box.appendChild(link);
      if (id === "gp") box.appendChild(proxyBox());
      root.appendChild(box);
    });
  }

  function proxyBox() {
    var wrap = el("div");
    var label = el("label", "", t().proxyLabel);
    label.htmlFor = "proxy";
    var input = document.createElement("input");
    input.id = "proxy";
    input.className = "proxy";
    input.type = "url";
    input.placeholder = "https://….workers.dev";
    input.value = gpProxy();
    var save = button("textbtn", t().proxySave);
    save.addEventListener("click", function () {
      var value = input.value.trim().replace(/\/$/, "");
      if (value && !/^https:\/\/[a-z0-9.-]+$/i.test(value)) return;
      try { localStorage.setItem("vip-gp-proxy", value); } catch (e) {}
      if (state.ops.gp) search(false);
    });
    var details = document.createElement("details");
    details.appendChild(el("summary", "", t().proxySteps));
    details.appendChild(el("p", "", t().proxyHelp));
    wrap.appendChild(label);
    wrap.appendChild(input);
    wrap.appendChild(save);
    wrap.appendChild(details);
    return wrap;
  }

  function paint(rows, cached) {
    var birth = document.getElementById("birth").value;
    var scored = rows.map(function (row) {
      var info = VipScore.analyze(row.national, birth);
      return {
        national: row.national,
        operator: row.operator,
        series: row.series,
        price: row.price,
        category: row.category,
        zone: row.zone,
        score: info.score,
        tags: info.tags,
        hi: info.hi
      };
    }).filter(function (row) {
      return VipScore.passesFilters(row, state.filters);
    });
    scored.sort(function (a, b) {
      return b.score - a.score || (a.national < b.national ? -1 : 1);
    });
    state.rows = rows;
    var root = document.getElementById("results");
    root.textContent = "";
    scored.forEach(function (row) { root.appendChild(card(row)); });
    var status = document.getElementById("status");
    var shown = root.querySelectorAll(".card").length;
    status.textContent = shown ? t().count(shown) + (cached ? " · " + t().cached : "") : t().none;
    document.getElementById("more").hidden = !rows.length;
  }

  function card(row) {
    var node = el("article", "card");
    node.setAttribute("data-op", row.operator);
    node.setAttribute("data-national", row.national);
    node.appendChild(renderNumber(row.national, row.hi, (row.series || "").length || 5));
    var who = el("div");
    var name = row.operator === "bl" ? "banglalink" : row.operator === "gp" ? "GP" : row.operator;
    who.appendChild(el("span", "who", name + " " + row.national.slice(0, 3)));
    if (row.category) {
      who.appendChild(document.createTextNode(" · " + (t().cat[row.category] || row.category)));
    }
    if (row.price) who.appendChild(document.createTextNode(" · " + t().price(row.price)));
    if (row.zone) who.appendChild(document.createTextNode(" · " + row.zone));
    who.appendChild(document.createTextNode(" · " + t().score + " " + row.score));
    node.appendChild(who);
    if (row.tags.length) {
      var tags = el("div", "tags");
      row.tags.forEach(function (tag) { tags.appendChild(el("span", "tag", t().tags[tag] || tag)); });
      node.appendChild(tags);
    }
    var actions = el("div", "actions");
    var copyBtn = button("textbtn", t().copy);
    copyBtn.addEventListener("click", function () { copyNumber(row.national, copyBtn); });
    var share = button("textbtn", t().share);
    share.addEventListener("click", function () { shareNumber(row.national); });
    var fav = button("textbtn", isFav(row.national) ? t().favOn : t().fav);
    fav.addEventListener("click", function () {
      toggleFav(row);
      fav.textContent = isFav(row.national) ? t().favOn : t().fav;
      renderFavs();
    });
    var buy = el("a", "buy", t().buy);
    buy.href = BUY[row.operator] || BUY.bl;
    buy.target = "_blank";
    buy.rel = "noopener noreferrer";
    actions.appendChild(copyBtn);
    actions.appendChild(share);
    actions.appendChild(fav);
    actions.appendChild(buy);
    node.appendChild(actions);
    return node;
  }

  function copyNumber(national, btn) {
    var text = national;
    var done = function () {
      var old = btn.textContent;
      btn.textContent = t().copied;
      setTimeout(function () { btn.textContent = old; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
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
  function shareNumber(national) {
    var data = { title: document.title, text: t().shareText(national), url: location.href.split("#")[0] };
    if (navigator.share) navigator.share(data).catch(function () { copyNumber(national, document.createElement("button")); });
    else copyNumber(national + " " + data.url, document.getElementById("go"));
  }
  function toggleFav(row) {
    var list = readFavs().filter(function (item) { return item.national !== row.national; });
    if (!isFav(row.national)) {
      list.unshift({ national: row.national, operator: row.operator, series: row.series || "", price: row.price || 0, category: row.category || "" });
    }
    writeFavs(list);
  }

  function renderFavs() {
    var root = document.getElementById("favList");
    root.textContent = "";
    var list = readFavs();
    if (!list.length) {
      root.appendChild(el("p", "empty", t().emptyFav));
      return;
    }
    list.forEach(function (row) {
      var info = VipScore.analyze(row.national, document.getElementById("birth").value);
      root.appendChild(card({
        national: row.national,
        operator: row.operator,
        series: row.series,
        price: row.price,
        category: row.category,
        score: info.score,
        tags: info.tags,
        hi: info.hi
      }));
    });
  }

  function validate() {
    var raw = document.getElementById("q").value;
    var mode = state.mode;
    if (mode === "pattern") {
      if (!VipScore.bnDigits(raw).replace(/[\s-]/g, "")) return { ok: true, digits: "", parsed: null, browse: true };
      var parsed = VipScore.parsePattern(raw);
      if (!parsed.ok) return { ok: false, message: parsed.reason === "length" ? t().patternLen : t().patternLen };
      return { ok: true, digits: "", parsed: parsed };
    }
    var digits = VipScore.digitsOnly(raw);
    if (!digits) return { ok: true, digits: "", parsed: null, browse: true };
    if (mode === "starts") {
      if (digits.indexOf("1") === 0) digits = "0" + digits;
      if (digits.indexOf("019") !== 0 && digits.indexOf("014") !== 0) return { ok: false, message: t().startsHint };
      if (digits.length < 3 || digits.length > 8) return { ok: false, message: t().startsHint };
      return { ok: true, digits: digits, parsed: null };
    }
    if (digits.length < 2 || digits.length > 6) return { ok: false, message: t().digits };
    return { ok: true, digits: digits, parsed: null };
  }

  function search(more) {
    var check = validate();
    var status = document.getElementById("status");
    if (!check.ok) {
      status.textContent = check.message;
      return;
    }
    var foreign = check.parsed && check.parsed.op && { "018": "robi", "016": "cirkle", "017": "gp", "013": "gp" }[check.parsed.op];
    if (foreign) {
      state.ops[foreign] = true;
      renderOps();
      renderNotes();
      if (!state.ops.bl) {
        status.textContent = t().notes[foreign].t;
        return;
      }
    }
    if (!state.ops.bl && !(state.ops.gp && gpProxy())) {
      status.textContent = t().needBl;
      renderNotes();
      return;
    }
    if (state.ops.bl && !state.p019 && !state.p014) {
      status.textContent = t().needPrefix;
      return;
    }
    var key = JSON.stringify([state.mode, check.digits, check.parsed, state.p019, state.p014, state.ops.bl, state.ops.gp, gpProxy()]);
    if (!more || key !== state.lastKey) state.page = 1;
    else state.page += 1;
    if (state.page > 3) {
      state.page = 3;
      return;
    }
    state.lastKey = key;
    var id = ++runId;
    state.busy = true;
    document.getElementById("go").disabled = true;
    status.textContent = t().searching;
    if (!more) document.getElementById("results").textContent = "";

    var tasks = [];
    if (state.ops.bl) tasks.push(searchBl(check, state.page));
    if (state.ops.gp && gpProxy() && state.page === 1) tasks.push(searchGp());
    Promise.all(tasks).then(function (parts) {
      if (id !== runId) return;
      var rows = more ? (state.raw || []).slice() : [];
      var cached = false;
      var failed = false;
      var seen = {};
      var filterMode = check.browse ? "contains" : (check.parsed ? "pattern" : state.mode);
      rows.forEach(function (row) { seen[row.national] = true; });
      parts.forEach(function (part) {
        cached = cached || part.cached;
        failed = failed || part.failed;
        (part.rows || []).forEach(function (row) {
          if (row.operator === "gp" && !keep(row.national, filterMode, check.browse ? "" : check.digits, check.parsed)) return;
          if (seen[row.national]) return;
          seen[row.national] = true;
          rows.push(row);
        });
      });
      state.raw = rows;
      if (!rows.length && failed) status.textContent = t().fail;
      else paint(rows, cached);
    }).catch(function () {
      if (id === runId) status.textContent = t().fail;
    }).then(function () {
      if (id === runId) {
        state.busy = false;
        document.getElementById("go").disabled = false;
      }
    });
    renderNotes();
  }

  function searchBl(check, page) {
    return Promise.all([loadSeries(false), loadPrices(false)]).then(function (loaded) {
      var series = selectedSeries(loaded[0]);
      var prices = loaded[1];
      var parsed = check.parsed;
      if (parsed && parsed.op && parsed.op !== "019" && parsed.op !== "014") {
        return { rows: [], cached: false };
      }
      var mode = check.browse ? "contains" : (parsed ? "pattern" : state.mode);
      var plan = jobsFor(series, mode, check.browse ? "" : check.digits, parsed);
      if (!plan.length) return { rows: [], cached: false };
      var cached = false;
      var anyFailed = false;
      return Promise.all(plan.map(function (job) {
        return cachedGet(inventoryUrl(job.prefix, job.postfix, page), 3 * 60 * 1000, false).then(function (pack) {
          cached = cached || pack.cached;
          var list = ((((pack.data || {}).payload || {}).data || {}).msisdns || []);
          return list.map(function (item) {
            var national = nationalOf(item.msisdn);
            if (!keep(national, mode, check.browse ? "" : check.digits, parsed)) return null;
            var category = categoryOf(item);
            return {
              national: national,
              operator: "bl",
              series: job.series,
              category: category,
              price: prices[category] || prices.Normal || 0
            };
          }).filter(Boolean);
        }).catch(function () {
          anyFailed = true;
          return [];
        });
      })).then(function (groups) {
        var rows = [];
        var seen = {};
        groups.forEach(function (group) {
          group.forEach(function (row) {
            if (seen[row.national]) return;
            seen[row.national] = true;
            rows.push(row);
          });
        });
        return { rows: rows, cached: cached, failed: anyFailed && !rows.length };
      });
    }).catch(function () { return { rows: [], failed: true }; });
  }

  function searchGp() {
    var base = gpProxy();
    var wants = [];
    GP_PRODUCTS.forEach(function (item) { wants.push(item); });
    return Promise.all(wants.map(function (item) {
      return fetch(base + "/gp/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nid: item.nid, district: "Dhaka" })
      }).then(function (res) {
        if (!res.ok) throw new Error("http");
        return res.json();
      }).then(function (data) {
        return (data.numbers || []).map(function (row) {
          var national = nationalOf(row.number) || (/^01\d{9}$/.test(row.number) ? row.number : "");
          if (!national || national.slice(0, 3) !== item.prefix) return null;
          return { national: national, operator: "gp", series: national.slice(0, 5), zone: row.zone || "Dhaka", price: 0, category: "" };
        }).filter(Boolean);
      }).catch(function () { return []; });
    })).then(function (groups) {
      var rows = [];
      var seen = {};
      groups.forEach(function (group) {
        group.forEach(function (row) {
          if (seen[row.national]) return;
          seen[row.national] = true;
          rows.push(row);
        });
      });
      return { rows: rows, cached: false, failed: !rows.length };
    });
  }

  function setLang(next) {
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.lang = next;
    try { localStorage.setItem("vip-lang", next); } catch (e) {}
    try { localStorage.setItem("robin-lang", next); } catch (e) {}
    renderAll();
  }

  function renderAll() {
    renderOps();
    renderPrefixes();
    renderModes();
    renderFilters();
    renderChips();
    renderFormText();
    renderNotes();
    renderFavs();
    if (state.rows) paint(state.rows, false);
  }

  document.getElementById("langBtn").addEventListener("click", function () {
    setLang(lang() === "bn" ? "en" : "bn");
  });
  document.getElementById("search").addEventListener("submit", function (event) {
    event.preventDefault();
    search(false);
  });
  document.getElementById("more").addEventListener("click", function () { search(true); });

  renderAll();
  search(false);
})();
