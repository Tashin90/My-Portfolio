# Md. Naimul Haque Tashin — Portfolio

## Run locally

Install Node.js 18.17+ or newer, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Content and assets to replace

- Edit `data/portfolio.ts` for personal details, links, skills, projects, and journey entries.
- Add the real LinkedIn URL and confirmed email address there.
- Add the final resume at `public/resume.pdf`.
- Add an optional profile image at `public/images/profile.jpg` if a photo-based hero is preferred; the current design uses a safe initials placeholder.
- Connect the contact form to an email/API service where marked TODO.

The repository intentionally avoids fabricated GitHub statistics, achievements, publications, live demos, or graduation dates.

## PWA verification and deployment

The existing portfolio includes an installable PWA manifest at `/manifest.webmanifest`,
192px and 512px PNG/SVG icons, a PNG Apple touch icon and favicon, and `/sw.js`.
The original icon artwork and portfolio content are preserved.

Use the production server to test service workers and offline behavior:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

Open `http://localhost:3000`, then check DevTools → Application → Manifest and
Service Workers. Registration is enabled in production; development avoids caching
Next.js development bundles. After the worker activates, an offline reload serves
the homepage, its CSS/JS, the optimized profile image and local icons. The resume
at `/resume.pdf` is also available offline. GitHub API requests always try the
network and are never stored in the service worker's caches; the existing server
cache revalidates after one hour. When offline, the existing GitHub error UI applies.

The install card appears only after the browser's `beforeinstallprompt` event,
with a short delay. It requires a click to launch installation, can be dismissed
for the browser session, and hides when the app is installed. Android users can
visit the deployed HTTPS URL in Chrome and use the card or the browser's
**Install app / Add to Home screen** menu. Desktop Chrome and Edge also offer
installation through the address bar or browser menu.

For reproducible browser checks, launch a separate local Chrome or Edge with
`--headless=new --remote-debugging-port=9222 --user-data-dir=<temporary-directory>`
and run `node scripts/verify-pwa.mjs` while the production server is running. This
checks actual routes, DevTools manifest/installability, activation, offline reloads,
cached assets, and install-card lifecycle behavior without installing an app.
`node scripts/verify-pwa.mjs --generate-icons` regenerates the additional PNGs from
the existing 512px SVG; it preserves the existing 192px PNG.

Deploy by importing this repository into Vercel and selecting the **Next.js** preset.
Use the normal install/build defaults (`npm install` / `npm run build`) and the
project root. No custom server, static export, or special runtime is needed.
After deployment, repeat the Manifest/Service Worker checks on the HTTPS URL.
`next.config.mjs` prevents long-lived browser/CDN caching of `/sw.js`, and the
worker removes only older `tashin-portfolio-*` caches. Bump its `VERSION` when
changing the precached asset set or caching behavior.
