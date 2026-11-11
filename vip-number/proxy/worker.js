/**
 * Optional proxy for Grameenphone's public SIM-stock list.
 * The shop page posts to this API, but the response CORS header only
 * allows https://www.grameenphone.com. GitHub Pages cannot read it directly.
 *
 * This worker forwards that one public call, caches it, rate-limits,
 * and returns mobile numbers only. IMSI and other stock fields are dropped.
 *
 * Deploy: see the comment block in vip-number/js/app.js and the README.
 */
var UPSTREAM = "https://bkshopthc.grameenphone.com/api/v1/sim/get-list";
var ALLOWED = {
  "https://robinwebc.github.io": true,
  "http://127.0.0.1:8080": true,
  "http://localhost:8080": true
};
var HITS = new Map();

function cors(request, response) {
  var origin = request.headers.get("Origin") || "";
  var headers = new Headers(response.headers);
  if (ALLOWED[origin]) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Cache-Control", "public, max-age=60");
  return new Response(response.body, { status: response.status, headers: headers });
}

function limited(ip) {
  var now = Date.now();
  var recent = (HITS.get(ip) || []).filter(function (t) { return now - t < 60000; });
  if (recent.length >= 12) {
    HITS.set(ip, recent);
    return true;
  }
  recent.push(now);
  HITS.set(ip, recent);
  return false;
}

function keepNumber(value) {
  var text = String(value || "");
  return /^01[37]\d{8}$/.test(text) ? text : "";
}

export default {
  async fetch(request) {
    var url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return cors(request, new Response(null, { status: 204 }));
    }
    if (url.pathname !== "/gp/numbers") {
      return cors(request, new Response(JSON.stringify({ ok: false, error: "not-found" }), { status: 404 }));
    }
    if (request.method !== "POST") {
      return cors(request, new Response(JSON.stringify({ ok: false, error: "method" }), { status: 405 }));
    }

    var ip = request.headers.get("CF-Connecting-IP") || "local";
    if (limited(ip)) {
      return cors(request, new Response(JSON.stringify({ ok: false, error: "rate" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      }));
    }

    var body;
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }
    var nid = Number(body.nid);
    var district = String(body.district || "Dhaka").trim();
    if (!Number.isInteger(nid) || nid < 1 || nid > 9999 || !/^[A-Za-z][A-Za-z .'-]{1,39}$/.test(district)) {
      return cors(request, new Response(JSON.stringify({ ok: false, error: "bad-input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    }

    var cache = caches.default;
    var cacheKey = new Request("https://vip-number-cache.local/gp/" + nid + "/" + district.toLowerCase());
    var cached = await cache.match(cacheKey);
    if (cached) return cors(request, cached);

    var upstream;
    try {
      upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://www.grameenphone.com",
          Referer: "https://www.grameenphone.com/bn/shop/devices/sim",
          lang: "en"
        },
        body: JSON.stringify({ nid: nid, district: district })
      });
    } catch (e) {
      return cors(request, new Response(JSON.stringify({ ok: false, error: "upstream" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      }));
    }

    var payload = {};
    try {
      payload = await upstream.json();
    } catch (e) {
      payload = {};
    }
    var rows = Array.isArray(payload.data) ? payload.data : [];
    var numbers = [];
    var seen = {};
    rows.forEach(function (row) {
      [row && row.sim_number, row && row.sim_number_2].forEach(function (value) {
        var number = keepNumber(value);
        if (!number || seen[number]) return;
        seen[number] = true;
        numbers.push({ number: number, zone: row.zone || district });
      });
    });

    var response = new Response(JSON.stringify({ ok: true, nid: nid, district: district, numbers: numbers }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    if (upstream.ok) {
      await cache.put(cacheKey, response.clone());
    }
    return cors(request, response);
  }
};
