# robinwebc.github.io

Personal site for [Robin](https://github.com/robinwebc), a web and Android developer from Bangladesh, plus a VIP number finder.

GitHub Pages serves this repository from the `main` branch, root folder. There is no build step: the site is plain HTML, CSS, and JavaScript. `.nojekyll` is present so Pages publishes the files as they are.

| Path | Page |
| --- | --- |
| `/` | Robin’s profile, in English by default, with a Bangla toggle |
| `/vip/` | Live VIP scan. Bangla by default, installable. Shows a number only when an operator check says it is free |
| `/vip-number/` | VIP number finder. Bangla by default, installable |

English is the default on the profile. Language choice is stored in `localStorage` under `robin-lang` (`en` or `bn`). In English, the language button reads বাংলা. The page also stores `robin-theme` (`light` or `dark`). The WhatsApp link stays `https://wa.me/` until `WHATSAPP_NUMBER` in `js/home.js` is filled in.

## Live VIP scan

`/vip/` is a separate page from `/vip-number/`. It follows three steps: pick an operator and a code such as `018`, `01815`, or `016`; pick where the digits sit (start, middle, or end) and preview a mask such as `0181X-XX5555`; then scan several number blocks at once. A Robi or Airtel row appears only when `https://da-api.robi.com.bd/da-nll/free-msisdn/get-msisdn-list` returns `available: true`, or lists that exact number in `freeMsisdnList`. The browser can call it directly (`Access-Control-Allow-Origin: *`). No Turnstile token is required for this endpoint. Each row links to that operator’s own SIM page.

Banglalink uses the same public inventory as `/vip-number/` (`msisdn-inventory` on `web-api.banglalink.net`). Grameenphone’s shop does not allow this site’s origin, and Teletalk’s online SIM page requires sign-in, so those two stay pattern suggestions with a link to the official page. They are never labelled available.

The page does not sell SIMs, take payment, or store a name or NID. Language is Bangla unless `vip-live-lang` says otherwise. The switch also writes `robin-lang`. A manifest and service worker make it installable. The worker caches the app shell only.

## VIP number finder

`/vip-number/` builds 11-digit numbers for Grameenphone (017/013), Robi (018), Airtel/Cirkle (016), Banglalink (019/014), and Teletalk (015). Search by ending digits, digits inside the number, or a starting prefix. Pattern presets cover repeats (0000/7777), sequences (1234/6789), mirrors, ABAB, AABB, XYYX, triples and quads, double pairs, 786, and years 1990–2025. A custom mask uses `X` as a wildcard (`01X-XX77-77XX`).

There is no account and no daily search cap. Favorites stay in `localStorage` under `vip-number-favs`. Recent searches stay under `vip-number-history`. The page opens in Bangla (`vip-lang`) unless you switch it. The switch also writes `robin-lang`. A manifest and service worker make it installable. The worker caches the app shell only, not operator answers.

A number is marked on sale only when a live operator response includes it. Everything else is labelled a pattern suggestion and links to that operator’s own page.

- **Banglalink is live.** The finder calls the same public inventory the order page uses (`https://banglalink.net/en/order-new-sim`). The browser can read `https://web-api.banglalink.net/api/gateway/d2d-service/api/v1/channel/msisdn-inventory` directly (`Access-Control-Allow-Origin: *`). It also reads `msisdn-series` from that channel.
- **Grameenphone is suggestions only.** The shop list at `bkshopthc.grameenphone.com` does not allow this site’s origin.
- **Robi is suggestions only.** Its number list needs a Cloudflare Turnstile token locked to `robi.com.bd`. This tool does not bypass that.
- **Airtel/Cirkle is suggestions only.** There is no public number search this page can read. The button opens `https://cirkle.digital/en/sim-services`.
- **Teletalk is suggestions only.** Choosing a number on the official online SIM page requires sign-in. This tool does not log in or scrape it. The button opens `https://sim.teletalk.com.bd:8443/`.

The finder does not sell SIMs, take payment, or store a name or NID. It is not affiliated with the operators. Names are text only.
