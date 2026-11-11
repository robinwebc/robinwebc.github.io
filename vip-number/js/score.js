/* VIP patterns for an 11-digit Bangladeshi mobile number (01XXXXXXXXX). */
(function (root) {
  var TAGS = ["repeat", "sequence", "mirror", "aabb", "abab", "abcabc", "lucky", "many", "birthday", "year"];

  function bnDigits(value) {
    return String(value || "").replace(/[০-৯]/g, function (ch) {
      return String("০১২৩৪৫৬৭৮৯".indexOf(ch));
    });
  }

  function digitsOnly(value) {
    return bnDigits(value).replace(/\D/g, "");
  }

  function longestRun(mask) {
    var best = "";
    var cur = "";
    var i;
    for (i = 0; i < mask.length; i++) {
      if (mask.charAt(i) >= "0" && mask.charAt(i) <= "9") {
        cur += mask.charAt(i);
        if (cur.length > best.length) best = cur;
      } else {
        cur = "";
      }
    }
    return best.slice(0, 6);
  }

  function parsePattern(raw) {
    var text = bnDigits(raw).replace(/[\s-]/g, "").replace(/[xX?_]/g, "*");
    text = text.replace(/[^0-9*]/g, "");
    if (text.indexOf("880") === 0) text = "0" + text.slice(3);
    else if (text.indexOf("88") === 0 && text.charAt(2) === "1") text = "0" + text.slice(2);

    var op = "";
    var mask = "";
    if (text.length === 11) {
      op = text.slice(0, 3);
      mask = text.slice(3);
      if (!/^01[0-9]$/.test(op)) return { ok: false, reason: "op" };
    } else if (text.length === 8) {
      mask = text;
    } else {
      return { ok: false, reason: "length" };
    }
    if (!/^[*0-9]{8}$/.test(mask)) return { ok: false, reason: "chars" };
    var lead = 0;
    while (lead < mask.length && mask.charAt(lead) !== "*") lead += 1;
    return {
      ok: true,
      op: op,
      mask: mask,
      lead: mask.slice(0, lead),
      probe: longestRun(mask.slice(lead)) || longestRun(mask)
    };
  }

  function matchesMask(national, parsed) {
    if (!parsed || !parsed.ok) return false;
    if (parsed.op && national.slice(0, 3) !== parsed.op) return false;
    var sub = national.slice(3);
    var i;
    for (i = 0; i < 8; i++) {
      if (parsed.mask.charAt(i) !== "*" && parsed.mask.charAt(i) !== sub.charAt(i)) return false;
    }
    return true;
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
        if (run >= 3) add(i - run, i, run * run * 6, "repeat");
        run = 1;
      }
    }

    var seq = 1;
    var dir = 0;
    for (i = 1; i <= n; i++) {
      var diff = i < n ? Number(d.charAt(i)) - Number(d.charAt(i - 1)) : 99;
      if (diff === 1 || diff === -1) {
        if (seq === 1) {
          dir = diff;
          seq = 2;
        } else if (diff === dir) seq += 1;
        else {
          if (seq >= 3) add(i - seq, i, seq * seq * 4, "sequence");
          dir = diff;
          seq = 2;
        }
      } else {
        if (seq >= 3) add(i - seq, i, seq * seq * 4, "sequence");
        seq = 1;
        dir = 0;
      }
    }

    var at = d.indexOf("786");
    if (at >= 0) add(at, at + 3, 70, "lucky");

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
    if (bestMirror) add(bestMirror.s, bestMirror.s + bestMirror.len, 18 + bestMirror.len * 6, "mirror");

    for (s = 0; s + 4 <= n; s++) {
      var a = d.charAt(s);
      var b = d.charAt(s + 1);
      var c = d.charAt(s + 2);
      var e = d.charAt(s + 3);
      if (a === b && c === e && a !== c) add(s, s + 4, 36, "aabb");
      if (a === c && b === e && a !== b) add(s, s + 4, 34, "abab");
    }
    for (s = 0; s + 6 <= n; s++) {
      var left = d.slice(s, s + 3);
      var right = d.slice(s + 3, s + 6);
      if (left === right && !/^(.)\1\1$/.test(left)) add(s, s + 6, 48, "abcabc");
    }

    var counts = {};
    for (i = 0; i < n; i++) counts[d.charAt(i)] = (counts[d.charAt(i)] || 0) + 1;
    var bestDigit = "";
    var bestCount = 0;
    var key;
    for (key in counts) {
      if (counts[key] > bestCount) {
        bestCount = counts[key];
        bestDigit = key;
      }
    }
    if (bestCount >= 4) {
      add(d.indexOf(bestDigit), d.lastIndexOf(bestDigit) + 1, (bestCount - 3) * 12, "many");
    }

    var yearRe = /(?:19[7-9]\d|20[0-2]\d)/g;
    var yearMatch;
    while ((yearMatch = yearRe.exec(d))) {
      add(yearMatch.index, yearMatch.index + 4, 22, "year");
    }

    var birth = digitsOnly(birthday);
    if (birth.length === 4 || birth.length === 6 || birth.length === 8) {
      var born = d.indexOf(birth);
      if (born >= 0) add(born, born + birth.length, 36 + birth.length, "birthday");
    }

    var tagList = [];
    for (i = 0; i < TAGS.length; i++) {
      if (tags[TAGS[i]]) tagList.push(TAGS[i]);
    }
    return { score: score, tags: tagList, hi: hi, national: d };
  }

  function passesFilters(result, selected) {
    var keys = [];
    var name;
    for (name in selected) if (selected[name]) keys.push(name);
    if (!keys.length) return true;
    var have = {};
    var t;
    for (t = 0; t < result.tags.length; t++) have[result.tags[t]] = true;
    for (t = 0; t < keys.length; t++) {
      if (have[keys[t]]) return true;
    }
    return false;
  }

  root.VipScore = {
    bnDigits: bnDigits,
    digitsOnly: digitsOnly,
    longestRun: longestRun,
    parsePattern: parsePattern,
    matchesMask: matchesMask,
    analyze: analyze,
    passesFilters: passesFilters
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
