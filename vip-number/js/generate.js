/* Client-side VIP number generator. Numbers from here are pattern suggestions,
   never an availability claim. */
(function (root) {
  var PREFIXES = {
    all: ["013", "017", "018", "016", "019", "014", "015"],
    gp: ["013", "017"],
    robi: ["018"],
    cirkle: ["016"],
    bl: ["019", "014"],
    tt: ["015"]
  };
  var OF = {
    "013": "gp",
    "017": "gp",
    "018": "robi",
    "016": "cirkle",
    "019": "bl",
    "014": "bl",
    "015": "tt"
  };
  var PRESET_IDS = ["repeat", "sequence", "mirror", "abab", "aabb", "xyyx", "triple", "pairs", "lucky", "year"];

  function prefixesFor(op) {
    return (PREFIXES[op] || PREFIXES.all).slice();
  }

  function operatorOf(national) {
    return OF[String(national || "").slice(0, 3)] || "";
  }

  function isNational(n) {
    return /^01[3-9]\d{8}$/.test(n) && !!OF[n.slice(0, 3)];
  }

  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = "0" + s;
    return s;
  }

  function uniq(list) {
    var seen = Object.create(null);
    var out = [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (seen[list[i]]) continue;
      seen[list[i]] = 1;
      out.push(list[i]);
    }
    return out;
  }

  function emptyCursor() {
    return {
      next: function () { return []; },
      done: function () { return true; }
    };
  }

  function arrayCursor(list) {
    var i = 0;
    return {
      next: function (k) {
        var out = list.slice(i, i + k);
        i += out.length;
        return out;
      },
      done: function () { return i >= list.length; }
    };
  }

  function materialize(prefix, mask, wild) {
    var out = prefix.split("");
    var w = 0;
    var i;
    for (i = 3; i < 11; i++) {
      if (mask.charAt(i) === "X") out.push(wild.charAt(w++));
      else out.push(mask.charAt(i));
    }
    return out.join("");
  }

  function wildCount(mask) {
    var n = 0;
    var i;
    for (i = 3; i < 11; i++) if (mask.charAt(i) === "X") n += 1;
    return n;
  }

  function matchingPrefixes(mask, prefixes) {
    return prefixes.filter(function (p) {
      var i;
      for (i = 0; i < 3; i++) {
        var bit = mask.charAt(i);
        if (bit !== "X" && bit !== p.charAt(i)) return false;
      }
      return true;
    });
  }

  function cheap(s) {
    var score = 0;
    if (/(\d)\1\1\1/.test(s)) score += 50;
    else if (/(\d)\1\1/.test(s)) score += 24;
    if (s.indexOf("786") >= 0) score += 40;
    if (/199\d|20[0-2]\d/.test(s)) score += 28;
    if (/1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/.test(s)) score += 26;
    var u = Object.create(null);
    var i;
    for (i = 0; i < s.length; i++) u[s.charAt(i)] = 1;
    score += (8 - Object.keys(u).length) * 4;
    if (s === s.split("").reverse().join("")) score += 18;
    return score;
  }

  var fillerCache = {};

  function richFillers(len) {
    var out = [];
    function add(s) {
      if (s && s.length === len && /^\d+$/.test(s)) out.push(s);
    }
    var d;
    var a;
    var b;
    var y;
    var i;
    for (d = 0; d <= 9; d++) add(String(d).repeat(len));
    ["0123456789", "9876543210", "1234567890", "6789012345"].forEach(function (src) {
      if (src.length >= len) {
        add(src.slice(0, len));
        add(src.slice(src.length - len));
      }
    });
    if (len >= 3) {
      add(("786" + "00000000").slice(0, len));
      add(("00000000786").slice(-len));
      add(("786786786786").slice(0, len));
    }
    if (len >= 4) {
      for (y = 1990; y <= 2025; y++) {
        var ys = String(y);
        if (len === 4) add(ys);
        else {
          add((ys + "00000000").slice(0, len));
          add(("00000000" + ys).slice(-len));
          add((ys + ys).slice(0, len));
        }
      }
      for (a = 0; a <= 9; a++) {
        for (b = 0; b <= 9; b++) {
          if (a === b) continue;
          var abab = "" + a + b + a + b;
          var aabb = "" + a + a + b + b;
          var baab = "" + a + b + b + a;
          [abab, aabb, baab].forEach(function (motif) {
            if (len === 4) add(motif);
            else if (len === 8) {
              add(motif + motif);
              add(motif + "0000");
              add("0000" + motif);
              add(motif.slice(0, 2).repeat(4));
            } else {
              add((motif + "00000000").slice(0, len));
              add(("00000000" + motif).slice(-len));
            }
          });
        }
      }
    }
    if (len === 8) {
      for (i = 0; i < 10000; i++) {
        var half = pad(i, 4);
        add(half + half.split("").reverse().join(""));
        add(half[0] + half[0] + half[1] + half[1] + half[2] + half[2] + half[3] + half[3]);
      }
    } else if (len === 6) {
      for (i = 0; i < 1000; i++) {
        var h3 = pad(i, 3);
        add(h3 + h3.split("").reverse().join(""));
      }
    } else if (len === 4) {
      for (i = 0; i < 100; i++) {
        var h2 = pad(i, 2);
        add(h2 + h2.split("").reverse().join(""));
      }
    }
    return uniq(out);
  }

  function topFillers(len, limit) {
    var key = String(len) + ":" + String(limit);
    if (fillerCache[key]) return fillerCache[key];
    var list = richFillers(len);
    list.sort(function (a, b) { return cheap(b) - cheap(a) || (a < b ? -1 : 1); });
    if (list.length > limit) list = list.slice(0, limit);
    fillerCache[key] = list;
    return list;
  }

  function maskCursor(mask, prefixes) {
    var prefs = matchingPrefixes(mask, prefixes);
    if (!prefs.length) return emptyCursor();
    var free = wildCount(mask);
    if (free === 0) {
      return arrayCursor(uniq(prefs.map(function (p) { return materialize(p, mask, ""); }).filter(isNational)));
    }
    var space = prefs.length * Math.pow(10, free);
    if (space <= 12000) {
      var all = [];
      var max = Math.pow(10, free);
      prefs.forEach(function (p) {
        var n;
        for (n = 0; n < max; n++) {
          var num = materialize(p, mask, pad(n, free));
          if (isNational(num)) all.push(num);
        }
      });
      all = uniq(all);
      all.sort(function (a, b) {
        return root.VipScore.analyze(b, "").score - root.VipScore.analyze(a, "").score || (a < b ? -1 : 1);
      });
      return arrayCursor(all);
    }
    var fillers = topFillers(free, 800);
    var seeds = [];
    fillers.forEach(function (fill) {
      prefs.forEach(function (p) {
        var num = materialize(p, mask, fill);
        if (isNational(num) && root.VipScore.matchesMask(num, mask)) seeds.push(num);
      });
    });
    seeds = uniq(seeds);
    seeds.sort(function (a, b) {
      return cheap(b.slice(3)) - cheap(a.slice(3)) || (a < b ? -1 : 1);
    });
    if (seeds.length > 2400) seeds = seeds.slice(0, 2400);
    var seen = Object.create(null);
    var si = 0;
    var pi = 0;
    var n = 0;
    var maxN = Math.pow(10, free);
    seeds.forEach(function (num) { seen[num] = 1; });
    return {
      next: function (k) {
        var out = [];
        while (out.length < k && si < seeds.length) out.push(seeds[si++]);
        var guard = 0;
        while (out.length < k && pi < prefs.length && guard < 20000) {
          guard += 1;
          if (n >= maxN) {
            n = 0;
            pi += 1;
            continue;
          }
          var num = materialize(prefs[pi], mask, pad(n, free));
          n += 1;
          if (!isNational(num) || seen[num]) continue;
          seen[num] = 1;
          out.push(num);
        }
        return out;
      },
      done: function () { return si >= seeds.length && pi >= prefs.length; }
    };
  }

  function compileMask(mode, digits) {
    var d = String(digits || "");
    if (mode === "ends") return "X".repeat(11 - d.length) + d;
    if (mode === "starts") return d + "X".repeat(11 - d.length);
    return "";
  }

  function containsCursor(digits, prefixes) {
    var masks = [];
    var start;
    for (start = 0; start <= 11 - digits.length; start++) {
      var chars = "XXXXXXXXXXX".split("");
      var i;
      for (i = 0; i < digits.length; i++) chars[start + i] = digits.charAt(i);
      var mask = chars.join("");
      if (matchingPrefixes(mask, prefixes).length) masks.push(mask);
    }
    if (!masks.length) return emptyCursor();
    return chainCursors(masks.map(function (mask) { return maskCursor(mask, prefixes); }));
  }

  function chainCursors(cursors) {
    var seen = Object.create(null);
    var index = 0;
    return {
      next: function (k) {
        var out = [];
        var guard = 0;
        while (out.length < k && index < cursors.length && guard < 40) {
          guard += 1;
          var part = cursors[index].next(k - out.length);
          var i;
          for (i = 0; i < part.length; i++) {
            if (seen[part[i]]) continue;
            seen[part[i]] = 1;
            out.push(part[i]);
            if (out.length >= k) break;
          }
          if (!part.length || cursors[index].done()) {
            if (cursors[index].done()) index += 1;
            else break;
          }
        }
        return out;
      },
      done: function () { return index >= cursors.length; }
    };
  }

  function lazyCursor(factory) {
    var real = null;
    function get() {
      if (!real) real = factory();
      return real;
    }
    return {
      next: function (k) { return get().next(k); },
      done: function () { return !!real && real.done(); }
    };
  }

  function repeatChar(ch, n) {
    var s = "";
    while (s.length < n) s += ch;
    return s;
  }

  function place(base, motif, start) {
    var arr = base.split("");
    var i;
    for (i = 0; i < motif.length && start + i < arr.length; i++) arr[start + i] = motif.charAt(i);
    return arr.join("");
  }

  function catalog(id) {
    var tails = [];
    var d;
    var len;
    var start;
    var a;
    var b;
    var fills = ["00000000", "11111111", "77777777", "88888888", "12345678", "98765432", "67896789", "11223344"];
    if (id === "repeat" || id === "triple") {
      var lens = id === "repeat" ? [4, 5, 6, 7, 8] : [3, 4];
      for (d = 0; d <= 9; d++) {
        var ch = String(d);
        lens.forEach(function (run) {
          for (start = 0; start <= 8 - run; start++) {
            fills.forEach(function (fill) {
              if (fill.charAt(0) === ch && run < 8) return;
              tails.push(place(fill, repeatChar(ch, run), start));
            });
            tails.push(place(repeatChar(ch === "0" ? "1" : "0", 8), repeatChar(ch, run), start));
          }
        });
        tails.push(repeatChar(ch, 8));
      }
    } else if (id === "sequence") {
      for (len = 4; len <= 8; len++) {
        var s0;
        for (s0 = 0; s0 + len - 1 <= 9; s0++) {
          var up = "";
          var down = "";
          var i;
          for (i = 0; i < len; i++) {
            up += String(s0 + i);
            down += String(s0 + len - 1 - i);
          }
          [up, down].forEach(function (motif) {
            for (start = 0; start <= 8 - len; start++) {
              fills.forEach(function (fill) { tails.push(place(fill, motif, start)); });
            }
          });
        }
      }
    } else if (id === "mirror") {
      var n;
      for (n = 0; n < 10000; n++) {
        var half = pad(n, 4);
        var tail = half + half.split("").reverse().join("");
        if (!/^(\d)\1+$/.test(tail)) tails.push(tail);
      }
    } else if (id === "pairs") {
      for (n = 0; n < 10000; n++) {
        var h = pad(n, 4);
        if (h.charAt(0) === h.charAt(1) && h.charAt(1) === h.charAt(2) && h.charAt(2) === h.charAt(3)) continue;
        tails.push(h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]);
      }
    } else if (id === "abab" || id === "aabb" || id === "xyyx") {
      for (a = 0; a <= 9; a++) {
        for (b = 0; b <= 9; b++) {
          if (a === b) continue;
          var motif = id === "abab" ? "" + a + b + a + b : id === "aabb" ? "" + a + a + b + b : "" + a + b + b + a;
          fills.forEach(function (fill) {
            for (start = 0; start <= 4; start++) tails.push(place(fill, motif, start));
          });
          tails.push(motif + motif);
        }
      }
    } else if (id === "lucky") {
      var alpha = ["0", "7", "8", "6", "9"];
      for (start = 0; start <= 5; start++) {
        var count = Math.pow(alpha.length, 5);
        var step = count > 800 ? 5 : 1;
        for (n = 0; n < count; n += step) {
          var rest = [];
          var x = n;
          var k;
          for (k = 0; k < 5; k++) {
            rest.push(alpha[x % alpha.length]);
            x = Math.floor(x / alpha.length);
          }
          var arr = rest.slice();
          arr.splice(start, 0, "7", "8", "6");
          tails.push(arr.join(""));
        }
      }
      tails.push("78678678", "00786786", "78600786", "11111786", "78678600");
    } else if (id === "year") {
      var y;
      for (y = 1990; y <= 2025; y++) {
        var ys = String(y);
        for (start = 0; start <= 4; start++) {
          ["0000", "1111", "7777", "7860", "1234", "6789", ys].forEach(function (fill) {
            var arr = (fill + "0000").slice(0, 4).split("");
            var tail = "00000000".split("");
            var i;
            for (i = 0; i < 4; i++) tail[start + i] = ys.charAt(i);
            var fi = 0;
            for (i = 0; i < 8; i++) {
              if (i < start || i >= start + 4) tail[i] = arr[fi++] || "0";
            }
            tails.push(tail.join(""));
          });
        }
      }
    }
    tails = uniq(tails).filter(function (t) { return t.length === 8 && /^\d{8}$/.test(t); });
    tails.sort(function (a, b) { return cheap(b) - cheap(a) || (a < b ? -1 : 1); });
    if (tails.length > 2500) tails = tails.slice(0, 2500);
    return tails;
  }

  var catalogCache = {};
  function tailsFor(id) {
    if (!catalogCache[id]) catalogCache[id] = catalog(id);
    return catalogCache[id];
  }

  function presetCursor(ids, prefixes, digits, digitMode) {
    var cursors = ids.map(function (id) {
      var tails = tailsFor(id);
      var ti = 0;
      var pi = 0;
      return {
        next: function (k) {
          var out = [];
          var guard = 0;
          while (out.length < k && ti < tails.length && guard < 20000) {
            guard += 1;
            var num = prefixes[pi] + tails[ti];
            pi += 1;
            if (pi >= prefixes.length) {
              pi = 0;
              ti += 1;
            }
            if (!isNational(num)) continue;
            if (!root.VipScore.hasPreset(num, id)) continue;
            if (digits) {
              if (digitMode === "ends" && num.slice(-digits.length) !== digits) continue;
              else if (digitMode === "starts" && num.indexOf(digits) !== 0) continue;
              else if (digitMode !== "ends" && digitMode !== "starts" && num.indexOf(digits) < 0) continue;
            }
            out.push(num);
          }
          return out;
        },
        done: function () { return ti >= tails.length; }
      };
    });
    return cursors.length === 1 ? cursors[0] : chainCursors(cursors);
  }

  function createCursor(spec) {
    var prefixes = prefixesFor(spec.op).filter(function (p) { return !!OF[p]; });
    var digits = root.VipScore.digitsOnly(spec.digits || "");
    if (spec.mode === "pattern") {
      var ids = (spec.presets || []).filter(function (id) { return PRESET_IDS.indexOf(id) >= 0; });
      if (!ids.length) return emptyCursor();
      return presetCursor(ids, prefixes, digits, "contains");
    }
    if (spec.mode === "mask") {
      var parsed = root.VipScore.parseMask(spec.mask || "");
      if (!parsed.ok) return emptyCursor();
      return maskCursor(parsed.mask, prefixes);
    }
    if (!digits) return emptyCursor();
    var fancy = presetCursor(PRESET_IDS, prefixes, digits, spec.mode);
    if (spec.mode === "contains") {
      return chainCursors([fancy, lazyCursor(function () { return containsCursor(digits, prefixes); })]);
    }
    var mask = compileMask(spec.mode, digits);
    if (mask.length !== 11) return emptyCursor();
    return chainCursors([fancy, lazyCursor(function () { return maskCursor(mask, prefixes); })]);
  }

  root.VipGen = {
    PREFIXES: PREFIXES,
    PRESET_IDS: PRESET_IDS,
    prefixesFor: prefixesFor,
    operatorOf: operatorOf,
    isNational: isNational,
    createCursor: createCursor
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
