/* VIP finder UI. Robi and Airtel use the public availability check.
   Banglalink uses its public inventory. GP and Teletalk stay suggestions. */
(function () {
  var V = window.VipLive;
  var API = "https://da-api.robi.com.bd/da-nll/free-msisdn/get-msisdn-list";
  var BL = "https://web-api.banglalink.net/api/gateway/d2d-service/api/v1/channel";
  var BL_SERIES = ["01408", "01990", "01953", "01928", "01403"];

  var COPY = {
    bn: {
      title: "ভিআইপি নাম্বার ফাইন্ডার — রবিন",
      step1: "অপারেটর",
      step2: "ধরন",
      step3: "স্ক্যান",
      ops: "অপারেটর বাছুন",
      code: "কোড",
      digits: "যে অঙ্ক থাকবে",
      pos: "অঙ্কটা কোথায়",
      start: "শুরুতে",
      mid: "মাঝখানে",
      end: "শেষে",
      want: "কতগুলো চাই",
      scan: "স্ক্যান শুরু",
      stop: "থামান",
      more: "আরও স্ক্যান",
      suggestGo: "সাজেশন দেখুন",
      preview: "মাস্ক",
      blocks: "যে ব্লক দেখা হচ্ছে",
      res: "খালি নাম্বার",
      resN: function (n) { return "খালি নাম্বার · " + bn(n); },
      empty: "স্ক্যান শুরু করলে শুধু যেগুলো এখন খালি, সেগুলো এখানে আসবে।",
      none: "এই ধরনে এখন খালি নাম্বার মেলেনি। অন্য কোড বা অঙ্ক চেষ্টা করুন।",
      prog: function (c, f) { return bn(c) + "টি যাচাই · " + bn(f) + "টি খালি"; },
      buy: "কিনুন",
      copy: "কপি",
      copied: "কপি হয়েছে",
      live: "এখন খালি",
      suggest: "সাজেশন — খালি আছে কি না এই সাইট জানে না",
      errPrefix: "কোড অপারেটরের সাথে মেলে না। যেমন 018, 01815, 016।",
      errDigits: "১ থেকে ৮টি অঙ্ক দিন। যেমন 786 বা 5555।",
      errLong: "কোড আর অঙ্ক মিলিয়ে ১১র বেশি হয়ে গেছে।",
      errNet: "যাচাই এই মুহূর্তে সাড়া দিচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
      blWait: "বাংলালিংকের তালিকা আনা হচ্ছে…",
      install: "ইনস্টল",
      both: "রবি + এয়ারটেল",
      op: { robi: "রবি", airtel: "এয়ারটেল", bl: "বাংলালিংক", gp: "গ্রামীণফোন", tt: "টেলিটক" },
      gpNote: "গ্রামীণফোনের নম্বর-তালিকা এই সাইট থেকে পড়া যায় না। নিচেরগুলো প্যাটার্ন সাজেশন। কিনতে অপারেটরের নিজের পাতায় দেখুন।",
      ttNote: "টেলিটকের অনলাইন সিমে ঢুকতে সাইন-ইন লাগে। এই সাইট লগ ইন করে না। নিচেরগুলো প্যাটার্ন সাজেশন।",
      hintEnd: "নম্বর এই অঙ্ক দিয়ে শেষ হবে।",
      hintStart: "কোডের ঠিক পরেই এই অঙ্ক বসবে।",
      hintMid: "খালি ঘরের মাঝখানে এই অঙ্ক বসবে।"
    },
    en: {
      title: "VIP number finder — Robin",
      step1: "Operator",
      step2: "Pattern",
      step3: "Scan",
      ops: "Pick an operator",
      code: "Code",
      digits: "Digits",
      pos: "Where those digits sit",
      start: "Start",
      mid: "Middle",
      end: "End",
      want: "How many",
      scan: "Start scan",
      stop: "Stop",
      more: "Scan more",
      suggestGo: "Show suggestions",
      preview: "Mask",
      blocks: "Blocks being scanned",
      res: "Available numbers",
      resN: function (n) { return "Available numbers · " + n; },
      empty: "After a scan, only numbers that are free right now show up here.",
      none: "Nothing free matched this pattern. Try another code or digits.",
      prog: function (c, f) { return c + " checked · " + f + " available"; },
      buy: "Buy",
      copy: "Copy",
      copied: "Copied",
      live: "Available now",
      suggest: "Suggestion — this site cannot see if it is free",
      errPrefix: "That code does not match the operator. Try 018, 01815, or 016.",
      errDigits: "Enter 1 to 8 digits, such as 786 or 5555.",
      errLong: "The code plus the digits is longer than 11.",
      errNet: "The check is not answering right now. Try again in a moment.",
      blWait: "Loading Banglalink’s list…",
      install: "Install",
      both: "Robi + Airtel",
      op: { robi: "Robi", airtel: "Airtel", bl: "Banglalink", gp: "Grameenphone", tt: "Teletalk" },
      gpNote: "Grameenphone’s number list cannot be read from this site. The rows below are pattern suggestions. Buy only on the operator’s own page.",
      ttNote: "Teletalk’s online SIM page asks you to sign in. This site does not log in. The rows below are pattern suggestions.",
      hintEnd: "The number ends with these digits.",
      hintStart: "These digits sit right after the code.",
      hintMid: "These digits sit in the middle of the open places."
    }
  };

  var CHIPS = {
    robi: ["018", "01815", "01822", "01819"],
    airtel: ["016", "01612", "01613", "01610"],
    both: ["dual", "018", "016", "01822", "01612"],
    bl: ["019", "014", "01990", "01408"],
    gp: ["017", "013", "01713"],
    tt: ["015", "01515"]
  };

  var state = {
    op: "both",
    pos: "end",
    dual: true,
    runId: 0,
    scanner: null,
    items: [],
    blSeries: null
  };

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
  }
  function t() { return COPY[lang()]; }
  function bn(n) {
    return lang() === "bn" ? String(n).replace(/\d/g, function (d) { return V.BN.charAt(+d); }) : String(n);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function setLang(next) {
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem("vip-live-lang", next);
      localStorage.setItem("robin-lang", next);
    } catch (e) {}
    render();
  }

  function readPrefix() {
    return V.digits(document.getElementById("prefix").value);
  }
  function readDigits() {
    return V.digits(document.getElementById("digits").value);
  }

  function operatorCodes(op) {
    if (op === "robi") return ["018"];
    if (op === "airtel") return ["016"];
    if (op === "both") return ["018", "016"];
    if (op === "bl") return ["019", "014"];
    if (op === "gp") return ["017", "013"];
    return ["015"];
  }

  function prefixFits(op, prefix) {
    if (op === "both" && state.dual) return true;
    return operatorCodes(op).some(function (code) {
      return prefix.indexOf(code) === 0 || code.indexOf(prefix) === 0;
    });
  }

  function masksFor() {
    var op = state.op;
    var pattern = readDigits();
    var prefix = readPrefix();
    if (op === "both" && (state.dual || prefix === "01" || prefix === "")) {
      var a = V.buildMask("018", state.pos, pattern);
      var b = V.buildMask("016", state.pos, pattern);
      if (!a.ok) return { error: a.error };
      return {
        ok: true,
        live: true,
        masks: [
          { mask: a.mask, brands: ["ROBI"] },
          { mask: b.ok ? b.mask : a.mask, brands: ["AIRTEL"] }
        ]
      };
    }
    if (op === "both") {
      if (prefix.indexOf("018") === 0) op = "robi";
      else if (prefix.indexOf("016") === 0) op = "airtel";
      else return { error: "prefix" };
    }
    if (!prefixFits(op, prefix || operatorCodes(op)[0])) return { error: "prefix" };
    var use = prefix && prefixFits(op, prefix) ? prefix : operatorCodes(op)[0];
    if (use.length < 3) use = operatorCodes(op)[0];
    var built = V.buildMask(use, state.pos, pattern);
    if (!built.ok) return { error: built.error };
    var brand = op === "robi" ? ["ROBI"] : op === "airtel" ? ["AIRTEL"] : op === "bl" ? ["BL"] : op === "gp" ? ["GP"] : ["TT"];
    return { ok: true, live: op === "robi" || op === "airtel" || op === "bl", masks: [{ mask: built.mask, brands: brand }], op: op };
  }

  function paintMask() {
    var box = document.getElementById("mask");
    var hint = document.getElementById("maskHint");
    var c = t();
    var spec = masksFor();
    box.textContent = "";
    if (!spec.ok) {
      hint.textContent = spec.error === "long" ? c.errLong : spec.error === "prefix" ? c.errPrefix : c.errDigits;
      return;
    }
    spec.masks.forEach(function (item, index) {
      if (index) box.appendChild(document.createTextNode("  "));
      var code = el("span", "mask-code", V.preview(item.mask));
      box.appendChild(code);
    });
    hint.textContent = state.pos === "start" ? c.hintStart : state.pos === "mid" ? c.hintMid : c.hintEnd;
  }

  function renderOps() {
    var root = document.getElementById("ops");
    var c = t();
    root.textContent = "";
    root.setAttribute("aria-label", c.ops);
    [
      ["both", c.both, "018 + 016"],
      ["robi", c.op.robi, "018"],
      ["airtel", c.op.airtel, "016"],
      ["bl", c.op.bl, "019 / 014"],
      ["gp", c.op.gp, "017 / 013"],
      ["tt", c.op.tt, "015"]
    ].forEach(function (row) {
      var btn = el("button", "op" + (state.op === row[0] ? " on" : "") + " op-" + row[0]);
      btn.type = "button";
      btn.setAttribute("aria-pressed", state.op === row[0] ? "true" : "false");
      btn.appendChild(el("b", "", row[1]));
      btn.appendChild(el("small", "", row[2]));
      btn.addEventListener("click", function () {
        state.op = row[0];
        state.dual = row[0] === "both";
        var field = document.getElementById("prefix");
        var current = readPrefix();
        var codes = operatorCodes(row[0]);
        var concrete = current && codes.some(function (code) { return current.indexOf(code) === 0; });
        if (row[0] === "both") field.value = "";
        else if (!concrete) field.value = CHIPS[row[0]][0];
        render();
      });
      root.appendChild(btn);
    });
  }

  function renderChips() {
    var root = document.getElementById("prefixes");
    var c = t();
    root.textContent = "";
    (CHIPS[state.op] || []).forEach(function (chip) {
      var on = chip === "dual" ? state.dual : !state.dual && readPrefix() === chip;
      var btn = el("button", "chip" + (on ? " on" : ""), chip === "dual" ? (lang() === "bn" ? "০১৮+০১৬" : "018+016") : chip);
      btn.type = "button";
      btn.addEventListener("click", function () {
        if (chip === "dual") {
          state.dual = true;
          document.getElementById("prefix").value = "";
        } else {
          state.dual = false;
          document.getElementById("prefix").value = chip;
        }
        renderChips();
        paintMask();
        paintNote();
      });
      root.appendChild(btn);
    });
    root.setAttribute("aria-label", c.code);
  }

  function renderPos() {
    var root = document.getElementById("pos");
    var c = t();
    root.textContent = "";
    root.setAttribute("aria-label", c.pos);
    [["start", c.start], ["mid", c.mid], ["end", c.end]].forEach(function (row) {
      var btn = el("button", "pos" + (state.pos === row[0] ? " on" : ""), row[1]);
      btn.type = "button";
      btn.setAttribute("aria-pressed", state.pos === row[0] ? "true" : "false");
      btn.addEventListener("click", function () {
        state.pos = row[0];
        renderPos();
        paintMask();
      });
      root.appendChild(btn);
    });
  }

  function renderQuick() {
    var root = document.getElementById("quick");
    root.textContent = "";
    ["786", "5555", "0000", "1234", "7777"].forEach(function (chip) {
      var btn = el("button", "chip", chip);
      btn.type = "button";
      btn.addEventListener("click", function () {
        document.getElementById("digits").value = chip;
        if (!state.pos) state.pos = "end";
        paintMask();
      });
      root.appendChild(btn);
    });
  }

  function paintNote() {
    var note = document.getElementById("note");
    var c = t();
    if (state.op === "gp") note.textContent = c.gpNote;
    else if (state.op === "tt") note.textContent = c.ttNote;
    else note.textContent = "";
    note.hidden = !note.textContent;
    var go = document.getElementById("go");
    go.textContent = state.op === "gp" || state.op === "tt" ? c.suggestGo : c.scan;
  }

  function renderLabels() {
    var c = t();
    document.title = c.title;
    document.getElementById("labCode").textContent = c.code;
    document.getElementById("labDigits").textContent = c.digits;
    document.getElementById("labPos").textContent = c.pos;
    document.getElementById("labWant").textContent = c.want;
    document.getElementById("labMask").textContent = c.preview;
    document.getElementById("stop").textContent = c.stop;
    document.getElementById("more").textContent = c.more;
    document.getElementById("install").textContent = c.install;
    var steps = document.querySelectorAll(".steps span");
    [c.step1, c.step2, c.step3].forEach(function (label, i) { if (steps[i]) steps[i].textContent = label; });
    document.querySelectorAll(".steps b").forEach(function (node, i) { node.textContent = bn(i + 1); });
    paintNote();
    paintResults(false);
  }

  function render() {
    renderLabels();
    renderOps();
    renderChips();
    renderPos();
    renderQuick();
    paintMask();
  }

  function pretty(local) {
    return local.slice(0, 5) + "-" + local.slice(5, 8) + "-" + local.slice(8);
  }

  function card(item) {
    var c = t();
    var node = el("article", "num-card" + (item.live ? " live" : " suggest"));
    node.setAttribute("data-brand", item.brand);
    var title = el("p", "num");
    title.textContent = pretty(item.local);
    node.appendChild(title);
    var meta = el("div", "meta");
    var name = { ROBI: c.op.robi, AIRTEL: c.op.airtel, BL: c.op.bl, GP: c.op.gp, TT: c.op.tt }[item.brand] || item.brand;
    meta.appendChild(el("span", "badge b-" + item.brand, name + " " + item.local.slice(0, 3)));
    meta.appendChild(el("span", item.live ? "flag ok" : "flag warn", item.live ? c.live : c.suggest));
    node.appendChild(meta);
    var row = el("div", "acts");
    var copy = el("button", "ghost", c.copy);
    copy.type = "button";
    copy.addEventListener("click", function () {
      var done = function () {
        copy.textContent = c.copied;
        setTimeout(function () { copy.textContent = c.copy; }, 1000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(item.local).then(done, done);
      } else done();
    });
    var buy = el("a", "buy", c.buy);
    buy.href = V.BUY[item.brand] || V.BUY.ROBI;
    buy.target = "_blank";
    buy.rel = "noopener noreferrer";
    row.appendChild(copy);
    row.appendChild(buy);
    node.appendChild(row);
    return node;
  }

  function paintResults(scroll) {
    var c = t();
    var list = document.getElementById("list");
    var title = document.getElementById("resTitle");
    list.textContent = "";
    if (!state.items.length) {
      title.textContent = c.res;
      list.appendChild(el("p", "empty", state.message || c.empty));
    } else {
      var liveN = state.items.filter(function (item) { return item.live; }).length;
      title.textContent = liveN ? c.resN(liveN) : c.res;
      state.items.forEach(function (item) { list.appendChild(card(item)); });
    }
    document.getElementById("more").hidden = !state.canMore;
    if (scroll) document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addItem(item) {
    if (state.items.some(function (have) { return have.local === item.local; })) return;
    state.items.push(item);
    paintResults(state.items.length === 1);
  }

  function setBusy(on) {
    document.getElementById("go").disabled = on;
    document.getElementById("stop").hidden = !on;
    document.getElementById("progress").hidden = false;
  }

  function paintProg(text, heads) {
    document.getElementById("prog").textContent = text;
    var bar = document.getElementById("bar");
    bar.classList.toggle("ind", !state.items.length);
    var want = +document.getElementById("want").value || 8;
    var liveN = state.items.filter(function (item) { return item.live; }).length;
    bar.style.width = Math.min(100, Math.round((liveN / want) * 100)) + "%";
    document.getElementById("blocks").textContent = heads && heads.length ? t().blocks + ": " + heads.join(" · ") : "";
  }

  var pauseUntil = 0;
  function sleep(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  function checkNumber(local, brand) {
    var attempt = 0;
    function once() {
      var wait = pauseUntil - Date.now();
      return sleep(wait > 0 ? wait : 0).then(function () {
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 12000);
        return fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ msisdn: "88" + local, brand: brand, simCategory: "PREPAID" }),
          cache: "no-store",
          signal: ctrl.signal
        }).then(function (res) {
          clearTimeout(timer);
          if (res.status === 429 || res.status >= 500) {
            pauseUntil = Date.now() + 1200 * (attempt + 1);
            throw new Error("retry");
          }
          if (!res.ok) throw new Error("http");
          return res.json();
        }, function (err) {
          clearTimeout(timer);
          throw err;
        }).then(function (data) {
          return { available: data.available === true, free: data.freeMsisdnList || [] };
        });
      });
    }
    function go() {
      return once().catch(function (err) {
        attempt += 1;
        if (attempt < 3 && err && err.message === "retry") return go();
        if (attempt < 2 && err && err.name === "AbortError") return go();
        throw err;
      });
    }
    return go();
  }

  function loadSeries() {
    if (state.blSeries) return Promise.resolve(state.blSeries);
    return fetch(BL + "/msisdn-series", { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("http");
      return res.json();
    }).then(function (data) {
      var list = ((((data || {}).payload || {}).data || {}).series || []).map(function (row) {
        return String(row.series || "");
      }).filter(function (series) { return /^01\d{3,5}$/.test(series); });
      state.blSeries = list.length ? list : BL_SERIES.slice();
      return state.blSeries;
    }).catch(function () {
      state.blSeries = BL_SERIES.slice();
      return state.blSeries;
    });
  }

  function blJobs(mask) {
    return loadSeries().then(function (series) {
      var prefix = V.fixedPrefix(mask);
      var suffix = V.fixedSuffix(mask);
      var usable = series.filter(function (item) { return V.headOk(item, mask) || V.headOk(prefix, item + "XXXXXXXXXXX"); });
      if (!usable.length) usable = series.filter(function (item) { return V.headOk(item, mask); });
      return usable.map(function (item) {
        var apiPrefix = prefix.length >= item.length && prefix.indexOf(item) === 0 ? prefix : item;
        return { prefix: "88" + apiPrefix, postfix: suffix.length >= 2 && suffix.length <= 6 ? suffix : "" };
      });
    });
  }

  function scanBl(masks, runId) {
    paintProg(t().blWait, []);
    var jobs = [];
    return Promise.all(masks.map(function (item) { return blJobs(item.mask); })).then(function (groups) {
      groups.forEach(function (list, idx) {
        list.forEach(function (job) { jobs.push({ job: job, mask: masks[idx].mask }); });
      });
      var pending = jobs.length;
      if (!pending) return;
      return new Promise(function (resolve) {
        jobs.forEach(function (entry) {
          var url = BL + "/msisdn-inventory?msisdn_prefix=" + encodeURIComponent(entry.job.prefix) +
            "&msisdn_postfix=" + encodeURIComponent(entry.job.postfix) +
            "&show_special_number=false&page_number=1&page_size=20";
          fetch(url, { cache: "no-store" }).then(function (res) {
            if (!res.ok) throw new Error("http");
            return res.json();
          }).then(function (data) {
            if (runId !== state.runId) return;
            var rows = ((((data || {}).payload || {}).data || {}).msisdns || []);
            rows.forEach(function (row) {
              var local = V.localFrom(row.msisdn);
              if (local && V.matches(local, entry.mask)) addItem({ local: local, brand: "BL", live: true });
            });
          }).catch(function () {}).then(function () {
            pending -= 1;
            if (!pending) resolve();
          });
        });
      });
    });
  }

  function showSuggestions(masks) {
    var heads = { GP: ["017", "013"], TT: ["015"] };
    masks.forEach(function (item) {
      var brand = item.brands[0];
      var head = V.fixedPrefix(item.mask);
      if (head.length < 3) head = (heads[brand] || ["017"])[0];
      var total = V.comboCount(item.mask, head.length);
      var step = Math.max(1, Math.floor(total / 8));
      var i;
      for (i = 0; i < Math.min(8, total); i++) {
        var local = V.fill(item.mask, head, (i * step) % total);
        if (V.matches(local, item.mask)) addItem({ local: local, brand: brand, live: false });
      }
    });
    state.message = state.items.length ? "" : t().none;
    paintResults(true);
    paintProg(t().prog(state.items.length, 0), []);
  }

  function start(more) {
    var spec = masksFor();
    var c = t();
    if (!spec.ok) {
      state.message = spec.error === "long" ? c.errLong : spec.error === "prefix" ? c.errPrefix : c.errDigits;
      paintResults(false);
      return;
    }
    if (!more) {
      state.items = [];
      state.message = "";
      state.canMore = false;
      state.scanner = null;
      paintResults(false);
    }
    state.runId += 1;
    var runId = state.runId;
    setBusy(true);
    var liveBrands = [];
    spec.masks.forEach(function (item) {
      item.brands.forEach(function (brand) {
        if ((brand === "ROBI" || brand === "AIRTEL") && liveBrands.indexOf(brand) < 0) liveBrands.push(brand);
      });
    });
    var blMasks = spec.masks.filter(function (item) { return item.brands.indexOf("BL") >= 0; });
    var passive = spec.masks.filter(function (item) { return item.brands[0] === "GP" || item.brands[0] === "TT"; });
    if (passive.length && !liveBrands.length && !blMasks.length) {
      showSuggestions(passive);
      setBusy(false);
      state.canMore = false;
      document.getElementById("more").hidden = true;
      return;
    }
    var want = +document.getElementById("want").value || 8;
    var pending = 0;
    function settle() {
      pending -= 1;
      if (pending > 0 || runId !== state.runId) return;
      setBusy(false);
      if (!state.items.length) state.message = state.netFail ? c.errNet : c.none;
      state.canMore = !!(state.scanner && state.items.filter(function (item) { return item.live; }).length < want);
      paintResults(false);
    }
    if (blMasks.length) {
      pending += 1;
      scanBl(blMasks, runId).then(settle, settle);
    }
    if (liveBrands.length) {
      pending += 1;
      var scanMasks = spec.masks.filter(function (item) {
        return item.brands.indexOf("ROBI") >= 0 || item.brands.indexOf("AIRTEL") >= 0;
      });
      if (!state.scanner) {
        var scanner = V.createScanner({
          masks: scanMasks,
          want: want,
          maxChecks: 120,
          concurrency: 4,
          check: checkNumber,
          onFound: function (hit) {
            if (state.scanner !== scanner) return;
            addItem({ local: hit.local, brand: hit.brand, live: true });
          },
          onProgress: function (snap) {
            if (state.scanner !== scanner) return;
            paintProg(c.prog(snap.checked, snap.found), snap.heads);
            if (snap.errors >= 10) state.netFail = true;
          }
        });
        state.scanner = scanner;
      }
      state.netFail = false;
      state.scanner.run(more ? 80 : 0).then(function () { settle(); });
    }
    if (!pending) settle();
  }

  document.getElementById("langBtn").addEventListener("click", function () {
    setLang(lang() === "bn" ? "en" : "bn");
  });
  document.getElementById("prefix").addEventListener("input", function () {
    state.dual = state.op === "both" && !readPrefix();
    renderChips();
    paintMask();
  });
  document.getElementById("digits").addEventListener("input", paintMask);
  document.getElementById("go").addEventListener("click", function () { start(false); });
  document.getElementById("stop").addEventListener("click", function () {
    state.runId += 1;
    if (state.scanner) state.scanner.stop();
    setBusy(false);
    state.canMore = true;
    document.getElementById("more").hidden = false;
  });
  document.getElementById("more").addEventListener("click", function () { start(true); });
  document.getElementById("digits").addEventListener("keydown", function (event) {
    if (event.key === "Enter") start(false);
  });

  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferred = event;
    document.getElementById("install").hidden = false;
  });
  document.getElementById("install").addEventListener("click", function () {
    if (!deferred) return;
    deferred.prompt();
    deferred = null;
    document.getElementById("install").hidden = true;
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  render();
})();
