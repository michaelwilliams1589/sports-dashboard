# Michael's Sports

A live scoreboard and schedule app for:

- Oklahoma Sooners football and basketball
- Oklahoma State Cowboys football and basketball
- OKC Thunder
- The NFL (with a week selector)
- College football rankings (AP, Coaches, CFP)

Live site: https://michaelwilliams1589.github.io/sports-dashboard/

It's a Progressive Web App (PWA): a plain static site (no build step) that you can install on your phone and open like a normal app. Scores come straight from ESPN's public JSON API in the browser and auto-refresh while the app is open.

## Install on your phone

**iPhone (Safari only)**
1. Open https://michaelwilliams1589.github.io/sports-dashboard/ in **Safari**.
2. Tap the **Share** button (square with an up arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.

**Android (Chrome)**
1. Open the site in **Chrome**.
2. Tap the **⋮** menu, then **Install app** (or **Add to Home screen**).

It then launches full screen from your home screen with its own icon.

## How it works

- `index.html`: dashboard. One page per team: `ou-football.html`, `osu-football.html`, `ou-basketball.html`, `osu-basketball.html`, `thunder.html`, plus `nfl.html` and `rankings.html`.
- `common.js` / `common.css` / `schedule.js`: the shared tab bar, ESPN fetch helpers and styles.
- `manifest.json`: PWA metadata (name, icons, colors).
- `sw.js`: service worker. It caches the app shell (HTML/CSS/JS/icons) so the app opens instantly and offline. **ESPN responses are never cached**, so scores are always live. When offline you'll see a banner and a friendly message instead of scores.
- `icons/`: app icons (generated artwork, no team logos or trademarks).

## Updating / releasing

1. Edit files.
2. Bump the version: `?v=N` on asset links in every HTML file, and `VERSION` / the `?v=N` entries in `sw.js`.
3. Commit and push to `main`. GitHub Pages redeploys in about a minute. Installed apps pick up the new version the next time they're opened (the page reloads once automatically).

Run locally: `python3 -m http.server 8000` and open http://localhost:8000.

## Limitations

- This is a web app, not a native App Store / Play Store app. Publishing natively would require an Apple Developer account ($99/year) or Google Play account ($25 one-time) plus a wrapper such as Capacitor or a TWA.
- No push notifications from the app itself (iOS web push needs extra setup). Game alerts still come from the separate bot messages.
- Live scores need an internet connection.
