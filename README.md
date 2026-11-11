# robinwebc.github.io

Personal site for [Robin](https://github.com/robinwebc), a web and Android developer from Bangladesh, plus a separate page for the Payzma test app (payzma.com).

GitHub Pages serves this repository from the `main` branch, root folder. There is no build step: the site is plain HTML, CSS, and JavaScript. `.nojekyll` is present so Pages publishes the files as they are.

| Path | Page |
| --- | --- |
| `/` | Robin’s profile, in English by default, with a Bangla toggle |
| `/payzma/` | Payzma, with its own navy and blue layout |
| `/payzma/privacy/` | Payzma privacy policy |
| `/daqbank/` | Redirects to `/payzma/` |
| `/vip-number/` | VIP Number Finder for Robi (018) and Airtel/Cirkle (016). Bangla by default |

VIP Number Finder reads Robi’s public prepaid free-number list (`https://da-api.robi.com.bd/da-nll/free-msisdn/get-msisdn-list`). Robi is brand `ROBI`. Airtel, now Cirkle, is brand `AIRTEL` on the same list. The browser is allowed to call it directly, so the page is static and does not use a proxy. It does not log in, and it does not send or remove the Cloudflare Turnstile token used by the operators’ own sim-services pages. Each search makes a few requests, then keeps the answers in `localStorage` for about 20 minutes. Favorites stay on the phone under `vip-finder-favs`. The list does not include a price. Buying opens Robi or Cirkle’s own prepaid page.

Payzma is a global online banking app in **test mode**. It is not live, and it is not a licensed bank. Account IDs look like PM123456789. Wallets are multi-currency, with USD as the main balance.

The download button opens the latest GitHub release:

`https://github.com/robinwebc/robinwebc.github.io/releases/latest`

Until a build is attached there, the Payzma page says it is coming soon. `/daqbank/` and `/daqbank/privacy/` redirect to the Payzma pages.

English is the default. Language choice is stored in `localStorage` under `robin-lang` (`en` or `bn`) and follows you between the two parts of the site. In English, the language button reads বাংলা. The personal page also stores `robin-theme` (`light` or `dark`). The WhatsApp link stays `https://wa.me/` until `WHATSAPP_NUMBER` in `js/home.js` is filled in.
