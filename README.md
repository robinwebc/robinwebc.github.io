# robinwebc.github.io

Personal site for [Robin](https://github.com/robinwebc), a web and Android developer from Bangladesh, plus a separate page for the DaqBank test app.

GitHub Pages serves this repository from the `main` branch, root folder. There is no build step: the site is plain HTML, CSS, and JavaScript. `.nojekyll` is present so Pages publishes the files as they are.

| Path | Page |
| --- | --- |
| `/` | Robin’s profile, in English by default, with a Bangla toggle |
| `/daqbank/` | DaqBank, with its own palette and layout |
| `/daqbank/privacy/` | DaqBank privacy policy |

DaqBank is in **test mode**. It is not a licensed bank or payment service. Moving real customer money in Bangladesh requires a licence from Bangladesh Bank.

The Android package is published later at:

`https://github.com/robinwebc/robinwebc.github.io/releases/latest/download/DaqBank.apk`

Until that file exists, the DaqBank page says the download is coming soon.

English is the default. Language choice is stored in `localStorage` under `robin-lang` (`en` or `bn`) and follows you between the two parts of the site. In English, the language button reads বাংলা. The personal page also stores `robin-theme` (`light` or `dark`). The WhatsApp link stays `https://wa.me/` until `WHATSAPP_NUMBER` in `js/home.js` is filled in.
