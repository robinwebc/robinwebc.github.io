# robinwebc.github.io

Personal site for [Robin](https://github.com/robinwebc), a web and Android developer from Bangladesh, plus a VIP number finder.

GitHub Pages serves this repository from the `main` branch, root folder. There is no build step: the site is plain HTML, CSS, and JavaScript. `.nojekyll` is present so Pages publishes the files as they are.

| Path | Page |
| --- | --- |
| `/` | Robin’s profile, in English by default, with a Bangla toggle |
| `/vip/` | Live VIP scan. Bangla by default, installable. Shows a number only when an operator check says it is free |

English is the default on the profile. Language choice is stored in `localStorage` under `robin-lang` (`en` or `bn`). In English, the language button reads বাংলা. The page also stores `robin-theme` (`light` or `dark`). The WhatsApp link stays `https://wa.me/` until `WHATSAPP_NUMBER` in `js/home.js` is filled in.

## Live VIP scan

`/vip/` follows three steps: pick an operator and a code such as `018`, `01815`, or `016`; pick where the digits sit (start, middle, or end) and preview a mask such as `0181X-XX5555`; then scan several number blocks at once. A Robi or Airtel row appears only when `https://da-api.robi.com.bd/da-nll/free-msisdn/get-msisdn-list` returns `available: true`, or lists that exact number in `freeMsisdnList`. The browser can call it directly (`Access-Control-Allow-Origin: *`). No Turnstile token is required for this endpoint. Each row links to that operator’s own SIM page.

Banglalink uses its public inventory (`msisdn-inventory` on `web-api.banglalink.net`). Grameenphone’s shop does not allow this site’s origin, and Teletalk’s online SIM page requires sign-in, so those two stay pattern suggestions with a link to the official page. They are never labelled available.

The page does not sell SIMs, take payment, or store a name or NID. Language is Bangla unless `vip-live-lang` says otherwise. The switch also writes `robin-lang`. A manifest and service worker make it installable. The worker caches the app shell only.
