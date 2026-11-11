/* Prepaid numbers that are free to buy, from Robi's public list.
   Robi is brand ROBI (018). Airtel/Cirkle is brand AIRTEL (016).
   The sim-services pages also call a same-origin action that wants a
   Cloudflare Turnstile token. This file never sends or strips that token.
   The list itself allows a normal browser call (CORS *), with no login. */
(function () {
  var API = "https://da-api.robi.com.bd/da-nll/free-msisdn/get-msisdn-list";
  var CACHE_KEY = "vip-finder-v1";
  var FAV_KEY = "vip-finder-favs";
  var TTL = 20 * 60 * 1000;
  var OPS = {
    robi: {
      id: "robi",
      brand: "ROBI",
      prefix: "018",
      buy: "https://www.robi.com.bd/en/sim-services?service=prepaid"
    },
    airtel: {
      id: "airtel",
      brand: "AIRTEL",
      prefix: "016",
      buy: "https://cirkle.digital/en/sim-services?service=prepaid"
    }
  };
  var FILTER_TYPES = {
    repeat: ["repeat"],
    sequence: ["sequence"],
    mirror: ["mirror"],
    pair: ["aabb", "abab", "abcabc"],
    lucky: ["lucky"],
    many: ["many"],
    date: ["year", "birthday"]
  };
  var TYPE_LABEL = {
    bn: {
      repeat: "একই অঙ্ক",
      sequence: "ক্রম",
      mirror: "উল্টো",
      aabb: "AABB",
      abab: "ABAB",
      abcabc: "ABCABC",
      lucky: "৭৮৬ / ভাগ্য",
      many: "এক অঙ্ক বেশি",
      year: "সাল",
      birthday: "জন্মদিন",
      plain: "সাধারণ মিল"
    },
    en: {
      repeat: "Repeats",
      sequence: "Sequence",
      mirror: "Mirror",
      aabb: "AABB",
      abab: "ABAB",
      abcabc: "ABCABC",
      lucky: "786 / lucky",
      many: "One digit, many times",
      year: "Year",
      birthday: "Birthday",
      plain: "Plain match"
    }
  };
  var STR = {
    bn: {
      hintContains: "নম্বরের ভিতরে এই অঙ্ক থাকবে। খালি রাখলে এখনকার খালি নম্বর দেখায়।",
      hintEnds: "নম্বর এই অঙ্ক দিয়ে শেষ হবে।",
      hintStarts: "০১৮/০১৬-এর পরে এই অঙ্ক দিয়ে শুরু। পুরো নম্বর লিখলে সেটাই ধরা হয়।",
      hintPattern: "৮ বা ১১ ঘর। * মানে যেকোনো অঙ্ক। যেমন 018**786***",
      badBirthday: "জন্মদিন দিনমাস (১৫০৮) বা দিনমাসসাল (১৫০৮১৯৯৮) দিন।",
      badPattern: "প্যাটার্ন ৮ বা ১১ ঘরের হতে হবে। * যেকোনো অঙ্ক।",
      badDigits: "শুধু অঙ্ক দিন, ১ থেকে ১১টা।",
      opClash: "প্যাটার্নে অপারেটর ঠিক হয়ে গেছে, তাই শুধু সেই অপারেটর দেখা হচ্ছে।",
      searching: "খালি নম্বর দেখা হচ্ছে…",
      progress: "{n}/{m} বার জিজ্ঞেস করা হয়েছে",
      found: "{n}টি আপনার শর্তে মিলেছে",
      none: "এই শর্তে এখন খালি নম্বর মেলেনি। আরেকটু ঢিলে শর্ত, বা নিচের খালি নম্বর দেখুন।",
      idle: "খুঁজুন চাপলে অপারেটরের তালিকা থেকে নম্বর আসবে।",
      more: "আরও দেখা হচ্ছে…",
      error: "তালিকা এই মুহূর্তে সাড়া দিচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
      stopped: "খেঁজা থামানো হয়েছে।",
      copied: "নম্বর কপি হয়েছে",
      copiedBuy: "নম্বর কপি হয়েছে — অপারেটরের পাতায় বসান",
      shareFail: "শেয়ার হয়নি, নম্বর কপি করা হয়েছে",
      favAdded: "পছন্দে রাখা হয়েছে",
      favRemoved: "পছন্দ থেকে সরানো হয়েছে",
      noFav: "এখনো পছন্দের নম্বর নেই। তারার বোতামে রাখুন।",
      score: "স্কোর",
      price: "মূল্য",
      priceMissing: "অপারেটর আলাদা দাম পাঠায় না",
      copy: "কপি",
      share: "শেয়ার",
      fav: "পছন্দ",
      favOn: "পছন্দের",
      buy: "কিনুন",
      recheck: "আবার যাচাই",
      still: "এখনো খালি",
      gone: "এখন খালি নয়",
      unknown: "আগে যাচাই হয়নি",
      results: "ফলাফল",
      title: "ভিআইপি নম্বর খুঁজুন — রবিন",
      shareText: "এই নম্বরটা এখন খালি দেখাচ্ছে"
    },
    en: {
      hintContains: "The number should contain these digits. Leave it empty to see numbers that are free right now.",
      hintEnds: "The number should end with these digits.",
      hintStarts: "After 018/016, the number should start with this. A full number is checked as-is.",
      hintPattern: "8 or 11 places. * is any digit. Example: 018**786***",
      badBirthday: "Use DDMM (1508) or DDMMYYYY (15081998).",
      badPattern: "A pattern needs 8 or 11 places. * is any digit.",
      badDigits: "Digits only, 1 to 11 of them.",
      opClash: "The pattern names the operator, so only that one is searched.",
      searching: "Checking free numbers…",
      progress: "Asked {n} of {m}",
      found: "{n} match your filters",
      none: "Nothing free matches that yet. Loosen it, or look at the other free numbers below.",
      idle: "Press search to read the operator’s free-number list.",
      more: "Looking for more…",
      error: "The list is not answering right now. Try again in a moment.",
      stopped: "Search stopped.",
      copied: "Number copied",
      copiedBuy: "Number copied — paste it on the operator’s page",
      shareFail: "Could not share, so the number was copied",
      favAdded: "Saved to favorites",
      favRemoved: "Removed from favorites",
      noFav: "No favorites yet. Tap the star on a number.",
      score: "Score",
      price: "Price",
      priceMissing: "No separate price from the operator",
      copy: "Copy",
      share: "Share",
      fav: "Save",
      favOn: "Saved",
      buy: "Buy",
      recheck: "Check again",
      still: "Still free",
      gone: "Not free now",
      unknown: "Not checked yet",
      results: "Results",
      title: "VIP Number Finder — Robin",
      shareText: "This number is showing as free"
    }
  };

  var nextAt = 0;
  var run = null;
  var busy = false;
  var revealed = false;
  var lastQuery = null;
  var queue = [];
  var queueIndex = 0;

  function lang() {
    return document.documentElement && document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
  }

  function t(key) {
    return STR[lang()][key] || STR.bn[key] || key;
  }

  function bnDigits(value) {
    return String(value || "").replace(/[০-৯]/g, function (ch) {
      return String("০১২৩৪৫৬৭৮৯".indexOf(ch));
    });
  }

  function digitsOnly(value) {
    return bnDigits(value).replace(/\D/g, "");
  }

  function sleep(ms, signal) {
    return new Promise(function (resolve, reject) {
      if (signal && signal.aborted) {
        reject(abortError());
        return;
      }
      var timer = setTimeout(resolve, ms);
      if (!signal) return;
      signal.addEventListener("abort", function () {
        clearTimeout(timer);
        reject(abortError());
      }, { once: true });
    });
  }

  function abortError() {
    if (typeof DOMException === "function") return new DOMException("aborted", "AbortError");
    var err = new Error("aborted");
    err.name = "AbortError";
    return err;
  }

  function isAbort(err) {
    return err && (err.name === "AbortError" || err.message === "aborted");
  }

  function loadStore() {
    try {
      var raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      if (!raw.checks) raw.checks = {};
      if (!raw.pool) raw.pool = {};
      return raw;
    } catch (e) {
      return { checks: {}, pool: {} };
    }
  }

  function saveStore(store) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(store)); } catch (e) {}
  }

  function prune(store) {
    var now = Date.now();
    Object.keys(store.checks).forEach(function (key) {
      if (now - store.checks[key].at > TTL) delete store.checks[key];
    });
    Object.keys(store.pool).forEach(function (key) {
      if (now - store.pool[key].at > TTL) delete store.pool[key];
    });
    var keys = Object.keys(store.pool);
    if (keys.length > 320) {
      keys.sort(function (a, b) { return store.pool[a].at - store.pool[b].at; });
      keys.slice(0, keys.length - 320).forEach(function (key) { delete store.pool[key]; });
    }
  }

  function loadFavs() {
    try {
      var list = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return Array.isArray(list) ? list.filter(function (n) { return /^01[68]\d{8}$/.test(n); }) : [];
    } catch (e) {
      return [];
    }
  }

  function saveFavs(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function opOf(local) {
    if (String(local).indexOf("018") === 0) return "robi";
    if (String(local).indexOf("016") === 0) return "airtel";
    return null;
  }

  function intlToLocal(raw) {
    var d = digitsOnly(raw);
    if (d.indexOf("880") === 0) d = "0" + d.slice(3);
    else if (d.length === 10 && d.charAt(0) === "1") d = "0" + d;
    return /^01[68]\d{8}$/.test(d) ? d : null;
  }

  function pushType(info, id) {
    if (info.types.indexOf(id) === -1) info.types.push(id);
  }

  function analyze(local, birthday) {
    var d = String(local || "");
    var info = { score: 0, types: [], marks: [] };
    if (!/^01[68]\d{8}$/.test(d)) return info;
    var raw = 0;

    var run = 1;
    for (var i = 1; i <= d.length; i++) {
      if (i < d.length && d.charAt(i) === d.charAt(i - 1)) run += 1;
      else {
        if (run >= 3) {
          var start = i - run;
          info.marks.push([start, i]);
          pushType(info, "repeat");
          raw += run === 3 ? 22 : run === 4 ? 36 : run >= 6 ? 70 : 52;
        }
        run = 1;
      }
    }

    var seqStart = 0;
    var seqLen = 1;
    var dir = 0;
    function flushSeq(end) {
      if (seqLen >= 3) {
        info.marks.push([seqStart, end]);
        pushType(info, "sequence");
        raw += seqLen === 3 ? 18 : seqLen === 4 ? 32 : seqLen >= 6 ? 64 : 48;
      }
    }
    for (var s = 1; s < d.length; s++) {
      var diff = Number(d.charAt(s)) - Number(d.charAt(s - 1));
      if (diff === 1 || diff === -1) {
        if (seqLen === 1) {
          dir = diff;
          seqLen = 2;
        } else if (diff === dir) seqLen += 1;
        else {
          flushSeq(s);
          seqStart = s - 1;
          dir = diff;
          seqLen = 2;
        }
      } else {
        flushSeq(s);
        seqStart = s;
        seqLen = 1;
        dir = 0;
      }
    }
    flushSeq(d.length);

    var body = d.slice(3);
    if (body === body.split("").reverse().join("")) {
      info.marks.push([3, 11]);
      pushType(info, "mirror");
      raw += 48;
    } else {
      var last6 = d.slice(5);
      if (last6 === last6.split("").reverse().join("")) {
        info.marks.push([5, 11]);
        pushType(info, "mirror");
        raw += 24;
      }
    }

    var saw = { aabb: false, abab: false, abcabc: false };
    for (var w = 0; w + 4 <= d.length; w++) {
      var a = d.charAt(w);
      var b = d.charAt(w + 1);
      var c = d.charAt(w + 2);
      var e = d.charAt(w + 3);
      if (!saw.aabb && a === b && c === e && a !== c) {
        saw.aabb = true;
        info.marks.push([w, w + 4]);
        pushType(info, "aabb");
        raw += 28;
      }
      if (!saw.abab && a === c && b === e && a !== b) {
        saw.abab = true;
        info.marks.push([w, w + 4]);
        pushType(info, "abab");
        raw += 28;
      }
    }
    for (var k = 0; k + 6 <= d.length; k++) {
      var left = d.slice(k, k + 3);
      if (!saw.abcabc && left === d.slice(k + 3, k + 6) && new Set(left).size > 1) {
        saw.abcabc = true;
        info.marks.push([k, k + 6]);
        pushType(info, "abcabc");
        raw += 40;
      }
    }

    var lucky = false;
    var from = 0;
    var luckyHits = 0;
    while (from < d.length) {
      var at = d.indexOf("786", from);
      if (at < 0) break;
      lucky = true;
      luckyHits += 1;
      info.marks.push([at, at + 3]);
      raw += luckyHits === 1 ? 34 : 12;
      from = at + 1;
    }
    var at108 = d.indexOf("108");
    if (at108 >= 0) {
      lucky = true;
      info.marks.push([at108, at108 + 3]);
      raw += 12;
    }
    if (/000|111|777|999/.test(d)) {
      lucky = true;
      raw += 8;
    }
    if (lucky) pushType(info, "lucky");

    var counts = {};
    for (var n = 0; n < d.length; n++) counts[d.charAt(n)] = (counts[d.charAt(n)] || 0) + 1;
    var best = 0;
    var bestDigit = "";
    Object.keys(counts).forEach(function (digit) {
      if (counts[digit] > best) {
        best = counts[digit];
        bestDigit = digit;
      }
    });
    if (best >= 5) {
      pushType(info, "many");
      raw += 10 + (best - 5) * 8;
      if (best >= 6) {
        for (var p = 0; p < d.length; p++) if (d.charAt(p) === bestDigit) info.marks.push([p, p + 1]);
      }
    }

    var year = d.match(/19[7-9]\d|20[0-3]\d/);
    if (year) {
      var y = Number(year[0]);
      if (y >= 1970 && y <= 2035) {
        info.marks.push([year.index, year.index + 4]);
        pushType(info, "year");
        raw += 20;
      }
    }

    if (birthday && d.indexOf(birthday) >= 0) {
      var bAt = d.indexOf(birthday);
      info.marks.push([bAt, bAt + birthday.length]);
      pushType(info, "birthday");
      raw += 26;
    }

    info.score = Math.max(0, Math.min(99, raw));
    return info;
  }

  function parseBirthday(raw) {
    var d = digitsOnly(raw);
    if (!d) return "";
    if (d.length !== 4 && d.length !== 6 && d.length !== 8) return { error: true };
    var day = Number(d.slice(0, 2));
    var month = Number(d.slice(2, 4));
    if (day < 1 || day > 31 || month < 1 || month > 12) return { error: true };
    if (d.length === 8) {
      var year = Number(d.slice(4));
      if (year < 1940 || year > 2035) return { error: true };
    }
    return d;
  }

  function parsePattern(raw) {
    var s = bnDigits(raw).toLowerCase().replace(/[x?_]/g, "*").replace(/[^0-9*]/g, "");
    if (!s) return { error: "empty" };
    if (s.length !== 8 && s.length !== 11) return { error: "len" };
    var mask = [];
    for (var i = 0; i < 11; i++) mask.push(null);
    if (s.length === 8) {
      mask[0] = "0";
      mask[1] = "1";
    }
    var offset = s.length === 8 ? 3 : 0;
    for (var c = 0; c < s.length; c++) {
      mask[offset + c] = s.charAt(c) === "*" ? null : s.charAt(c);
    }
    if (mask[0] && mask[0] !== "0") return { error: "len" };
    if (mask[1] && mask[1] !== "1") return { error: "len" };
    if (mask[2] && mask[2] !== "6" && mask[2] !== "8") return { error: "len" };
    return { mask: mask };
  }

  function masksFor(query, op) {
    var prefix = OPS[op].prefix;
    var base = [prefix.charAt(0), prefix.charAt(1), prefix.charAt(2), null, null, null, null, null, null, null, null];
    if (query.mode === "pattern" && query.mask) {
      var mask = query.mask.slice();
      for (var i = 0; i < 3; i++) {
        if (mask[i] == null) mask[i] = prefix.charAt(i);
        else if (mask[i] !== prefix.charAt(i)) return [];
      }
      return [mask];
    }
    var d = query.digits;
    if (!d) {
      if (!query.birthday) return [];
      d = query.birthday;
      return slide(base, d);
    }
    if (query.mode === "ends") {
      if (d.length > 11) return [];
      if (d.length === 11) return d.indexOf(prefix) === 0 ? [d.split("")] : [];
      var endMask = base.slice();
      for (var e = 0; e < d.length; e++) {
        var pos = 11 - d.length + e;
        if (endMask[pos] && endMask[pos] !== d.charAt(e)) return [];
        endMask[pos] = d.charAt(e);
      }
      return [endMask];
    }
    if (query.mode === "starts") {
      var rest = d;
      if (rest.indexOf("880") === 0) rest = "0" + rest.slice(3);
      if (rest.indexOf("01") === 0) {
        if (rest.indexOf(prefix) !== 0) return [];
        rest = rest.slice(3);
      }
      if (rest.length > 8) return [];
      var startMask = base.slice();
      for (var r = 0; r < rest.length; r++) startMask[3 + r] = rest.charAt(r);
      return [startMask];
    }
    if (d.length >= 11) return d.indexOf(prefix) === 0 ? [d.slice(0, 11).split("")] : [];
    return slide(base, d);
  }

  function slide(base, chunk) {
    var masks = [];
    for (var start = 3; start + chunk.length <= 11; start++) {
      var mask = base.slice();
      var ok = true;
      for (var i = 0; i < chunk.length; i++) {
        if (mask[start + i] && mask[start + i] !== chunk.charAt(i)) ok = false;
        mask[start + i] = chunk.charAt(i);
      }
      if (ok) masks.push(mask);
    }
    return masks;
  }

  function freeIndexes(mask) {
    var free = [];
    for (var i = 0; i < mask.length; i++) if (mask[i] == null) free.push(i);
    return free;
  }

  function fromFills(mask, fills) {
    var s = "";
    for (var i = 0; i < 11; i++) {
      var ch = mask[i] != null ? mask[i] : fills[i];
      if (ch == null || !/\d/.test(ch)) return null;
      s += ch;
    }
    return /^01[68]\d{8}$/.test(s) ? s : null;
  }

  function buildCandidates(mask, limit) {
    var free = freeIndexes(mask);
    var found = {};
    function addFills(fills) {
      var local = fromFills(mask, fills);
      if (local) found[local] = true;
    }
    function blank() {
      var fills = {};
      free.forEach(function (i) { fills[i] = "0"; });
      return fills;
    }
    if (!free.length) {
      var only = fromFills(mask, {});
      return only ? [only] : [];
    }
    if (free.length <= 4) {
      var total = Math.pow(10, free.length);
      for (var n = 0; n < total; n++) {
        var fills = {};
        var x = n;
        for (var f = free.length - 1; f >= 0; f--) {
          fills[free[f]] = String(x % 10);
          x = Math.floor(x / 10);
        }
        addFills(fills);
      }
    } else {
      for (var digit = 0; digit <= 9; digit++) {
        var same = {};
        free.forEach(function (i) { same[i] = String(digit); });
        addFills(same);
      }
      var asc = blank();
      var desc = blank();
      free.forEach(function (i, idx) {
        asc[i] = String((idx + 1) % 10);
        desc[i] = String((9 - idx) % 10);
      });
      addFills(asc);
      addFills(desc);
      if (free.length >= 3) {
        for (var offset = 0; offset <= free.length - 3; offset++) {
          var placed = blank();
          "786".split("").forEach(function (ch, idx) { placed[free[offset + idx]] = ch; });
          addFills(placed);
        }
      }
      var mirror = blank();
      var mirrorOk = true;
      for (var m = 0; m < 11; m++) {
        var other = 10 - m;
        if (mask[m] != null && mask[other] != null && mask[m] !== mask[other]) mirrorOk = false;
      }
      if (mirrorOk) {
        free.forEach(function (i) {
          var other = 10 - i;
          if (mask[other] != null) mirror[i] = mask[other];
        });
        addFills(mirror);
      }
      var seed = mask.map(function (ch) { return ch == null ? "*" : ch; }).join("");
      var rnd = 0;
      for (var h = 0; h < seed.length; h++) rnd = (rnd * 33 + seed.charCodeAt(h)) >>> 0;
      for (var sample = 0; sample < 40; sample++) {
        var fills = {};
        free.forEach(function (i) {
          rnd = (rnd * 1664525 + 1013904223) >>> 0;
          fills[i] = String(rnd % 10);
        });
        addFills(fills);
      }
    }
    return Object.keys(found).sort(function (a, b) {
      return analyze(b).score - analyze(a).score || (a < b ? -1 : 1);
    }).slice(0, limit || 8);
  }

  function matchesQuery(local, query) {
    if (query.birthday && local.indexOf(query.birthday) < 0) return false;
    if (query.mode === "pattern") {
      if (!query.mask) return true;
      for (var i = 0; i < 11; i++) {
        if (query.mask[i] != null && local.charAt(i) !== query.mask[i]) return false;
      }
      return true;
    }
    var d = query.digits;
    if (!d) return true;
    if (query.mode === "contains") return local.indexOf(d) >= 0;
    if (query.mode === "ends") return local.slice(-d.length) === d;
    if (query.mode === "starts") {
      var rest = d;
      if (rest.indexOf("880") === 0) rest = "0" + rest.slice(3);
      if (rest.indexOf("01") === 0) return local.indexOf(rest) === 0;
      return local.slice(3, 3 + rest.length) === rest;
    }
    return true;
  }

  function passesFilters(info, filters) {
    if (!filters.length) return true;
    return filters.some(function (filter) {
      var ids = FILTER_TYPES[filter] || [];
      return ids.some(function (id) { return info.types.indexOf(id) >= 0; });
    });
  }

  function wantedOps(query) {
    var ops = query.op === "both" ? ["robi", "airtel"] : [query.op];
    if (query.mode === "pattern" && query.mask && query.mask[2]) {
      var forced = query.mask[2] === "8" ? "robi" : "airtel";
      if (ops.indexOf(forced) === -1) return { ops: [forced], clash: true };
      return { ops: [forced], clash: ops.length > 1 };
    }
    if (query.digits && query.digits.indexOf("018") === 0) return { ops: ["robi"], clash: query.op === "airtel" };
    if (query.digits && query.digits.indexOf("016") === 0) return { ops: ["airtel"], clash: query.op === "robi" };
    return { ops: ops, clash: false };
  }

  function poolEntries() {
    var store = loadStore();
    prune(store);
    saveStore(store);
    return Object.keys(store.pool).map(function (key) {
      var parts = key.split("|");
      return { op: parts[0], local: parts[1], at: store.pool[key].at };
    }).filter(function (item) { return opOf(item.local) === item.op; });
  }

  function remember(op, local, available) {
    var store = loadStore();
    var key = op + "|" + local;
    store.checks[key] = { available: !!available, at: Date.now() };
    if (available) store.pool[key] = { at: Date.now() };
    else delete store.pool[key];
    prune(store);
    saveStore(store);
  }

  function rememberList(op, numbers) {
    var store = loadStore();
    var now = Date.now();
    numbers.forEach(function (local) {
      if (opOf(local) !== op) return;
      var key = op + "|" + local;
      store.pool[key] = { at: now };
      store.checks[key] = { available: true, at: now };
    });
    prune(store);
    saveStore(store);
  }

  async function ask(body, signal) {
    var wait = Math.max(0, nextAt - Date.now());
    if (wait) await sleep(wait, signal);
    if (signal && signal.aborted) throw abortError();
    var res;
    try {
      res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
        referrerPolicy: "no-referrer",
        signal: signal
      });
    } finally {
      nextAt = Date.now() + 450;
    }
    if (!res.ok) throw new Error("http " + res.status);
    var data = await res.json();
    if (!data || !Array.isArray(data.freeMsisdnList)) throw new Error("bad");
    return data;
  }

  function readQuery() {
    var opBtn = document.querySelector("[data-op][aria-pressed='true']");
    var modeBtn = document.querySelector("[data-mode][aria-pressed='true']");
    var filters = [];
    document.querySelectorAll("[data-filter][aria-pressed='true']").forEach(function (btn) {
      filters.push(btn.getAttribute("data-filter"));
    });
    var birthday = parseBirthday(document.getElementById("birthday").value);
    var mode = modeBtn ? modeBtn.getAttribute("data-mode") : "contains";
    var raw = document.getElementById("q").value;
    var query = {
      op: opBtn ? opBtn.getAttribute("data-op") : "both",
      mode: mode,
      filters: filters,
      birthday: "",
      digits: "",
      mask: null,
      error: ""
    };
    if (birthday && birthday.error) {
      query.error = t("badBirthday");
      return query;
    }
    query.birthday = birthday || "";
    if (mode === "pattern") {
      if (!String(raw).trim() && !query.birthday && !filters.length) return query;
      if (!String(raw).trim()) return query;
      var parsed = parsePattern(raw);
      if (parsed.error) {
        query.error = t("badPattern");
        return query;
      }
      query.mask = parsed.mask;
      return query;
    }
    var digits = digitsOnly(raw);
    if (raw && /[^\d\s০-৯]/.test(bnDigits(raw))) {
      query.error = t("badDigits");
      return query;
    }
    if (digits.length > 11) {
      query.error = t("badDigits");
      return query;
    }
    query.digits = digits;
    return query;
  }

  function queryMarks(local, query) {
    var marks = [];
    var chunk = "";
    if (query.mode === "contains" || query.mode === "ends" || query.mode === "starts") chunk = query.digits;
    if (query.birthday) chunk = query.birthday.length > chunk.length ? query.birthday : chunk;
    if (!chunk) return marks;
    var from = 0;
    while (from < local.length) {
      var at = local.indexOf(chunk, from);
      if (at < 0) break;
      marks.push([at, at + chunk.length]);
      from = at + 1;
    }
    return marks;
  }

  function hitSet(marks) {
    var hit = {};
    marks.forEach(function (pair) {
      for (var i = pair[0]; i < pair[1]; i++) hit[i] = true;
    });
    return hit;
  }

  function numberHtml(local, marks) {
    var hit = hitSet(marks);
    var html = "";
    for (var i = 0; i < local.length; i++) {
      if (i === 3) html += " ";
      if (i === 7) html += "-";
      var ch = local.charAt(i);
      html += hit[i] ? "<b>" + ch + "</b>" : ch;
    }
    return html;
  }

  function typeText(info) {
    var labels = TYPE_LABEL[lang()];
    if (!info.types.length) return labels.plain;
    return info.types.map(function (id) { return labels[id] || id; }).join(" · ");
  }

  function card(local, op, extra) {
    var info = analyze(local, lastQuery && lastQuery.birthday);
    var marks = info.marks.slice();
    if (lastQuery) queryMarks(local, lastQuery).forEach(function (pair) { marks.push(pair); });
    var favs = loadFavs();
    var saved = favs.indexOf(local) >= 0;
    var el = document.createElement("article");
    el.className = "card " + op;
    el.innerHTML =
      '<div class="card-top"><span class="pill">' + (op === "robi" ? "Robi · 018" : "Cirkle · 016") + "</span>" +
      '<span class="score">' + t("score") + " " + info.score + "</span></div>" +
      '<p class="num" aria-label="' + local + '">' + numberHtml(local, marks) + "</p>" +
      '<p class="kinds">' + typeText(info) + "</p>" +
      '<p class="price"><strong>' + t("price") + "</strong> · " + t("priceMissing") + "</p>" +
      (extra ? '<p class="kinds">' + extra + "</p>" : "") +
      '<div class="acts">' +
      '<button type="button" class="act" data-copy="' + local + '">' + t("copy") + "</button>" +
      '<button type="button" class="act" data-share="' + local + '">' + t("share") + "</button>" +
      '<button type="button" class="act' + (saved ? " on" : "") + '" data-fav="' + local + '">' + (saved ? t("favOn") : t("fav")) + "</button>" +
      '<a class="act buy" data-buy="' + local + '" href="' + OPS[op].buy + '" target="_blank" rel="noopener noreferrer">' + t("buy") + "</a>" +
      "</div>";
    return el;
  }

  function toast(message) {
    var node = document.getElementById("toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { node.classList.remove("show"); }, 2200);
  }

  function setStatus(message) {
    var node = document.getElementById("status");
    if (node) node.textContent = message;
  }

  function setBar(done, total) {
    var bar = document.getElementById("bar");
    var fill = document.getElementById("barFill");
    if (!bar || !fill) return;
    if (!total) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    fill.style.width = Math.round((done / total) * 100) + "%";
  }

  function renderLists() {
    if (!lastQuery || typeof document === "undefined") return;
    var choice = wantedOps(lastQuery);
    var main = [];
    var other = [];
    poolEntries().forEach(function (item) {
      if (choice.ops.indexOf(item.op) === -1) return;
      var info = analyze(item.local, lastQuery.birthday);
      var row = { local: item.local, op: item.op, score: info.score, info: info };
      if (matchesQuery(item.local, lastQuery) && passesFilters(info, lastQuery.filters)) main.push(row);
      else other.push(row);
    });
    main.sort(sortRow);
    other.sort(sortRow);
    var results = document.getElementById("results");
    var others = document.getElementById("others");
    var otherBlock = document.getElementById("otherBlock");
    var count = document.getElementById("resultCount");
    if (!results) return;
    results.innerHTML = "";
    main.slice(0, 24).forEach(function (row) { results.appendChild(card(row.local, row.op)); });
    if (!main.length) {
      var empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = busy ? t("searching") : t("none");
      results.appendChild(empty);
    }
    if (count) count.textContent = main.length ? String(main.length) : "";
    if (main.length && !revealed) {
      revealed = true;
      var title = document.getElementById("resultTitle");
      if (title) title.scrollIntoView({ block: "start" });
    }
    if (others && otherBlock) {
      others.innerHTML = "";
      var showOther = lastQueryHasPattern() && other.length && main.length < 3;
      otherBlock.hidden = !showOther;
      if (showOther) other.slice(0, 6).forEach(function (row) { others.appendChild(card(row.local, row.op)); });
    }
    renderFavs();
  }

  function lastQueryHasPattern() {
    if (!lastQuery) return false;
    return !!(lastQuery.digits || lastQuery.mask || lastQuery.birthday || lastQuery.filters.length);
  }

  function sortRow(a, b) {
    return b.score - a.score || (a.local < b.local ? -1 : 1);
  }

  function renderFavs() {
    var box = document.getElementById("favs");
    if (!box) return;
    var favs = loadFavs();
    box.innerHTML = "";
    if (!favs.length) {
      var empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = t("noFav");
      box.appendChild(empty);
      return;
    }
    var store = loadStore();
    favs.forEach(function (local) {
      var op = opOf(local);
      var key = op + "|" + local;
      var extra = t("unknown");
      if (store.checks[key] && Date.now() - store.checks[key].at < TTL) {
        extra = store.checks[key].available ? t("still") : t("gone");
      }
      var node = card(local, op, extra);
      var re = document.createElement("button");
      re.type = "button";
      re.className = "act";
      re.setAttribute("data-recheck", local);
      re.textContent = t("recheck");
      node.querySelector(".acts").insertBefore(re, node.querySelector(".buy"));
      box.appendChild(node);
    });
  }

  function hintFor(mode) {
    var node = document.getElementById("hint");
    if (!node) return;
    var key = mode === "ends" ? "hintEnds" : mode === "starts" ? "hintStarts" : mode === "pattern" ? "hintPattern" : "hintContains";
    node.textContent = t(key);
  }

  function fillFromDigits(text) {
    var q = document.getElementById("q");
    if (q) q.value = text;
  }

  function buildQueue(query) {
    var choice = wantedOps(query);
    var list = [];
    var seen = {};
    choice.ops.forEach(function (op) {
      masksFor(query, op).forEach(function (mask) {
        var limit = freeIndexes(mask).length <= 2 ? 6 : 3;
        buildCandidates(mask, limit).forEach(function (local) {
          var key = op + local;
          if (seen[key]) return;
          if (!matchesQuery(local, query)) return;
          if (!passesFilters(analyze(local, query.birthday), query.filters)) return;
          seen[key] = true;
          list.push({ op: op, local: local, kind: "exact" });
        });
      });
    });
    list.sort(function (a, b) {
      return analyze(b.local, query.birthday).score - analyze(a.local, query.birthday).score;
    });
    var samples = [];
    var rounds = list.length ? 2 : 4;
    for (var i = 0; i < rounds; i++) {
      choice.ops.forEach(function (op) { samples.push({ op: op, kind: "sample" }); });
    }
    return { items: samples.concat(list.slice(0, 8)), clash: choice.clash };
  }

  async function step(item, signal) {
    if (item.kind === "sample") {
      var data = await ask({ brand: OPS[item.op].brand, simCategory: "PREPAID" }, signal);
      var locals = data.freeMsisdnList.map(intlToLocal).filter(Boolean);
      rememberList(item.op, locals);
      return;
    }
    var store = loadStore();
    var key = item.op + "|" + item.local;
    if (store.checks[key] && Date.now() - store.checks[key].at < TTL) {
      if (store.checks[key].available) remember(item.op, item.local, true);
      return;
    }
    var checked = await ask({
      msisdn: "88" + item.local,
      brand: OPS[item.op].brand,
      simCategory: "PREPAID"
    }, signal);
    remember(item.op, item.local, checked.available === true);
    var suggested = (checked.freeMsisdnList || []).map(intlToLocal).filter(Boolean);
    rememberList(item.op, suggested);
  }

  async function execute(append) {
    var query = readQuery();
    var field = document.getElementById("q");
    var birth = document.getElementById("birthday");
    if (field) field.classList.toggle("bad", !!query.error && query.mode === "pattern");
    if (birth) birth.classList.toggle("bad", !!query.error && query.error === t("badBirthday"));
    if (query.error) {
      setStatus(query.error);
      return;
    }
    if (run) run.abort();
    var ac = new AbortController();
    run = ac;
    busy = true;
    if (!append) revealed = false;
    lastQuery = query;
    if (!append) writeUrl(query);
    if (!append) {
      var built = buildQueue(query);
      queue = built.items;
      queueIndex = 0;
      setStatus(built.clash ? t("opClash") : t("searching"));
    } else setStatus(t("more"));
    var cachedHits = 0;
    if (!append) {
      var choiceNow = wantedOps(query);
      poolEntries().forEach(function (item) {
        if (choiceNow.ops.indexOf(item.op) === -1) return;
        var info = analyze(item.local, query.birthday);
        if (matchesQuery(item.local, query) && passesFilters(info, query.filters)) cachedHits += 1;
      });
    }
    var batch = append ? 4 : Math.min(cachedHits >= 6 ? 2 : 6, queue.length || 4);
    if (append && queueIndex >= queue.length) {
      var choice = wantedOps(query);
      for (var extra = 0; extra < 2; extra++) {
        choice.ops.forEach(function (op) { queue.push({ op: op, kind: "sample" }); });
      }
    }
    var end = Math.min(queue.length, queueIndex + batch);
    var total = end - queueIndex;
    document.getElementById("go").disabled = true;
    document.getElementById("stop").hidden = false;
    document.getElementById("more").hidden = true;
    var done = 0;
    setBar(0, total);
    renderLists();
    try {
      for (var i = queueIndex; i < end; i++) {
        await step(queue[i], ac.signal);
        queueIndex = i + 1;
        done += 1;
        setBar(done, total);
        setStatus(t("progress").replace("{n}", String(done)).replace("{m}", String(total)));
        renderLists();
      }
      var matched = document.getElementById("results").querySelectorAll(".card").length;
      if (run === ac) setStatus(matched ? t("found").replace("{n}", String(matched)) : t("none"));
    } catch (err) {
      if (run !== ac) return;
      setStatus(isAbort(err) ? t("stopped") : t("error"));
    } finally {
      if (run === ac) {
        run = null;
        busy = false;
        document.getElementById("go").disabled = false;
        document.getElementById("stop").hidden = true;
        document.getElementById("more").hidden = false;
        setBar(0, 0);
        renderLists();
      }
    }
  }

  function writeUrl(query) {
    if (!window.history || !window.history.replaceState) return;
    var params = new URLSearchParams();
    params.set("op", query.op);
    params.set("mode", query.mode);
    if (query.mode === "pattern") params.set("q", document.getElementById("q").value.trim());
    else if (query.digits) params.set("q", query.digits);
    if (query.birthday) params.set("bd", query.birthday);
    if (query.filters.length) params.set("f", query.filters.join(","));
    history.replaceState(null, "", "?" + params.toString());
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      var area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) {}
      area.remove();
      return ok;
    }
  }

  async function recheck(local) {
    var op = opOf(local);
    if (!op) return;
    setStatus(t("searching"));
    try {
      var data = await ask({ msisdn: "88" + local, brand: OPS[op].brand, simCategory: "PREPAID" });
      remember(op, local, data.available === true);
      rememberList(op, (data.freeMsisdnList || []).map(intlToLocal).filter(Boolean));
      setStatus(data.available === true ? t("still") : t("gone"));
      renderLists();
    } catch (e) {
      setStatus(t("error"));
    }
  }

  function applyTitle() {
    document.title = t("title");
  }

  function boot() {
    applyTitle();
    hintFor("contains");
    setStatus(t("idle"));
    renderFavs();
    var params = new URLSearchParams(location.search);
    if (params.get("op")) press("[data-op]", params.get("op"), "data-op");
    if (params.get("mode")) {
      press("[data-mode]", params.get("mode"), "data-mode");
      hintFor(params.get("mode"));
    }
    if (params.get("q")) document.getElementById("q").value = params.get("q");
    if (params.get("bd")) document.getElementById("birthday").value = params.get("bd");
    if (params.get("f")) {
      params.get("f").split(",").forEach(function (id) {
        var btn = document.querySelector('[data-filter="' + id + '"]');
        if (btn) btn.setAttribute("aria-pressed", "true");
      });
    }
    document.getElementById("search").addEventListener("submit", function (event) {
      event.preventDefault();
      execute(false);
    });
    document.getElementById("stop").addEventListener("click", function () {
      if (run) run.abort();
    });
    document.getElementById("more").addEventListener("click", function () {
      execute(true);
    });
    document.querySelector("[data-lang-toggle]").addEventListener("click", function () {
      var next = lang() === "bn" ? "en" : "bn";
      document.documentElement.setAttribute("data-lang", next);
      document.documentElement.lang = next;
      try { localStorage.setItem("robin-lang", next); } catch (e) {}
      applyTitle();
      var modeBtn = document.querySelector("[data-mode][aria-pressed='true']");
      hintFor(modeBtn ? modeBtn.getAttribute("data-mode") : "contains");
      renderLists();
      if (!lastQuery) setStatus(t("idle"));
      else {
        var matched = document.querySelectorAll("#results .card").length;
        setStatus(matched ? t("found").replace("{n}", String(matched)) : t("none"));
      }
    });
    document.body.addEventListener("click", function (event) {
      var op = event.target.closest("[data-op]");
      if (op) { pressGroup(op, "[data-op]"); return; }
      var mode = event.target.closest("[data-mode]");
      if (mode) {
        pressGroup(mode, "[data-mode]");
        hintFor(mode.getAttribute("data-mode"));
        var input = document.getElementById("q");
        input.placeholder = mode.getAttribute("data-mode") === "pattern" ? "018**786***" : "786";
        return;
      }
      var filter = event.target.closest("[data-filter]");
      if (filter) {
        filter.setAttribute("aria-pressed", filter.getAttribute("aria-pressed") === "true" ? "false" : "true");
        if (lastQuery) {
          lastQuery = readQuery();
          renderLists();
        }
        return;
      }
      var example = event.target.closest("[data-example]");
      if (example) {
        var spec = example.getAttribute("data-example");
        var bits = spec.split(":");
        press("[data-mode]", bits[0] === "browse" ? "contains" : bits[0], "data-mode");
        hintFor(bits[0] === "browse" ? "contains" : bits[0]);
        fillFromDigits(bits[0] === "browse" ? "" : bits.slice(1).join(":"));
        if (bits[0] === "browse") {
          document.querySelectorAll("[data-filter]").forEach(function (btn) {
            btn.setAttribute("aria-pressed", "false");
          });
        }
        execute(false);
        return;
      }
      var copyBtn = event.target.closest("[data-copy]");
      if (copyBtn) {
        copyText(copyBtn.getAttribute("data-copy")).then(function () { toast(t("copied")); });
        return;
      }
      var shareBtn = event.target.closest("[data-share]");
      if (shareBtn) {
        shareNumber(shareBtn.getAttribute("data-share"));
        return;
      }
      var favBtn = event.target.closest("[data-fav]");
      if (favBtn) {
        toggleFav(favBtn.getAttribute("data-fav"));
        return;
      }
      var buy = event.target.closest("[data-buy]");
      if (buy) {
        copyText(buy.getAttribute("data-buy")).then(function (ok) { if (ok) toast(t("copiedBuy")); });
        return;
      }
      var again = event.target.closest("[data-recheck]");
      if (again) recheck(again.getAttribute("data-recheck"));
    });
    if (params.get("q") || params.get("go") === "1") execute(false);
  }

  function pressGroup(btn, selector) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.setAttribute("aria-pressed", node === btn ? "true" : "false");
    });
  }

  function press(selector, value, attr) {
    var btn = document.querySelector(selector + "[" + attr + '="' + value + '"]');
    if (btn) pressGroup(btn, selector);
  }

  function toggleFav(local) {
    var favs = loadFavs();
    var at = favs.indexOf(local);
    if (at >= 0) {
      favs.splice(at, 1);
      toast(t("favRemoved"));
    } else {
      favs.unshift(local);
      toast(t("favAdded"));
    }
    saveFavs(favs.slice(0, 80));
    renderLists();
  }

  async function shareNumber(local) {
    var url = location.origin + location.pathname + "?op=" + (opOf(local) || "both") + "&mode=contains&q=" + local + "&go=1";
    var text = local + " — " + t("shareText");
    if (navigator.share) {
      try {
        await navigator.share({ title: t("title"), text: text, url: url });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    var ok = await copyText(local + "\n" + url);
    toast(ok ? t("copied") : t("shareFail"));
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  var api = {
    analyze: analyze,
    parseBirthday: parseBirthday,
    parsePattern: parsePattern,
    masksFor: masksFor,
    buildCandidates: buildCandidates,
    matchesQuery: matchesQuery,
    passesFilters: passesFilters,
    intlToLocal: intlToLocal,
    wantedOps: wantedOps,
    digitsOnly: digitsOnly
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
