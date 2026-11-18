/* Live VIP scan. Candidates are only shown after Robi/Airtel's public
   availability check says so. Nothing here is a guess. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VipLive = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var BN = "০১২৩৪৫৬৭৮৯";

  var BUY = {
    ROBI: "https://www.robi.com.bd/bn/sim-services?requestType=NEW",
    AIRTEL: "https://cirkle.digital/bn/sim-services?requestType=NEW",
    BL: "https://banglalink.net/en/order-new-sim",
    GP: "https://www.grameenphone.com/bn/shop/devices/sim",
    TT: "https://sim.teletalk.com.bd:8443/"
  };

  /* Blocks where the public check has recently returned free numbers.
     The scan still re-ranks these from each response's free list. */
  var FALLBACK_HEADS = {
    ROBI: ["018227", "018224", "018223", "018225", "018226", "018221"],
    AIRTEL: ["016120", "016130", "016140", "016126", "016107", "016139"]
  };

  function toEn(value) {
    return String(value || "").replace(/[০-৯]/g, function (ch) {
      var n = BN.indexOf(ch);
      return n < 0 ? ch : String(n);
    });
  }

  function digits(value) {
    return toEn(value).replace(/\D/g, "");
  }

  function repeat(ch, n) {
    var s = "";
    while (s.length < n) s += ch;
    return s;
  }

  function buildMask(prefix, pos, pattern) {
    prefix = digits(prefix);
    pattern = digits(pattern);
    if (prefix.length < 3 || prefix.length > 9) return { ok: false, error: "prefix" };
    if (!pattern || pattern.length > 8) return { ok: false, error: "digits" };
    if (prefix.length + pattern.length > 11) return { ok: false, error: "long" };
    var free = 11 - prefix.length - pattern.length;
    var mask;
    if (pos === "start") mask = prefix + pattern + repeat("X", free);
    else if (pos === "mid") {
      var left = Math.floor(free / 2);
      mask = prefix + repeat("X", left) + pattern + repeat("X", free - left);
    } else mask = prefix + repeat("X", free) + pattern;
    if (mask.length !== 11) return { ok: false, error: "long" };
    return { ok: true, mask: mask, prefix: prefix, pattern: pattern, pos: pos || "end", free: free };
  }

  function matches(local, mask) {
    if (!local || !mask || local.length !== 11 || mask.length !== 11) return false;
    var i;
    for (i = 0; i < 11; i++) {
      if (mask.charAt(i) !== "X" && mask.charAt(i) !== local.charAt(i)) return false;
    }
    return true;
  }

  function preview(mask) {
    return mask.slice(0, 5) + "-" + mask.slice(5);
  }

  function headOk(head, mask) {
    if (!head || head.length > 11) return false;
    var i;
    for (i = 0; i < head.length; i++) {
      var bit = mask.charAt(i);
      if (bit !== "X" && bit !== head.charAt(i)) return false;
    }
    return true;
  }

  function comboCount(mask, headLen) {
    var n = 1;
    var i;
    for (i = headLen; i < 11; i++) if (mask.charAt(i) === "X") n *= 10;
    return n;
  }

  function fill(mask, head, index) {
    var chars = mask.split("");
    var i;
    for (i = 0; i < head.length && i < 11; i++) chars[i] = head.charAt(i);
    var xs = [];
    for (i = head.length; i < 11; i++) if (mask.charAt(i) === "X") xs.push(i);
    var rest = index;
    for (i = xs.length - 1; i >= 0; i--) {
      chars[xs[i]] = String(rest % 10);
      rest = Math.floor(rest / 10);
    }
    return chars.join("");
  }

  function localFrom(msisdn) {
    var s = String(msisdn || "");
    if (s.indexOf("880") === 0 && s.length >= 13) return "0" + s.slice(3, 13);
    if (/^01\d{9}$/.test(s)) return s;
    return "";
  }

  function brandOf(local) {
    if (local.indexOf("018") === 0) return "ROBI";
    if (local.indexOf("016") === 0) return "AIRTEL";
    if (local.indexOf("019") === 0 || local.indexOf("014") === 0) return "BL";
    if (local.indexOf("017") === 0 || local.indexOf("013") === 0) return "GP";
    if (local.indexOf("015") === 0) return "TT";
    return "";
  }

  function fixedPrefix(mask) {
    var i = 0;
    while (i < mask.length && mask.charAt(i) !== "X") i += 1;
    return mask.slice(0, i);
  }

  function fixedSuffix(mask) {
    var i = mask.length;
    while (i > 0 && mask.charAt(i - 1) !== "X") i -= 1;
    return mask.slice(i);
  }

  function createScanner(options) {
    var masks = options.masks || [];
    var want = options.want || 8;
    var maxChecks = options.maxChecks || 220;
    var concurrency = options.concurrency || 4;
    var check = options.check;
    var onFound = options.onFound || function () {};
    var onProgress = options.onProgress || function () {};
    var learned = { ROBI: Object.create(null), AIRTEL: Object.create(null) };
    var found = Object.create(null);
    var seen = Object.create(null);
    var foundN = 0;
    var checked = 0;
    var errors = 0;
    var stopped = false;
    var running = false;
    var lanes = [];
    var brandChecks = { ROBI: 0, AIRTEL: 0 };
    var focus = { ROBI: "", AIRTEL: "" };

    function accepts(local, brand) {
      var i;
      for (i = 0; i < masks.length; i++) {
        if (masks[i].brands.indexOf(brand) >= 0 && matches(local, masks[i].mask)) return true;
      }
      return false;
    }

    function add(local, brand, via) {
      if (!local || found[local] || !accepts(local, brand)) return false;
      found[local] = 1;
      foundN += 1;
      onFound({ local: local, brand: brand, via: via });
      return true;
    }

    function learn(msisdn) {
      var local = localFrom(msisdn);
      if (!/^01[68]\d{8}$/.test(local)) return;
      var brand = brandOf(local);
      if (brand !== "ROBI" && brand !== "AIRTEL") return;
      var head = local.slice(0, 6);
      learned[brand][head] = (learned[brand][head] || 0) + 1;
    }

    function weight(brand, head) {
      var fb = FALLBACK_HEADS[brand] || [];
      var idx = fb.indexOf(head);
      var base = idx >= 0 ? 40 - idx : 0;
      return base + (learned[brand][head] || 0) * 3;
    }

    function ranked(brand, mask) {
      var scores = Object.create(null);
      (FALLBACK_HEADS[brand] || []).forEach(function (head, n) {
        if (headOk(head, mask)) scores[head] = 40 - n;
      });
      Object.keys(learned[brand]).forEach(function (head) {
        if (head.length === 6 && headOk(head, mask)) {
          scores[head] = (scores[head] || 0) + learned[brand][head] * 3;
        }
      });
      return Object.keys(scores).sort(function (a, b) {
        return scores[b] - scores[a] || (a < b ? -1 : 1);
      }).slice(0, 6);
    }

    function syncLanes() {
      var i;
      var j;
      for (i = 0; i < masks.length; i++) {
        for (j = 0; j < masks[i].brands.length; j++) {
          var brand = masks[i].brands[j];
          if (brand !== "ROBI" && brand !== "AIRTEL") continue;
          ranked(brand, masks[i].mask).forEach(function (head) {
            var id = brand + "|" + head + "|" + masks[i].mask;
            if (lanes.some(function (lane) { return lane.id === id; })) return;
            lanes.push({
              id: id,
              brand: brand,
              head: head,
              mask: masks[i].mask,
              i: 0,
              total: comboCount(masks[i].mask, head.length)
            });
          });
        }
      }
    }

    function openBrands() {
      var out = [];
      lanes.forEach(function (lane) {
        if (lane.i < lane.total && out.indexOf(lane.brand) < 0) out.push(lane.brand);
      });
      return out;
    }

    function take() {
      var guard = 0;
      while (guard < 80) {
        guard += 1;
        syncLanes();
        var brands = openBrands();
        if (!brands.length) return null;
        brands.sort(function (a, b) {
          return (brandChecks[a] || 0) - (brandChecks[b] || 0);
        });
        var advanced = false;
        var b;
        for (b = 0; b < brands.length; b++) {
          var brand = brands[b];
          var open = lanes.filter(function (lane) {
            return lane.brand === brand && lane.i < lane.total;
          });
          if (!open.length) continue;
          open.sort(function (a, c) {
            return weight(c.brand, c.head) - weight(a.brand, a.head) || a.i - c.i;
          });
          if (!focus[brand]) focus[brand] = open[0].head;
          var stuck = lanes.filter(function (lane) {
            return lane.brand === brand && lane.head === focus[brand] && lane.i < lane.total;
          })[0];
          var lane = stuck && stuck.i < Math.min(48, stuck.total) ? stuck : open[0];
          var local = fill(lane.mask, lane.head, lane.i);
          lane.i += 1;
          advanced = true;
          if (seen[local] || !matches(local, lane.mask)) continue;
          seen[local] = 1;
          brandChecks[brand] = (brandChecks[brand] || 0) + 1;
          return { local: local, brand: brand, head: lane.head };
        }
        if (!advanced) return null;
      }
      return null;
    }

    function snapshot() {
      var heads = [];
      lanes.forEach(function (lane) {
        if (lane.i > 0 && heads.indexOf(lane.head) < 0) heads.push(lane.head);
      });
      return { checked: checked, found: foundN, heads: heads.slice(0, 8), errors: errors, stopped: stopped };
    }

    function runPool() {
      var active = 0;
      var settled = false;
      return new Promise(function (resolve) {
        function finish() {
          if (settled || active > 0) return;
          settled = true;
          running = false;
          resolve(snapshot());
        }
        function step() {
          if (stopped || foundN >= want || checked >= maxChecks) {
            finish();
            return;
          }
          var job = take();
          if (!job) {
            finish();
            return;
          }
          checked += 1;
          active += 1;
          onProgress(snapshot());
          Promise.resolve()
            .then(function () { return check(job.local, job.brand); })
            .then(function (data) {
              errors = 0;
              if (data && data.available === true) add(job.local, job.brand, "check");
              var list = (data && data.free) || [];
              var n;
              for (n = 0; n < list.length; n++) {
                learn(list[n]);
                var loc = localFrom(list[n]);
                if (!loc) continue;
                add(loc, brandOf(loc), "list");
              }
            })
            .catch(function () {
              errors += 1;
              if (errors >= 10) stopped = true;
            })
            .then(function () {
              active -= 1;
              onProgress(snapshot());
              step();
            });
        }
        var i;
        for (i = 0; i < concurrency; i++) {
          (function (delay) { setTimeout(step, delay); })(i * 70);
        }
      });
    }

    function run(extraMax) {
      if (running) return Promise.resolve(snapshot());
      if (extraMax) maxChecks += extraMax;
      stopped = false;
      running = true;
      onProgress(snapshot());
      return runPool();
    }

    function stop() {
      stopped = true;
    }

    return { run: run, stop: stop, snapshot: snapshot };
  }

  return {
    BN: BN,
    BUY: BUY,
    FALLBACK_HEADS: FALLBACK_HEADS,
    toEn: toEn,
    digits: digits,
    buildMask: buildMask,
    matches: matches,
    preview: preview,
    headOk: headOk,
    comboCount: comboCount,
    fill: fill,
    localFrom: localFrom,
    brandOf: brandOf,
    fixedPrefix: fixedPrefix,
    fixedSuffix: fixedSuffix,
    createScanner: createScanner
  };
});
