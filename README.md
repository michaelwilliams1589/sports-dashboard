# Michael's Hub

A combined home and sports app you can customize:

- **Home:** live weather (current, hourly, 7-day), severe weather alerts (U.S.), today's games, and the current date and time
- **Calendar:** a Google Calendar embed (events appear only when you're signed in) plus optional second-calendar and Google Calendar buttons
- **Scores:** the live scoreboard for your favorite teams, plus the NFL when that tab is on
- Team schedules for each favorite team, including OU, OSU, and the Thunder by default
- **Playoffs:** NBA standings, seed, play-in and playoff lines, and series status during the postseason (tracks your first NBA favorite; Thunder by default)
- **NFL** week selector and **college football rankings** (AP, Coaches, CFP)
- **Tech:** a watch list and optional tech headlines
- **Packages:** links to USPS, UPS, FedEx, and GOFO tracking pages (no tracking numbers are stored here)
- **Customize:** turn tabs on or off, pick your city and teams, add your own calendar and links, and share a clean setup link with friends

Live site: https://michaelwilliams1589.github.io/sports-dashboard/

It's a Progressive Web App (PWA): a plain static site (no build step) that you can install on your phone and open like a normal app, including iPhone (Safari → Share → Add to Home Screen). Live data is fetched in the browser from public APIs (Open-Meteo, the National Weather Service, and ESPN).

This site is public. It does not include calendar event details, bills, email contents, a home address, phone numbers, tracking numbers, or order details. The Calendar tab only shows events when you are signed in to Google in that browser. Each person's customized settings stay in that phone's browser storage, not in the public repo.

## Install on your phone (iPhone included)

**iPhone (Safari only)**
1. Open https://michaelwilliams1589.github.io/sports-dashboard/ in **Safari**.
2. Tap the **Share** button (square with an up arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.

**Android (Chrome)**
1. Open the site in **Chrome**.
2. Tap the **⋮** menu, then **Install app** (or **Add to Home screen**).

It then launches full screen from your home screen with its own icon. If an older Sports icon is already on the home screen, add it again after this update (or open the existing one; the name may still say Sports until you re-add it).

On iPhone, Customize inside the installed Home Screen app (or import your settings code after installing). Safari and the Home Screen app can each have their own saved settings.

## Customize and sharing

Open the gear in the top-right corner, or the **Customize** tab.

At the top of Customize, pick **Android** or **iPhone** (auto-detected when we can) so install steps, calendar shortcuts, and a few mobile tips match your phone. That choice is stored with your settings code.


- Your own name, city (search any city or U.S. ZIP), °F/°C, favorite teams, calendar, and links are saved on that device only.
- Until you save a custom setup, the app uses the original default (Okmulgee weather, OU/OSU/Thunder, and the owner's calendar).
- Share this clean link with friends so they start from a blank setup and do **not** inherit the default personal calendar: https://michaelwilliams1589.github.io/sports-dashboard/?setup=1
- In **Look & icon**, pick Dark, Light, or Auto (system), an accent color, a background (solid, a gradient, or a photo), and a custom app icon (emoji/initial or a photo). Dark is the default, so the original look stays until you change it.
- A custom icon shows as the badge at the top of the app. On iPhone, pick the icon first, then use Safari → Share → **Add to Home Screen** (re-add if it’s already installed) so the Home Screen icon can update. On Android, the in-app badge changes; the Home Screen icon usually comes from the phone’s launcher.
- Use **Copy settings code** / **Import** to move your setup to another phone, and **Reset to defaults** to restore the original hub. Uploaded photos are left out of the settings code so it stays short — re-add those photos on the new phone.

## How it works

- `index.html`: Home tab (weather, alerts, today's games).
- `customize.html`: the settings page. `config.js` is the shared config module (`homehub_config_v1` in localStorage).
- `scores.html`: the live scoreboard. `team.html`: a generic schedule page for any favorite team.
- `calendar.html`, `playoffs.html`, `tech.html`, `packages.html`: the other tabs.
- One page per default team: `ou-football.html`, `osu-football.html`, `ou-basketball.html`, `osu-basketball.html`, `thunder.html`, plus `nfl.html` and `rankings.html`.
- `common.js` / `common.css` / `schedule.js`: the shared tab bar, fetch helpers, and styles.
- `tech-watch.json`: the built-in starter tech watch list (used until someone saves their own links).
- `manifest.json`: PWA metadata (name, icons, colors).
- `sw.js`: service worker. It caches the app shell (HTML/CSS/JS/icons) so the app opens instantly and offline. **API responses are never cached.** When offline you'll see a banner and a friendly message instead of live data.
- `icons/`: app icons (generated artwork, no team logos or trademarks).

## Editing the built-in tech watch list

1. Edit `tech-watch.json`. Each item can have `item`, `category`, `link`, `targetPrice`, and `notes`.
2. Leave `targetPrice` as `null` if you don't want a price shown.
3. Bump `?v=N` on the `tech-watch.json` request in `tech.html` and the matching entry in `sw.js` (or bump the whole release version) so phones pick up the change.
4. Commit and push to `main`. GitHub Pages redeploys in about a minute.

People can also add their own links in Customize; those stay on their phone and are not written to this file.

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
- Custom settings live in the browser, not in the cloud. Use the settings code to back them up.
- The installed app name on the Home Screen comes from the website's manifest ("Hub"), not the custom hub title. On iPhone you can edit the name when you Add to Home Screen.
