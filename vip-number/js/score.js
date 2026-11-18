/* VIP patterns for an 11-digit Bangladeshi mobile number (01XXXXXXXXX). */
(function (root) {
  var TAGS = ["repeat", "sequence", "mirror", "aabb", "abab", "xyyx", "pairs", "lucky", "many", "year"];

  function bnDigits(value) {
    return String(value || "").replace(/[০-৯]/g, function (ch) {
      return String("০১২৩৪৫৬৭৮৯".indexOf(ch));
    });
  }

  function digitsOnly(value) {
    return bnDigits(value).replace(/\D/g, "");
  }

  function analyze(national, birthday) {
    var d = digitsOnly(national);
    var tags = {};
    var score = 0;
    var hi = null;

    function add(start, end, points, tag) {
      if (end <= start || points <= 0) return;
      score += points;
      tags[tag] = true;
      if (!hi || points > hi.points || (points === hi.points && end - start > hi.end - hi.start)) {
        hi = { start: start, end: end, points: points, tag: tag };
      }
    }

    var n = d.length;
    var run = 1;
    var i;
    for (i = 1; i <= n; i++) {
      if (i < n && d.charAt(i) === d.charAt(i - 1)) run += 1;
      else {
        if (run >= 3) add(i - run, i, run >= 4 ? 28 + (run - 4) * 10 : 16, "repeat");
        run = 1;
      }
    }

    var seq = 1;
    var dir = 0;
    for (i = 1; i <= n; i++) {
      var diff = i < n ? Number(d.charAt(i)) - Number(d.charAt(i - 1)) : 99;
      if ((diff === 1 || diff === -1) && (seq === 1 || diff === dir)) {
        if (seq === 1) dir = diff;
        seq += 1;
      } else {
        if (seq >= 4) add(i - seq, i, 18 + (seq - 4) * 8, "sequence");
        if (diff === 1 || diff === -1) {
          dir = diff;
          seq = 2;
        } else {
          seq = 1;
          dir = 0;
        }
      }
    }

    var from = 0;
    while (from < n) {
      var at = d.indexOf("786", from);
      if (at < 0) break;
      add(at, at + 3, 36, "lucky");
      from = at + 3;
    }

    var bestMirror = null;
    var len;
    var s;
    for (len = 4; len <= 8; len++) {
      for (s = 0; s + len <= n; s++) {
        var slice = d.slice(s, s + len);
        if (/^(.)\1+$/.test(slice)) continue;
        if (slice === slice.split("").reverse().join("")) {
          if (!bestMirror || len > bestMirror.len) bestMirror = { s: s, len: len };
        }
      }
    }
    if (bestMirror) add(bestMirror.s, bestMirror.s + bestMirror.len, 12 + bestMirror.len * 3, "mirror");

    for (s = 0; s + 4 <= n; s++) {
      var a = d.charAt(s);
      var b = d.charAt(s + 1);
      var c = d.charAt(s + 2);
      var e = d.charAt(s + 3);
      if (a === b && c === e && a !== c) add(s, s + 4, 22, "aabb");
      if (a === c && b === e && a !== b) add(s, s + 4, 22, "abab");
      if (a === e && b === c && a !== b) add(s, s + 4, 22, "xyyx");
    }

    var pairDigits = {};
    var pairCount = 0;
    for (s = 0; s + 1 < n; s++) {
      if (d.charAt(s) === d.charAt(s + 1)) pairDigits[d.charAt(s)] = true;
    }
    for (var key in pairDigits) pairCount += 1;
    if (pairCount >= 2) add(0, n, 18, "pairs");

    var counts = {};
    for (i = 0; i < n; i++) counts[d.charAt(i)] = (counts[d.charAt(i)] || 0) + 1;
    var bestCount = 0;
    for (key in counts) if (counts[key] > bestCount) bestCount = counts[key];
    if (bestCount >= 5) add(0, n, (bestCount - 4) * 6, "many");

    var yearRe = /(?:199\d|20[0-2]\d)/g;
    var yearMatch;
    while ((yearMatch = yearRe.exec(d))) {
      var year = Number(yearMatch[0]);
      if (year >= 1990 && year <= 2025) add(yearMatch.index, yearMatch.index + 4, 24, "year");
    }

    var birth = digitsOnly(birthday);
    if (birth.length >= 4 && birth.length <= 8) {
      var born = d.indexOf(birth);
      if (born >= 0) add(born, born + birth.length, 20 + birth.length, "year");
    }

    var tagList = [];
    for (i = 0; i < TAGS.length; i++) if (tags[TAGS[i]]) tagList.push(TAGS[i]);
    return { score: score, tags: tagList, hi: hi, national: d };
  }

  function tail(national) {
    return digitsOnly(national).slice(3);
  }

  function hasRepeat(national) {
    return /(\d)\1\1\1/.test(digitsOnly(national));
  }

  function hasTriple(national) {
    return /(\d)\1\1/.test(digitsOnly(national));
  }

  function hasSequence(national) {
    var d = digitsOnly(national);
    var best = 1;
    var run = 1;
    var dir = 0;
    var i;
    for (i = 1; i < d.length; i++) {
      var diff = Number(d.charAt(i)) - Number(d.charAt(i - 1));
      if ((diff === 1 || diff === -1) && (run === 1 || diff === dir)) {
        if (run === 1) dir = diff;
        run += 1;
        if (run > best) best = run;
      } else if (diff === 1 || diff === -1) {
        dir = diff;
        run = 2;
        if (run > best) best = run;
      } else {
        run = 1;
        dir = 0;
      }
    }
    return best >= 4;
  }

  function hasMirror(national) {
    var d = tail(national);
    if (d.length === 8 && d === d.split("").reverse().join("") && !/^(\d)\1+$/.test(d)) return true;
    return false;
  }

  function hasMotif(national, kind) {
    var d = digitsOnly(national);
    var s;
    for (s = 0; s + 4 <= d.length; s++) {
      var a = d.charAt(s);
      var b = d.charAt(s + 1);
      var c = d.charAt(s + 2);
      var e = d.charAt(s + 3);
      if (kind === "abab" && a === c && b === e && a !== b) return true;
      if (kind === "aabb" && a === b && c === e && a !== c) return true;
      if (kind === "xyyx" && a === e && b === c && a !== b) return true;
    }
    return false;
  }

  function hasPairs(national) {
    var d = tail(national);
    var m = d.match(/^(\d)\1(\d)\2(\d)\3(\d)\4$/);
    if (!m) return false;
    var seen = {};
    var i;
    for (i = 1; i <= 4; i++) seen[m[i]] = true;
    return Object.keys(seen).length >= 2;
  }

  function hasLucky(national) {
    return digitsOnly(national).indexOf("786") >= 0;
  }

  function hasYear(national) {
    var d = digitsOnly(national);
    var re = /(?:199\d|20[0-2]\d)/g;
    var match;
    while ((match = re.exec(d))) {
      var year = Number(match[0]);
      if (year >= 1990 && year <= 2025) return true;
    }
    return false;
  }

  function hasPreset(national, id) {
    if (id === "repeat") return hasRepeat(national);
    if (id === "sequence") return hasSequence(national);
    if (id === "mirror") return hasMirror(national);
    if (id === "abab" || id === "aabb" || id === "xyyx") return hasMotif(national, id);
    if (id === "triple") return hasTriple(national);
    if (id === "pairs") return hasPairs(national);
    if (id === "lucky") return hasLucky(national);
    if (id === "year") return hasYear(national);
    return false;
  }

  function tier(score) {
    if (score >= 70) return "platinum";
    if (score >= 40) return "gold";
    if (score >= 18) return "silver";
    return "standard";
  }

  function parseMask(raw) {
    var text = bnDigits(raw).toUpperCase().replace(/[x×*？?_]/g, "X");
    text = text.replace(/[\s-]/g, "").replace(/[^0-9X]/g, "");
    if (text.indexOf("880") === 0) text = "0" + text.slice(3);
    else if (text.indexOf("88") === 0 && text.charAt(2) === "1") text = "0" + text.slice(2);
    if (text.length !== 11) return { ok: false, reason: "length" };
    if (text.charAt(0) !== "0" && text.charAt(0) !== "X") return { ok: false, reason: "start" };
    if (text.charAt(1) !== "1" && text.charAt(1) !== "X") return { ok: false, reason: "start" };
    return { ok: true, mask: text };
  }

  function matchesMask(national, mask) {
    var d = digitsOnly(national);
    var i;
    if (d.length !== 11 || !mask || mask.length !== 11) return false;
    for (i = 0; i < 11; i++) {
      if (mask.charAt(i) !== "X" && mask.charAt(i) !== d.charAt(i)) return false;
    }
    return true;
  }

  root.VipScore = {
    bnDigits: bnDigits,
    digitsOnly: digitsOnly,
    analyze: analyze,
    hasPreset: hasPreset,
    tier: tier,
    parseMask: parseMask,
    matchesMask: matchesMask
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
