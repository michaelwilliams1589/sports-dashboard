# Michael's Hub

A combined home and sports app:

- **Home:** live Okmulgee, OK weather (current, hourly, 7-day), severe weather alerts, today's games, and the current date and time in Central Time
- **Calendar:** a Google Calendar embed (events appear only when you're signed in) plus buttons for Google Calendar and Outlook Calendar
- **Scores:** the live scoreboard for OU, OSU, the Thunder, and the NFL
- Team schedules: Oklahoma Sooners and Oklahoma State Cowboys football and basketball, plus the OKC Thunder
- **Playoffs:** OKC Thunder seed, Western Conference and NBA standings, the play-in and playoff lines, and series status during the postseason
- **NFL** week selector and **college football rankings** (AP, Coaches, CFP)
- **Tech:** a watch list for your devices and accessories, plus optional tech headlines
- **Packages:** links to USPS, UPS, FedEx, and GOFO tracking pages (no tracking numbers are stored here)

Live site: https://michaelwilliams1589.github.io/sports-dashboard/

It's a Progressive Web App (PWA): a plain static site (no build step) that you can install on your phone and open like a normal app. Live data is fetched in the browser from public APIs (Open-Meteo, the National Weather Service, and ESPN).

This site is public. It does not include calendar event details, bills, email, a home address, phone numbers, tracking numbers, or order details. The Calendar tab only shows events when you are signed in to Google in that browser.

## Install on your phone

**iPhone (Safari only)**
1. Open https://michaelwilliams1589.github.io/sports-dashboard/ in **Safari**.
2. Tap the **Share** button (square with an up arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.

**Android (Chrome)**
1. Open the site in **Chrome**.
2. Tap the **⋮** menu, then **Install app** (or **Add to Home screen**).

It then launches full screen from your home screen with its own icon. If an older Sports icon is already on the home screen, add it again after this update (or open the existing one; the name may still say Sports until you re-add it).

## How it works

- `index.html`: Home tab (weather, alerts, today's games).
- `scores.html`: the live scoreboard that used to be the front page.
- `calendar.html`, `playoffs.html`, `tech.html`, `packages.html`: the other new tabs.
- One page per team: `ou-football.html`, `osu-football.html`, `ou-basketball.html`, `osu-basketball.html`, `thunder.html`, plus `nfl.html` and `rankings.html`.
- `common.js` / `common.css` / `schedule.js`: the shared tab bar, fetch helpers, and styles.
- `tech-watch.json`: the hand-editable tech watch list.
- `manifest.json`: PWA metadata (name, icons, colors).
- `sw.js`: service worker. It caches the app shell (HTML/CSS/JS/icons) so the app opens instantly and offline. **API responses are never cached.** When offline you'll see a banner and a friendly message instead of live data.
- `icons/`: app icons (generated artwork, no team logos or trademarks).

## Editing the tech watch list

1. Edit `tech-watch.json`. Each item can have `item`, `category`, `link`, `targetPrice`, and `notes`.
2. Leave `targetPrice` as `null` if you don't want a price shown.
3. Bump `?v=N` on the `tech-watch.json` request in `tech.html` and the matching entry in `sw.js` (or bump the whole release version) so phones pick up the change.
4. Commit and push to `main`. GitHub Pages redeploys in about a minute.

## Updating / releasing

1. Edit files.
2. Bump the version: `?v=N` on asset links in every HTML file, and `VERSION` / the `?v=N` entries in `sw.js`.
3. Commit and push to `main`. GitHub Pages redeploys in about a minute. Installed apps pick up the new version the next time they're opened (the page reloads once automatically).

Run locally: `python3 -m http.server 8000` and open http://localhost:8000.

## Limitations

- This is a web app, not a native App Store / Play Store app. Publishing natively would require an Apple Developer account ($99/year) or Google Play account ($25 one-time) plus a wrapper such as Capacitor or a TWA.
- No push notifications from the app itself (iOS web push needs extra setup). Game alerts still come from the separate bot messages.
- Live scores, weather, and standings need an internet connection.
- The Google Calendar embed can look empty on phones that block third-party cookies. Use **Open Google Calendar** in that case.
