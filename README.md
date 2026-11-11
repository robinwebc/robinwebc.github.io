# robinwebc.github.io

Personal site for [Robin](https://github.com/robinwebc), a web and Android developer from Bangladesh, plus a separate page for the Payzma test app (payzma.com).

GitHub Pages serves this repository from the `main` branch, root folder. There is no build step: the site is plain HTML, CSS, and JavaScript. `.nojekyll` is present so Pages publishes the files as they are.

| Path | Page |
| --- | --- |
| `/` | Robin’s profile, in English by default, with a Bangla toggle |
| `/payzma/` | Payzma, with its own navy and blue layout |
| `/payzma/privacy/` | Payzma privacy policy |
| `/daqbank/` | Redirects to `/payzma/` |
| `/vip-number/` | VIP number finder. Bangla by default, with its own English toggle |

Payzma is a global online banking app in **test mode**. It is not live, and it is not a licensed bank. Account IDs look like PM123456789. Wallets are multi-currency, with USD as the main balance.

The download button opens the latest GitHub release:

`https://github.com/robinwebc/robinwebc.github.io/releases/latest`

Until a build is attached there, the Payzma page says it is coming soon. `/daqbank/` and `/daqbank/privacy/` redirect to the Payzma pages.

English is the default on the profile and Payzma. Language choice is stored in `localStorage` under `robin-lang` (`en` or `bn`). In English, the language button reads বাংলা. The personal page also stores `robin-theme` (`light` or `dark`). The WhatsApp link stays `https://wa.me/` until `WHATSAPP_NUMBER` in `js/home.js` is filled in.

## VIP number finder

`/vip-number/` searches numbers an operator is offering for sale. It does not sell SIMs, take payment, or store a name or NID. Favorites stay in `localStorage` under `vip-number-favs`. This page opens in Bangla (`vip-lang`) unless you switch it. The switch also writes `robin-lang`.

Banglalink’s order page (`https://banglalink.net/en/order-new-sim`) calls a public inventory list. The browser calls that same URL directly. It allows any site (`Access-Control-Allow-Origin: *`), so no proxy is required:

`https://web-api.banglalink.net/api/gateway/d2d-service/api/v1/channel/msisdn-inventory`

The page also reads `msisdn-series` and `products/new_sim` from that channel. Searches are spaced by about half a second and remembered for a few minutes.

Robi, Cirkle (the new name of Airtel Bangladesh), and Grameenphone are shown with a link to the official shop:

- Robi’s number list is the `fetchAvailaleSimList` server action on `robi.com.bd`. Without a Cloudflare Turnstile token the action returns `captchaFailed`. The token is locked to Robi’s domain. This tool does not bypass it.
- `bd.airtel.com` now sends people to `cirkle.digital`. The SIM page is `/sim-services`. From this network that URL is rejected by Cirkle’s firewall, so there is no public search call to use. It is the same company web stack as Robi.
- Grameenphone’s shop posts to `https://bkshopthc.grameenphone.com/api/v1/sim/get-list`. No login is required, and it returns a small stock batch (not a digit search). The response only allows the origin `https://www.grameenphone.com`.

To add Grameenphone stock to this page, deploy `vip-number/proxy` as a Cloudflare Worker:

1. Create a free Cloudflare account.
2. From `vip-number/proxy`, run `npx wrangler login` and then `npx wrangler deploy`.
3. Put the `workers.dev` URL in `GP_PROXY` at the top of `vip-number/js/app.js` and publish the site again. You can also paste it into the Grameenphone card to try it in your own browser first.

The worker caches for a minute, allows 12 calls a minute per IP, and returns the mobile number only. It does not forward IMSI or other stock fields.
