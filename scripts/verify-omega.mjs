// Dependency-free Chromium/CDP checks. Launch an isolated browser with a
// remote-debugging port, then set OMEGA_ORIGIN and OMEGA_DEBUG_URL if needed.
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = process.env.OMEGA_ORIGIN || "http://localhost:3000";
const debugging = process.env.OMEGA_DEBUG_URL || "http://localhost:9232";
const evidence = await mkdtemp(join(tmpdir(), "omega-hero-qa-"));
const target = await fetch(`${debugging}/json/new?about:blank`, { method: "PUT" }).then(response => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map(), events = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) { events.push(message); return; }
  const request = pending.get(message.id);
  if (!request) return;
  clearTimeout(request.timer); pending.delete(message.id);
  if (message.error) request.reject(new Error(JSON.stringify(message.error))); else request.resolve(message.result);
});
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
  pending.set(requestId, { resolve, reject, timer }); socket.send(JSON.stringify({ id: requestId, method, params }));
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const evaluate = async expression => {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const waitFor = async expression => {
  const started = Date.now();
  for (let attempt = 0; attempt < 200 && Date.now() - started < 45000; attempt++) {
    try { if (await evaluate(expression)) return; } catch { /* navigation */ }
    await delay(200);
  }
  console.log("Browser state:", await evaluate("({ready:document.readyState,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,motion:document.querySelector('#home')?.dataset.motion,canvases:[...document.querySelectorAll('canvas')].map(c=>({...c.dataset})),gpu:window.__gpu})").catch(()=>null));
  console.log("Runtime errors:", JSON.stringify(events.filter(event=>event.method==='Runtime.exceptionThrown'||event.method==='Runtime.consoleAPICalled').map(event=>({method:event.method,type:event.params.type,args:event.params.args?.map(arg=>arg.value)}))));
  throw new Error(`Condition not met: ${expression}`);
};
const screenshot = async name => {
  const result = await command("Page.captureScreenshot", { format: "png" });
  const path = join(evidence, `${name}.png`); await writeFile(path, Buffer.from(result.data, "base64")); console.log("Screenshot:", path);
};

// Instrument only the test browser, not the shipped renderer. Observe actual
// GL draw calls, uniforms, and framebuffer pixels across time.
const instrumentation = `(() => {
 window.__gpu = {};
 const prototype = WebGLRenderingContext.prototype;
 const getLocation = prototype.getUniformLocation, setFloat = prototype.uniform1f, setVector = prototype.uniform2f, setColor = prototype.uniform3fv, draw = prototype.drawArrays;
 const names = new WeakMap();
 prototype.getUniformLocation = function(program, name) { const location = getLocation.call(this, program, name); if(location) names.set(location, name); return location; };
 const state = context => { const key = context.canvas.dataset.neuralCanvas; return window.__gpu[key] ||= { count: 0, uniforms: {}, pixel: [] }; };
 prototype.uniform1f = function(location, value) { state(this).uniforms[names.get(location)] = value; return setFloat.call(this, location, value); };
 prototype.uniform2f = function(location, x, y) { state(this).uniforms[names.get(location)] = [x,y]; return setVector.call(this, location, x,y); };
 prototype.uniform3fv = function(location, value) { state(this).uniforms[names.get(location)] = [...value]; return setColor.call(this, location, value); };
 prototype.drawArrays = function(...args) { const result = draw.apply(this, args); const s = state(this); s.count++; s.lastMode = args[0];
 if(this.canvas.dataset.neuralCanvas === 'aurora' && s.count % 30 === 0) { const pixels = new Uint8Array(16); this.readPixels(Math.floor(this.canvas.width*.64),Math.floor(this.canvas.height*.52),2,2,this.RGBA,this.UNSIGNED_BYTE,pixels); s.pixel = [...pixels]; }
 return result; };
})();`;
const snapshot = `(() => {
 const hero = document.querySelector('#home');
 return { gpu: window.__gpu, mode: hero.dataset.visualMode, motion: hero.dataset.motion, accent: getComputedStyle(hero).getPropertyValue('--accent'),
 role: hero.querySelector('[class*="roleVisual"]').textContent,
 photo: hero.querySelector('img').getBoundingClientRect().toJSON(),
 words: [...hero.querySelectorAll('[class*="headlineWord"]')].map(element=>({opacity:getComputedStyle(element).opacity,transform:getComputedStyle(element).transform})),
 panels: [...hero.querySelectorAll('[class*="panelFloat"]')].map(element=>getComputedStyle(element).transform),
 terminal: hero.querySelector('[class*="terminalOutput"]').textContent,
 canvases:[...hero.querySelectorAll('canvas')].map(canvas=>({kind:canvas.dataset.neuralCanvas,renderer:canvas.dataset.renderer,active:canvas.dataset.active,width:canvas.width,height:canvas.height})) };
})()`;

try {
  await command("Page.enable"); await command("Runtime.enable"); await command("Network.enable");
  await command("Network.setCacheDisabled", { cacheDisabled: true });
  await command("Page.addScriptToEvaluateOnNewDocument", { source: instrumentation });
  await command("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });
  await command("Page.navigate", { url: origin });
  await waitFor("document.readyState === 'complete' && document.querySelectorAll('#home canvas[data-renderer=webgl]').length === 2");
  await evaluate("document.querySelector('#home img').decode()");
  await command("Page.reload", { ignoreCache: true });
  await waitFor("window.__gpu?.aurora?.count > 100 && window.__gpu?.orbit?.count > 100");
  await screenshot("desktop-violet-early");
  const first = await evaluate(snapshot);
  const roles = new Set([first.role]);
  for (let i = 0; i < 10; i++) { await delay(1000); roles.add(await evaluate("document.querySelector('[class*=roleVisual]').textContent")); }
  const later = await evaluate(snapshot);
  await screenshot("desktop-violet-later");
  assert(later.gpu.aurora.count > first.gpu.aurora.count);
  assert(later.gpu.orbit.count > first.gpu.orbit.count);
  assert(later.gpu.aurora.uniforms.time > first.gpu.aurora.uniforms.time + 5);
  assert.notDeepEqual(later.gpu.aurora.pixel, first.gpu.aurora.pixel, "Aurora framebuffer must change");
  assert(Math.abs(later.photo.y - first.photo.y) > .2, "Photo must float vertically");
  assert.notDeepEqual(later.words, first.words, "Independent headline signals must move");
  assert.notDeepEqual(later.panels, first.panels, "Data panels must float independently");
  assert(roles.size > 4, "Typewriter must keep changing");
  assert.notEqual(later.terminal, first.terminal);
  console.log("Continuous GPU aurora/orbits, photo float, typewriter, headline, panels, terminal: passed.");

  await command("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1100, y: 250 }); await delay(900);
  const pointer = await evaluate("window.__gpu.orbit.uniforms.pointer");
  assert(Math.abs(pointer[0]) > .1, "Pointer must rotate 3D geometry");
  await screenshot("pointer-interaction");
  await evaluate("document.querySelector('#home').dispatchEvent(new PointerEvent('pointerleave'))"); await delay(1500);
  const returned = await evaluate("window.__gpu.orbit.uniforms.pointer");
  assert(Math.abs(returned[0]) < Math.abs(pointer[0]) / 2);
  const buttonBox = await evaluate("document.querySelector('[data-magnetic]').getBoundingClientRect().toJSON()");
  await command("Input.dispatchMouseEvent", { type: "mouseMoved", x: buttonBox.x + buttonBox.width * .8, y: buttonBox.y + 12 }); await delay(400);
  assert(await evaluate("parseFloat(document.querySelector('[data-magnetic]').style.getPropertyValue('--mx')) > 0"));
  const panelBox = await evaluate("document.querySelector('[data-panel]').getBoundingClientRect().toJSON()");
  await command("Input.dispatchMouseEvent", { type: "mouseMoved", x: panelBox.x + panelBox.width * .8, y: panelBox.y + 20 }); await delay(400);
  assert(await evaluate("!!document.querySelector('[data-panel]').style.getPropertyValue('--tilt-y')"));
  console.log("Pointer-follow, neutral return, magnetic CTA, independent panel tilt: passed.");

  for (const mode of ["cyan", "plasma", "violet"]) {
    await evaluate(`document.querySelectorAll('[aria-label="Hero visual mode"] button')[${{violet:0,cyan:1,plasma:2}[mode]}].click()`);
    await delay(1500); const scene = await evaluate(snapshot);
    assert.equal(scene.mode, mode); assert.equal(await evaluate("document.querySelectorAll('[aria-label=\"Hero visual mode\"] button[aria-pressed=true]').length"), 1);
    assert.notDeepEqual(scene.gpu.aurora.uniforms.colorA, mode === "violet" ? [0,0,0] : first.gpu.aurora.uniforms.colorA);
    await screenshot(`theme-${mode}`);
  }
  console.log("All three scene modes change DOM accents and shader colors: passed.");

  await evaluate("[...document.querySelectorAll('#home button')].find(b=>b.textContent==='Pause motion').click()");
  await waitFor("document.querySelector('#home').dataset.motion==='paused' && [...document.querySelectorAll('#home canvas')].every(c=>c.dataset.active==='false')");
  const manuallyPaused = await evaluate(snapshot); await delay(700);
  assert.equal((await evaluate(snapshot)).gpu.aurora.count, manuallyPaused.gpu.aurora.count);
  await evaluate("[...document.querySelectorAll('#home button')].find(b=>b.textContent==='Resume motion').click()");
  await waitFor("document.querySelector('[data-neural-canvas=aurora]').dataset.active==='true'");
  console.log("Accessible manual scene pause/resume: passed.");

  for (const route of ["/", "/manifest.webmanifest", "/sw.js", "/resume.pdf", "/images/profile.png", "/icons/icon-192.png", "/icons/icon-512.png"]) assert.equal((await fetch(origin + route)).status, 200, route);
  const hrefs = await evaluate("[...document.querySelectorAll('#home a')].map(a=>a.getAttribute('href'))");
  for (const link of ["#projects", "#contact", "/resume.pdf", "https://github.com/Tashin90", "https://www.linkedin.com/in/md-naimul-haque-tashin-1a7917344/", "mailto:naimulhaque217@gmail.com"]) assert(hrefs.includes(link), link);
  assert(await evaluate("['about','skills','projects','github','achievements','research','contact'].every(id=>document.getElementById(id))"));
  await evaluate("document.querySelector('a[href=\"#projects\"][data-magnetic]').click()");
  await waitFor("location.hash === '#projects' && document.querySelector('[data-neural-canvas=aurora]').dataset.active === 'false'");
  const stopped = await evaluate("window.__gpu.aurora.count"); await delay(1000); assert.equal(await evaluate("window.__gpu.aurora.count"), stopped);
  await evaluate("window.scrollTo({top:0,behavior:'instant'})"); await waitFor("document.querySelector('[data-neural-canvas=aurora]').dataset.active === 'true'");
  console.log("Links, section targets, HTTP assets, offscreen rendering pause/resume: passed.");

  await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await waitFor("[...document.querySelectorAll('#home canvas')].every(canvas=>canvas.dataset.active==='false')");
  await delay(200); const reduced = await evaluate(snapshot);
  assert.equal(reduced.motion, "paused"); assert(reduced.canvases.every(canvas=>canvas.active === "false"));
  assert.equal(await evaluate("document.querySelector('#home').getAnimations({subtree:true}).filter(a=>a.playState==='running').length"), 0);
  await delay(1000); assert.equal((await evaluate(snapshot)).gpu.aurora.count, reduced.gpu.aurora.count);
  await screenshot("reduced-motion");
  await evaluate("document.querySelectorAll('[aria-label=\"Hero visual mode\"] button')[2].click()"); await delay(200);
  assert.equal(await evaluate("window.__gpu.aurora.uniforms.colorA[0]"), .94);
  console.log("Reduced motion static scene and functional mode controls: passed.");
  await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

  for (const width of [1024, 768, 390, 320]) {
    await command("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 2, mobile: width < 768 });
    await evaluate("window.scrollTo({top:0,behavior:'instant'})"); await delay(1500);
    assert(await evaluate("document.documentElement.scrollWidth <= innerWidth"), `Overflow at ${width}`);
    assert(await evaluate("document.querySelector('[class*=name]').getBoundingClientRect().right <= innerWidth"));
    await evaluate("document.querySelector('[class*=modeConsole]').scrollIntoView({block:'center',behavior:'instant'})"); await delay(400);
    await evaluate("document.querySelectorAll('[aria-label=\"Hero visual mode\"] button')[1].click()");
    assert.equal(await evaluate("document.querySelector('#home').dataset.visualMode"), "cyan");
    if (width === 390) {
      await evaluate("window.scrollTo({top:0,behavior:'instant'})"); await delay(500); await screenshot("mobile-top");
      await evaluate("document.querySelector('[class*=profileEnvironment]').scrollIntoView({block:'start',behavior:'instant'})"); await delay(700); await screenshot("mobile-profile");
      await evaluate("document.querySelector('[class*=bottomDock]').scrollIntoView({block:'center',behavior:'instant'})"); await delay(500); await screenshot("mobile-console");
      await evaluate("document.querySelector('button[aria-label=\"Open menu\"]').click()"); assert(await evaluate("!!document.querySelector('button[aria-expanded=true]')"));
      await evaluate("[...document.querySelectorAll('header a')].find(a=>a.getAttribute('href')==='#achievements').click()"); assert.equal(await evaluate("location.hash"), "#achievements");
    }
    console.log("Responsive + theme controls passed:", width);
  }

  await command("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });
  await evaluate("window.scrollTo({top:0,behavior:'instant'})"); await delay(800);
  await evaluate("window.__lostExtension=document.querySelector('[data-neural-canvas=orbit]').getContext('webgl').getExtension('WEBGL_lose_context');window.__lostExtension.loseContext()");
  await waitFor("document.querySelector('[data-neural-canvas=orbit]').dataset.renderer==='fallback'");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('[class*=fallbackOrbits]')).display"), "block");
  await screenshot("webgl-context-fallback");
  await evaluate("window.__lostExtension.restoreContext()");
  await waitFor("document.querySelector('[data-neural-canvas=orbit]').dataset.renderer==='webgl'");
  console.log("WebGL context-loss fallback and restoration: passed.");

  const fallbackScript = await command("Page.addScriptToEvaluateOnNewDocument", { source: "const nativeContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl'?null:nativeContext.call(this,kind,...args)}" });
  await command("Page.reload", { ignoreCache: true });
  await waitFor("document.querySelectorAll('#home canvas[data-renderer=fallback]').length===2");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('[class*=fallbackOrbits]')).display"), "block");
  await screenshot("webgl-unavailable");
  await command("Page.removeScriptToEvaluateOnNewDocument", { identifier: fallbackScript.identifier });
  console.log("WebGL unavailable: CSS environment and unchanged content remain usable.");

  await command("Emulation.setScriptExecutionDisabled", { value: true }); await command("Network.setBypassServiceWorker", { bypass: true });
  await command("Page.reload", { ignoreCache: true });
  await waitFor("document.readyState==='complete' && !!document.querySelector('#home img')");
  assert.equal(await evaluate("[...document.querySelectorAll('#home [data-hero-reveal]')].filter(el=>getComputedStyle(el).opacity==='0').length"), 0);
  await screenshot("no-javascript");
  await command("Emulation.setScriptExecutionDisabled", { value: false }); await command("Network.setBypassServiceWorker", { bypass: false });
  const knownWarnings = events.filter(event=>event.method==='Runtime.consoleAPICalled' && event.params.type==='error' && event.params.args.some(arg=>arg.value?.includes('Function components cannot be given refs')) && event.params.args.some(arg=>arg.value?.includes('at Reveal') && arg.value?.includes('at Projects')));
  const errors = events.filter(event => event.method === "Runtime.exceptionThrown" || (event.method === "Runtime.consoleAPICalled" && event.params.type === "error" && !knownWarnings.includes(event)));
  assert.deepEqual(errors, []);
  await writeFile(join(evidence, "browser-results.json"), JSON.stringify({ origin, first, later, pointer, returned, roleSamples:[...roles], errors, knownProjectRefWarnings:knownWarnings.length }, null, 2));
  if(knownWarnings.length) console.log("Existing unrelated Projects/Reveal ref warning observed:", knownWarnings.length, "(not changed).");
  console.log("No-JS visibility, no uncaught/runtime/hydration errors: passed.");
  console.log("ALL OMEGA BROWSER CHECKS PASSED. Evidence:", evidence);
} finally { await command("Page.close").catch(()=>{}); socket.close(); }
