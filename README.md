# robinwebc.github.io

Personal site for [Robin](https://github.com/robinwebc), a web and Android developer from Bangladesh, plus a separate page for the DaqBank test app.

GitHub Pages serves this repository from the `main` branch, root folder. There is no build step: the site is plain HTML, CSS, and JavaScript. `.nojekyll` is present so Pages publishes the files as they are.

| Path | Page |
| --- | --- |
| `/` | Robin’s profile, in Bangla by default, with an English toggle |
| `/daqbank/` | DaqBank, with its own palette and layout |
| `/daqbank/privacy/` | DaqBank privacy policy |

DaqBank is in **test mode**. It is not a licensed bank or payment service. Moving real customer money in Bangladesh requires a licence from Bangladesh Bank.

The Android package is published later at:

`https://github.com/robinwebc/robinwebc.github.io/releases/latest/download/DaqBank.apk`

Until that file exists, the DaqBank page says the download is coming soon.

Language choice is stored in `localStorage` under `robin-lang` (`bn` or `en`) and follows you between the two parts of the site.
