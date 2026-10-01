"use client";

import { useEffect, useRef } from "react";
import { visualModes, type VisualMode } from "./visualModes";
import styles from "../Hero.module.css";

// One tiny renderer for both layers. No textures, postprocessing, or 3D library.
const auroraVertex = `attribute vec2 position; varying vec2 uv;
void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;
const auroraFragment = `precision mediump float;
varying vec2 uv; uniform float time; uniform vec2 pointer; uniform float aspect;
uniform vec3 colorA; uniform vec3 colorB; uniform vec3 colorC;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec2 p=uv; float t=time*.18;
 float n=noise(vec2(p.x*4.+t,p.y*3.-t*.7));
 float curve=.54+sin(p.x*5.+t)*.17+sin(p.x*9.-t*.8)*.05+(n-.5)*.10;
 float ribbon=exp(-abs(p.y-curve)*19.);
 float ribbon2=exp(-abs(p.y-(.68+sin(p.x*4.-t*1.1)*.16+n*.08))*24.);
 float haze=exp(-abs(p.y-curve)*4.)*.16;
 vec3 color=mix(colorA,colorB,smoothstep(.1,.95,p.x+sin(t)*.15));
 vec2 d=(p-(pointer*.5+.5))*vec2(aspect,1.);
 float light=exp(-dot(d,d)*7.)*.12;
 vec3 result=vec3(.018,.025,.065)+color*(ribbon*.18+haze)+colorC*ribbon2*.14+colorB*light;
 result+=(noise(p*150.)-.5)*.008;
 result*=mix(.45,1.,smoothstep(0.,.22,p.y));
 gl_FragColor=vec4(result,1.);
}`;

// Vertices describe a circular ring in 3D. Each ring's orientation, rotation,
// perspective projection, and orbiting points are calculated on the GPU.
const orbitVertex = `attribute vec2 position;
uniform float time; uniform float ring; uniform float size; uniform float aspect;
uniform vec2 pointer; varying float depth; varying float arc; varying vec2 screen;
vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
void main(){
 float speed=ring<1.? .20 : (ring<2.? -.14 : .11);
 float a=position.x+time*speed+ring*1.7;
 float radius=1.10+ring*.14;
 vec3 p=vec3(cos(a)*radius,sin(a)*radius,0.);
 p=rx(p,.32+ring*.64+sin(time*.09+ring)*.12);
 p=ry(p,ring*.85+time*speed*.3);
 p=rx(p,pointer.y*.25); p=ry(p,pointer.x*.32);
 depth=p.z; arc=a;
 float perspective=3.6/(3.6-p.z);
 screen=vec2(p.x*perspective*.59/aspect,p.y*perspective*.59);
 gl_Position=vec4(screen,0.,1.);
 gl_PointSize=size*(.8+perspective*.25);
}`;
const orbitFragment = `precision mediump float; varying float depth; varying float arc; varying vec2 screen;
uniform vec3 colorA; uniform vec3 colorB; uniform float points;
void main(){
 float alpha=.45+depth*.13;
 if(points>.5){float d=length(gl_PointCoord-.5);alpha=(1.-smoothstep(.08,.5,d))*.9;}
 else {alpha*=.55+.45*pow(.5+.5*sin(arc*3.),4.);}
 // Occlude rear geometry and soften front highlights over the portrait.
 float portrait=1.-smoothstep(.43,.53,length(screen));
 if(depth<0. && portrait>.98)discard;
 alpha*=1.-portrait*.75;
 gl_FragColor=vec4(mix(colorA,colorB,.5+.5*sin(arc)),alpha);
}`;

function createRenderer(canvas: HTMLCanvasElement, orbital: boolean) {
  const gl = canvas.getContext("webgl", { alpha: orbital, antialias: orbital, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const buffers: WebGLBuffer[] = [];
  const program = gl.createProgram();
  const dispose = () => { buffers.forEach(buffer => gl.deleteBuffer(buffer)); shaders.forEach(shader => gl.deleteShader(shader)); if (program) gl.deleteProgram(program); };
  try {
    if (!program) throw new Error("No GPU program");
    for (const [type, source] of [[gl.VERTEX_SHADER, orbital ? orbitVertex : auroraVertex], [gl.FRAGMENT_SHADER, orbital ? orbitFragment : auroraFragment]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("No GPU shader");
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("GPU program link failed");
    gl.useProgram(program);
    const makeBuffer = (data: Float32Array) => {
      const buffer = gl.createBuffer(); if (!buffer) throw new Error("No GPU buffer");
      buffers.push(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return buffer;
    };
    const segments = 144;
    const geometry = orbital ? new Float32Array(Array.from({ length: segments + 1 }, (_, i) => [i / segments * Math.PI * 2, 0]).flat()) : new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const mainBuffer = makeBuffer(geometry);
    const particles = makeBuffer(new Float32Array(Array.from({ length: 8 }, (_, i) => [i / 8 * Math.PI * 2, 1]).flat()));
    const attribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(attribute);
    const uniforms = Object.fromEntries(["time", "pointer", "aspect", "colorA", "colorB", "colorC", "ring", "size", "points"].map(key => [key, gl.getUniformLocation(program, key)]));
    if (orbital) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); }
    return {
      dispose,
      draw(time: number, x: number, y: number, colors: number[][], compact: boolean, dpr: number) {
        gl.useProgram(program); gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uniforms.time, time); gl.uniform2f(uniforms.pointer, x, y);
        gl.uniform1f(uniforms.aspect, canvas.width / canvas.height);
        ["colorA", "colorB", "colorC"].forEach((key, i) => gl.uniform3fv(uniforms[key], colors[i]));
        gl.bindBuffer(gl.ARRAY_BUFFER, mainBuffer); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
        if (!orbital) { gl.drawArrays(gl.TRIANGLES, 0, 6); return; }
        for (let ring = 0; ring < 3; ring++) {
          gl.uniform1f(uniforms.ring, ring); gl.uniform1f(uniforms.points, 0);
          gl.drawArrays(gl.LINE_STRIP, 0, segments + 1);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, particles); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(uniforms.points, 1); gl.uniform1f(uniforms.size, 8 * dpr);
        for (let ring = 0; ring < (compact ? 2 : 3); ring++) {
          gl.uniform1f(uniforms.ring, ring); gl.drawArrays(gl.POINTS, 0, compact ? 4 : 8);
        }
      }
    };
  } catch (error) {
    canvas.dataset.fallbackReason = error instanceof Error ? error.message : "WebGL initialization unavailable";
    dispose(); return null;
  }
}

export default function NeuralScene({ kind, mode }: { kind: "aurora" | "orbit"; mode: VisualMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; canvasRef.current?.dispatchEvent(new Event("neural-theme")); }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>("#home");
    if (!canvas || !hero) return;
    const orbital = kind === "orbit";
    let renderer = createRenderer(canvas, orbital);
    canvas.dataset.renderer = renderer ? "webgl" : "fallback";
    if (!renderer) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const motionOff = () => reduced.matches || hero.dataset.userPaused === "true";
    const compact = matchMedia("(max-width: 767px), (pointer: coarse)");
    let frame = 0, visible = false, previous = 0, time = 0, lastDraw = 0;
    let dpr = 1, quality = 1, slowFrames = 0;
    let targetX = 0, targetY = 0, x = 0, y = 0;
    const colors: number[][] = visualModes[modeRef.current].colors.map(color => [...color]);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Aurora deliberately renders at lower resolution; orbital edges stay sharp.
      dpr = Math.min(devicePixelRatio || 1, compact.matches ? 1 : 1.5) * quality * (orbital ? 1 : .65);
      canvas.width = Math.max(1, Math.round(rect.width * dpr)); canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    const draw = () => {
      const target = visualModes[modeRef.current].colors;
      colors.forEach((color, i) => color.forEach((value, j) => { color[j] = motionOff() ? target[i][j] : value + (target[i][j] - value) * .08; }));
      renderer?.draw(time, x, y, colors, compact.matches, dpr);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || motionOff() || !renderer) { canvas.dataset.active = "false"; return; }
      const dt = previous ? now - previous : 16; previous = now;
      if (dt > 40) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 80 && quality > .65) { quality = .65; resize(); slowFrames = 0; canvas.dataset.quality = "adaptive"; }
      if (now - lastDraw >= (compact.matches ? 32 : 16)) {
        time += Math.min(now - (lastDraw || now), 50) / 1000; lastDraw = now;
        x += (targetX - x) * .08; y += (targetY - y) * .08;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0; lastDraw = 0;
      const active = visible && !document.hidden && !motionOff() && !!renderer;
      canvas.dataset.active = String(active);
      if (motionOff()) { x = y = targetX = targetY = time = 0; draw(); }
      if (active) frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      if (motionOff() || compact.matches || event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    };
    const leave = () => { targetX = targetY = 0; };
    const lost = (event: Event) => { event.preventDefault(); renderer = null; canvas.dataset.renderer = "fallback"; sync(); };
    const restored = () => { renderer = createRenderer(canvas, orbital); canvas.dataset.renderer = renderer ? "webgl" : "fallback"; resize(); draw(); sync(); };
    const theme = () => { if (motionOff()) draw(); };
    const sizeObserver = new ResizeObserver(() => { resize(); draw(); }); sizeObserver.observe(canvas);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }); observer.observe(canvas);
    canvas.addEventListener("webglcontextlost", lost); canvas.addEventListener("webglcontextrestored", restored); canvas.addEventListener("neural-theme", theme);
    hero.addEventListener("pointermove", move, { passive: true }); hero.addEventListener("pointerleave", leave);
    reduced.addEventListener("change", sync); compact.addEventListener("change", resize); document.addEventListener("visibilitychange", sync);
    hero.addEventListener("neural-pause", sync);
    resize(); draw();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); sizeObserver.disconnect();
      hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave);
      reduced.removeEventListener("change", sync); compact.removeEventListener("change", resize); document.removeEventListener("visibilitychange", sync);
      hero.removeEventListener("neural-pause", sync);
      canvas.removeEventListener("webglcontextlost", lost); canvas.removeEventListener("webglcontextrestored", restored); canvas.removeEventListener("neural-theme", theme);
      // Delete owned resources, but do not force context loss: React Strict
      // Mode immediately remounts effects on the same canvas in development.
      renderer?.dispose();
    };
  }, [kind]);

  return <canvas ref={canvasRef} aria-hidden="true" className={kind === "aurora" ? styles.auroraCanvas : styles.orbitCanvas} data-neural-canvas={kind}/>;
}
