// Run against `npm run build` + `npm start` with a local Chromium browser
// launched using --remote-debugging-port=9222 and an isolated user-data-dir.
// Uses the same DevTools protocol as the Application panel; no extra packages.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

const origin = "http://localhost:3000";
const debugging = process.env.PWA_DEBUG_URL || "http://localhost:9222";
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function openPage(initialScript, existingTarget) {
  const target = existingTarget || await fetch(`${debugging}/json/new?about:blank`, { method: "PUT" }).then(response => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  const events = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    } else events.push(message);
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`DevTools timed out: ${method}`)); }, 30000);
    pending.set(requestId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  if (!existingTarget) await command("Page.enable");
  await command("Runtime.enable");
  await command("Network.enable");
  if (!existingTarget) await command("ServiceWorker.enable");
  if (initialScript) await command("Page.addScriptToEvaluateOnNewDocument", { source: initialScript });
  const evaluate = async expression => {
    const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async expression => {
    for (let attempt = 0; attempt < 300; attempt++) {
      try { if (await evaluate(expression)) return; } catch { /* Navigation may replace the execution context. */ }
      await delay(200);
    }
    throw new Error(`Browser condition did not become true: ${expression}`);
  };
  const navigate = async (path = "/") => {
    const previousTimeOrigin = await evaluate("performance.timeOrigin");
    await command("Page.navigate", { url: `${origin}${path}` });
    await waitFor(`performance.timeOrigin !== ${previousTimeOrigin} && document.readyState === 'complete'`);
  };
  const close = async () => {
    if (!existingTarget) await command("Page.close").catch(() => undefined);
    socket.close();
  };
  return { command, evaluate, waitFor, navigate, close, events };
}

if (process.argv.includes("--generate-icons")) {
  const page = await openPage();
  try {
    await page.navigate("/icons/icon-512.svg");
    for (const [filename, size] of [["icon-512.png", 512], ["apple-touch-icon.png", 180], ["favicon-32.png", 32]]) {
      const data = await page.evaluate(`(async () => {
        const image = new Image();
        image.src = '/icons/icon-512.svg';
        await image.decode();
        const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.width = canvas.height = ${size};
        const context = canvas.getContext('2d');
        context.fillStyle = '#060816';
        context.fillRect(0, 0, ${size}, ${size});
        context.drawImage(image, 0, 0, ${size}, ${size});
        return canvas.toDataURL('image/png').split(',')[1];
      })()`);
      await writeFile(new URL(`../public/icons/${filename}`, import.meta.url), Buffer.from(data, "base64"));
      console.log(`Generated ${filename}: ${size}x${size}, from the existing SVG artwork`);
    }
  } finally { await page.close(); }
} else {
  const routes = ["/", "/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png", "/icons/favicon-32.png", "/sw.js", "/resume.pdf", "/images/profile.png"];
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, 200, route);
    if (route === "/sw.js") assert.match(response.headers.get("cache-control"), /no-store/);
    if (route.endsWith(".png") && route.includes("/icons/")) {
      const data = Buffer.from(await response.arrayBuffer());
      const size = route.includes("192") ? 192 : route.includes("512") ? 512 : route.includes("apple") ? 180 : 32;
      assert.equal(data.readUInt32BE(16), size);
      assert.equal(data.readUInt32BE(20), size);
    }
    console.log(`HTTP 200 ${route}`);
  }
  const page = await openPage("window.__pwaNativeEvents = []; addEventListener('beforeinstallprompt', event => window.__pwaNativeEvents.push(event));");
  let offlineWorker;
  try {
    await page.navigate();
    try {
      await page.waitFor("!!navigator.serviceWorker.controller");
    } catch (error) {
      console.log("Worker diagnostics:", await page.evaluate("navigator.serviceWorker.getRegistrations().then(registrations => registrations.map(registration => ({ scope: registration.scope, installing: registration.installing?.state, waiting: registration.waiting?.state, active: registration.active?.state })))"));
      console.log("Browser errors:", JSON.stringify(page.events.filter(event => event.method === "ServiceWorker.workerErrorReported" || event.method === "Runtime.exceptionThrown" || event.method === "ServiceWorker.workerVersionUpdated")));
      throw error;
    }
    const manifestDetails = await page.command("Page.getAppManifest");
    assert.equal(manifestDetails.url, `${origin}/manifest.webmanifest`);
    assert.deepEqual(manifestDetails.errors, []);
    const manifest = JSON.parse(manifestDetails.data);
    assert.equal(manifest.name, "Md. Naimul Haque Tashin Portfolio");
    assert.equal(manifest.short_name, "Tashin Portfolio");
    assert.equal(manifest.theme_color, "#a78bfa");
    assert.equal(manifest.background_color, "#060816");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.orientation, "portrait-primary");
    for (const size of [192, 512]) assert(manifest.icons.some(icon => icon.type === "image/png" && icon.sizes === `${size}x${size}`));
    console.log("DevTools manifest:", JSON.stringify(manifest));
    const installability = await page.command("Page.getInstallabilityErrors");
    assert.deepEqual(installability.installabilityErrors, []);
    console.log("Chromium installability: no errors");
    const registration = await page.evaluate("navigator.serviceWorker.getRegistration('/').then(registration => ({ scope: registration.scope, script: registration.active.scriptURL, state: registration.active.state }))");
    assert.equal(registration.script, `${origin}/sw.js`);
    assert.equal(registration.state, "activated");
    console.log("Service worker:", JSON.stringify(registration));
    console.log("Native beforeinstallprompt events:", await page.evaluate("window.__pwaNativeEvents.length"));
    await page.waitFor("!!document.querySelector('main') && !!document.querySelector('img[srcset]')");
    const staticLinks = "[...document.querySelectorAll('main a')].filter(link => !link.closest('#github article')).map(link => link.href)";
    const before = await page.evaluate(`({ heading: document.querySelector('h1').innerText, links: ${staticLinks} })`);
    await page.evaluate("dispatchEvent(new Event('appinstalled'))");
    const workerTarget = (await fetch(`${debugging}/json/list`).then(response => response.json())).find(target => target.type === "service_worker" && target.url === `${origin}/sw.js`);
    assert(workerTarget, "The activated worker must have a DevTools target");
    const worker = await openPage(undefined, workerTarget);
    offlineWorker = worker;
    // Workers have their own network target; page-only emulation is insufficient.
    await worker.command("Network.setCacheDisabled", { cacheDisabled: true });
    await page.command("Network.setCacheDisabled", { cacheDisabled: true });
    await worker.command("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await page.command("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    const previousTimeOrigin = await page.evaluate("performance.timeOrigin");
    await page.command("Page.reload", { ignoreCache: true });
    await page.waitFor(`performance.timeOrigin !== ${previousTimeOrigin} && document.readyState === 'complete' && !!document.querySelector('main')`);
    await page.waitFor("[...document.querySelectorAll('img')].every(image => image.complete && image.naturalWidth > 0)");
    assert.equal(await page.evaluate("document.querySelector('h1').innerText"), before.heading);
    const offlineAssets = await page.evaluate(`Promise.all(${JSON.stringify(routes.slice(1).filter(route => route !== "/sw.js"))}.map(async route => { const response = await fetch(route); return { route, status: response.status, type: response.headers.get('content-type') }; }))`);
    offlineAssets.forEach(result => assert.equal(result.status, 200, `Offline ${result.route}`));
    assert.match(offlineAssets.find(asset => asset.route === "/resume.pdf").type, /application\/pdf/);
    console.log("Offline reload: page, CSS/JS, profile image, manifest, icons and resume passed");
    const cacheState = await page.evaluate("caches.keys().then(keys => Promise.all(keys.map(async key => ({ key, urls: (await (await caches.open(key)).keys()).map(request => request.url) }))))");
    assert(cacheState.some(cache => cache.urls.some(url => url.includes("/_next/static/") && url.endsWith(".js"))));
    assert(cacheState.some(cache => cache.urls.some(url => url.includes("/_next/static/") && url.endsWith(".css"))));
    assert(!cacheState.some(cache => cache.urls.some(url => url.includes("/api/"))));
    assert.equal(await page.evaluate("fetch('/api/github').then(() => false).catch(() => true)"), true);
    console.log("GitHub: requests use the network, no API response in Cache Storage, offline request fails instead of serving stale data");
    await worker.command("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await worker.close();
    offlineWorker = undefined;
    await page.command("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await page.navigate();
    await page.waitFor("!!document.querySelector('main')");
    assert.deepEqual(await page.evaluate(staticLinks), before.links);
    console.log("Normal page links unchanged after offline/online reload");
    const runtimeErrors = page.events.filter(event => event.method === "Runtime.exceptionThrown");
    assert.deepEqual(runtimeErrors, []);
  } finally {
    if (offlineWorker) {
      await offlineWorker.command("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }).catch(() => undefined);
      await offlineWorker.close();
    }
    await page.close();
  }

  // Synthetic events exercise UI branches without installing anything on the host.
  const promptPage = await openPage("addEventListener('beforeinstallprompt', event => { if (event.isTrusted) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);");
  try {
    await promptPage.navigate();
    await promptPage.waitFor("!!navigator.serviceWorker.controller");
    await delay(2200);
    const shown = "!!document.querySelector('[aria-label=\"Install portfolio app\"]')";
    assert.equal(await promptPage.evaluate(shown), false);
    const dispatch = outcome => promptPage.evaluate(`(() => { const event = new Event('beforeinstallprompt', { cancelable: true }); event.prompt = async () => { window.__pwaPromptCalls = (window.__pwaPromptCalls || 0) + 1; }; event.userChoice = Promise.resolve({ outcome: '${outcome}', platform: 'web' }); dispatchEvent(event); })()`);
    await dispatch("accepted");
    assert.equal(await promptPage.evaluate(shown), false);
    await promptPage.waitFor(shown);
    await promptPage.evaluate("document.querySelector('[aria-label=\"Dismiss install prompt\"]').click()");
    assert.equal(await promptPage.evaluate(shown), false);
    await dispatch("accepted");
    await delay(2200);
    assert.equal(await promptPage.evaluate(shown), false);
    await promptPage.navigate();
    await dispatch("accepted");
    await delay(2200);
    assert.equal(await promptPage.evaluate(shown), false);
    console.log("Install UI: absent without support, delayed when supported, dismissible, dismissal persists for the session");

    await promptPage.evaluate("sessionStorage.clear()");
    await promptPage.navigate();
    await dispatch("dismissed");
    await promptPage.waitFor(shown);
    await promptPage.evaluate("[...document.querySelectorAll('aside button')].find(button => button.textContent.includes('Install')).click()");
    await promptPage.waitFor("window.__pwaPromptCalls === 1");
    assert.equal(await promptPage.evaluate(shown), false);
    await dispatch("accepted");
    await delay(2200);
    assert.equal(await promptPage.evaluate(shown), false);
    console.log("Install UI: browser prompt called only on a click, rejection hides it and suppresses repeat prompts");

    await promptPage.evaluate("sessionStorage.clear()");
    await promptPage.navigate();
    await dispatch("accepted");
    await promptPage.evaluate("dispatchEvent(new Event('appinstalled'))");
    await delay(2200);
    assert.equal(await promptPage.evaluate(shown), false);
    await dispatch("accepted");
    await delay(2200);
    assert.equal(await promptPage.evaluate(shown), false);
    console.log("Install UI: installation hides it and cancels pending timers");

    await promptPage.navigate();
    await dispatch("accepted");
    await promptPage.waitFor(shown);
    await promptPage.evaluate("[...document.querySelectorAll('aside button')].find(button => button.textContent.includes('Install')).click()");
    await promptPage.waitFor("window.__pwaPromptCalls === 1");
    await promptPage.evaluate("dispatchEvent(new Event('appinstalled'))");
    assert.equal(await promptPage.evaluate(shown), false);
    assert.deepEqual(promptPage.events.filter(event => event.method === "Runtime.exceptionThrown"), []);
    console.log("Install UI: accepted installation passed, no uncaught page errors");
  } finally { await promptPage.close(); }

  const standalonePage = await openPage("Object.defineProperty(navigator, 'standalone', { value: true });");
  try {
    await standalonePage.navigate();
    await standalonePage.evaluate("(() => { const event = new Event('beforeinstallprompt'); event.prompt = async () => {}; event.userChoice = Promise.resolve({ outcome: 'accepted' }); dispatchEvent(event); })()");
    await delay(2200);
    assert.equal(await standalonePage.evaluate("!!document.querySelector('[aria-label=\"Install portfolio app\"]')"), false);
    console.log("Install UI: suppressed when already running standalone");
  } finally { await standalonePage.close(); }

  const storagePage = await openPage("Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Storage unavailable', 'SecurityError'); } }); addEventListener('beforeinstallprompt', event => { if (event.isTrusted) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);");
  try {
    await storagePage.navigate();
    await storagePage.waitFor("!!navigator.serviceWorker.controller");
    // A native beforeinstallprompt arrives after the page has settled. Give
    // hydration the same opportunity before dispatching the synthetic event.
    await delay(1000);
    await storagePage.evaluate("(() => { const event = new Event('beforeinstallprompt'); event.prompt = async () => { throw new Error('Prompt unavailable'); }; event.userChoice = Promise.resolve({ outcome: 'dismissed' }); dispatchEvent(event); })()");
    await storagePage.waitFor("!!document.querySelector('[aria-label=\"Install portfolio app\"]')");
    await storagePage.evaluate("document.querySelector('[aria-label=\"Dismiss install prompt\"]').click()");
    assert.equal(await storagePage.evaluate("!!document.querySelector('[aria-label=\"Install portfolio app\"]')"), false);
    assert.deepEqual(storagePage.events.filter(event => event.method === "Runtime.exceptionThrown"), []);
    console.log("Install UI: remains usable when session storage is unavailable");
  } finally { await storagePage.close(); }
  console.log("PWA verification passed.");
}
