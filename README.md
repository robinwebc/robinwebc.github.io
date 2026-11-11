# robinwebc.github.io

Personal site for [Robin](https://github.com/robinwebc), a web and Android developer from Bangladesh, plus a separate page for the Payzma test app (payzma.com).

GitHub Pages serves this repository from the `main` branch, root folder. There is no build step: the site is plain HTML, CSS, and JavaScript. `.nojekyll` is present so Pages publishes the files as they are.

| Path | Page |
| --- | --- |
| `/` | Robin’s profile, in English by default, with a Bangla toggle |
| `/payzma/` | Payzma, with its own navy and blue layout |
| `/payzma/privacy/` | Payzma privacy policy |
| `/daqbank/` | Redirects to `/payzma/` |

Payzma is a global online banking app in **test mode**. It is not live, and it is not a licensed bank. Account IDs look like PM123456789. Wallets are multi-currency, with USD as the main balance.

The download button opens the latest GitHub release:

`https://github.com/robinwebc/robinwebc.github.io/releases/latest`

Until a build is attached there, the Payzma page says it is coming soon. `/daqbank/` and `/daqbank/privacy/` redirect to the Payzma pages.

English is the default. Language choice is stored in `localStorage` under `robin-lang` (`en` or `bn`) and follows you between the two parts of the site. In English, the language button reads বাংলা. The personal page also stores `robin-theme` (`light` or `dark`). The WhatsApp link stays `https://wa.me/` until `WHATSAPP_NUMBER` in `js/home.js` is filled in.
