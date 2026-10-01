# OMEGA X V.06 — hero implementation

This is a hero-only enhancement. The real portfolio data, photo, CV, other
sections, navigation, manifest, install prompt, and service worker are unchanged.

## Architecture

- `components/Hero.tsx`: semantic content, progressive entrances, pointer
  interactions, visual mode controls, and a manual motion pause/resume button.
- `components/Hero.module.css`: responsive layout, CSS fallback environment,
  independently timed typography, portrait float, panel motion, and glass UI.
- `components/hero/NeuralScene.tsx`: dynamically imported client-only WebGL
  renderer. The aurora uses a procedural fragment shader. The orbital layer uses
  three GPU-transformed rings with perspective projection and orbiting points.
  The existing photograph remains a normal, accessible Next.js image.
- `components/hero/CommandText.tsx`: isolated typewriter and decorative terminal.
  Screen readers get stable content rather than repeated announcements.
- `components/hero/visualModes.ts`: shared CSS/shader palettes. Violet Matrix is
  the default. Modes are session-only, consistent with the existing site theme
  control's nonpersistent behavior.

There are no new dependencies. The terminal is explicitly labeled a simulation;
it does not execute commands or imply a successful real build/research process.
Roles and numerical statistics come from `data/portfolio.ts`.

## Performance and accessibility

WebGL drawing pauses when each canvas is offscreen, the document is hidden,
reduced motion is requested, or the visitor pauses motion. Timers also pause when
their own widgets are offscreen. CSS motion pauses when the hero is offscreen.

Desktop DPR is capped at 1.5; mobile/coarse-pointer DPR is capped at 1. Aurora
resolution is scaled by 0.65. Compact devices target approximately 30fps and use
fewer orbiting nodes; sustained slow frames lower resolution further. There are
no continuous React state updates for pointer tracking or GPU animation.

ResizeObserver updates canvas sizes without recreating geometry. Unmount cleanup
removes observers, event listeners, timers, animation frames, shaders, programs,
and buffers. Context loss shows the fallback; restoration recreates resources.
Do not force context loss in effect cleanup: React Strict Mode reruns effects on
the same canvas in development. See [WebGL context-loss behavior](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event).

With reduced motion, the scene is static, the role is stable, and modes/buttons
remain usable. Without WebGL, static CSS rings and radial gradients remain.
Without JavaScript, all portfolio content and links remain visible; interactive
scene controls naturally require JavaScript.

## Tuning

| Effect | Control |
| --- | --- |
| Portrait float | `--profile-duration`, `profileFloat` keyframes in CSS |
| Gradient ring / glow | `--ring-duration`, `--glow-duration` in CSS |
| Name light / headline signals | `identityLight`, `wordSignal` in CSS |
| Panel float | `--panel-duration` and `--panel-delay` in Hero.tsx |
| Typewriter speed / pauses | 90ms typing, 45ms deleting, 2300ms pause in CommandText.tsx |
| Terminal cycle | 5600ms interval in CommandText.tsx |
| Aurora flow / brightness | `time * .18` and ribbon/haze multipliers in the fragment shader |
| Orbital speeds | `.20`, `-.14`, `.11` radians/second in the vertex shader |
| Pointer strength | `.25` / `.32` orbital tilt; magnetic 7px / 5px and panel 6deg limits |
| Theme colors | `visualModes.ts`; shader RGB values are normalized from 0 to 1 |

Keep opacity high enough for readable content and preserve the reduced-motion
rules when adjusting effects. No scene preference overrides the OS setting.

## Local verification

```powershell
npm.cmd run dev -- --port 3000
npm.cmd run typecheck
npm.cmd run build
npm.cmd run start -- --port 3000
```

Stop the development server before building or starting production: both use
`.next`. If a port is occupied, choose another and use its printed localhost URL.
The existing `npm.cmd run lint` requires initial ESLint setup; no lint dependency
or configuration has been introduced by this enhancement.
Development also reports an existing Projects/Reveal ref warning from
AnimatePresence's pop-layout mode; it is unrelated to this hero and unchanged.

For repeatable browser tests, use Node.js 22+ and an isolated Chromium browser
with remote debugging enabled. Do not use your personal browser profile.

```powershell
$omegaProfile = Join-Path $env:TEMP ('omega-browser-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $omegaProfile | Out-Null
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -WindowStyle Hidden -ArgumentList '--headless=new','--remote-debugging-port=9232','--enable-unsafe-swiftshader',('--user-data-dir=' + $omegaProfile),'--no-first-run','about:blank'
$env:OMEGA_ORIGIN = 'http://localhost:3000'
$env:OMEGA_DEBUG_URL = 'http://localhost:9232'
node scripts/verify-omega.mjs
```

The script stores screenshots and JSON evidence in a new OS temporary directory,
not repository assets. It checks actual draw calls and changing framebuffer
pixels, continuous effects, pointer/CTA/panel interactions, all modes, manual
pause, reduced motion, responsive widths, mobile navigation, links, assets,
offscreen pausing, WebGL loss/restoration/unavailability, and no-JS visibility.
Headless software WebGL proves shader execution, not physical-device GPU speed.

For production PWA testing on port 3000 with the same debugging browser:

```powershell
$env:PWA_DEBUG_URL = 'http://localhost:9232'
node scripts/verify-pwa.mjs
```

Development does not register a service worker. Use a fresh browser profile for
development and an online hard refresh after switching from production on the
same origin. Production navigation is network-first; hashed bundles are cached
for offline use. The dynamically loaded scene chunk is cached after being used;
the static CSS environment remains usable if that optional chunk is unavailable.

Manually review the live scene on your Android device and desktop GPU, check
keyboard focus and mode activation, enable the OS's reduced-motion preference,
and confirm scrolling away/returning resumes the scene. Browser automation does
not measure battery consumption or replace assistive-technology testing.
