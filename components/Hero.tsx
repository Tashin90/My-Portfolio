"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import styles from "./Hero.module.css";
import { DeveloperTerminal, RoleEngine } from "./hero/CommandText";
import { visualModes, type VisualMode } from "./hero/visualModes";

// A missing optional lazy chunk (for example on a first offline visit) must
// leave the CSS environment intact, not replace the portfolio with an error.
const NeuralScene = dynamic<{ kind: "aurora" | "orbit"; mode: VisualMode }>(() => import("./hero/NeuralScene").catch(() => ({ default: () => null })), { ssr: false });

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<VisualMode>("violet");
  const [paused, setPaused] = useState(false);
  const palette = visualModes[mode];

  useEffect(() => { heroRef.current?.dispatchEvent(new Event("neural-pause")); }, [paused]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    let firstFrame = 0;
    let secondFrame = 0;
    const cancel = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      animations.forEach(animation => animation.cancel());
    };
    const onPreferenceChange = () => { if (preference.matches || hero.dataset.userPaused === "true") cancel(); };
    preference.addEventListener("change", onPreferenceChange);
    hero.addEventListener("neural-pause", onPreferenceChange);

    if (!preference.matches) {
      // Base CSS stays visible without JS. Start only after hydration and a paint
      // opportunity, so CSS parsing cannot consume the entrance beforehand.
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (preference.matches) return;
          hero.querySelectorAll<HTMLElement>("[data-hero-reveal]").forEach(element => {
            if (typeof element.animate !== "function") return;
            const name = element.dataset.heroReveal === "name";
            const heading = element.dataset.heroReveal === "heading";
            animations.push(element.animate([
              { opacity: 0, transform: `translate3d(0, ${name ? 16 : 20}px, 0)` },
              { opacity: 1, transform: "translate3d(0, 0, 0)" }
            ], {
              duration: name ? 900 : heading ? 850 : 700,
              delay: Number(element.dataset.heroDelay ?? 0) * 1000,
              easing: "cubic-bezier(.2, .65, .3, 1)",
              // Only fill the delay; finished effects release transforms so
              // the existing hover styles keep working naturally.
              fill: "backwards"
            }));
          });
        });
      });
    }

    return () => { cancel(); preference.removeEventListener("change", onPreferenceChange); hero.removeEventListener("neural-pause", onPreferenceChange); };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false, pointerFrame = 0;
    let currentTarget: HTMLElement | null = null;
    const sync = () => { hero.dataset.motion = visible && !document.hidden && !reduced.matches && hero.dataset.userPaused !== "true" ? "running" : "paused"; };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }); observer.observe(hero);
    const reset = () => {
      currentTarget?.style.removeProperty("--mx"); currentTarget?.style.removeProperty("--my");
      currentTarget?.style.removeProperty("--tilt-x"); currentTarget?.style.removeProperty("--tilt-y");
      currentTarget = null;
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || hero.dataset.userPaused === "true" || !fine.matches || pointerFrame || event.pointerType === "touch") return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--light-x", `${event.clientX - rect.left}px`); hero.style.setProperty("--light-y", `${event.clientY - rect.top}px`);
        const target = (event.target as Element).closest<HTMLElement>("[data-magnetic], [data-panel]");
        if (target !== currentTarget) reset(); currentTarget = target;
        if (!target) return;
        const box = target.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - .5, y = (event.clientY - box.top) / box.height - .5;
        target.style.setProperty("--mx", `${x * 7}px`); target.style.setProperty("--my", `${y * 5}px`);
        target.style.setProperty("--tilt-x", `${-y * 6}deg`); target.style.setProperty("--tilt-y", `${x * 6}deg`);
        target.style.setProperty("--panel-x", `${(x + .5) * 100}%`); target.style.setProperty("--panel-y", `${(y + .5) * 100}%`);
      });
    };
    const preferenceChange = () => { reset(); sync(); };
    hero.addEventListener("pointermove", move, { passive: true }); hero.addEventListener("pointerleave", reset);
    reduced.addEventListener("change", preferenceChange); document.addEventListener("visibilitychange", sync);
    hero.addEventListener("neural-pause", preferenceChange);
    return () => { observer.disconnect(); cancelAnimationFrame(pointerFrame); reset(); hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", reset); reduced.removeEventListener("change", preferenceChange); hero.removeEventListener("neural-pause", preferenceChange); document.removeEventListener("visibilitychange", sync); };
  }, []);

  return <>
    <section ref={heroRef} id="home" data-visual-mode={mode} data-user-paused={paused} data-motion="paused" style={{ "--accent": palette.primary, "--accent-alt": palette.secondary, "--accent-third": palette.tertiary } as CSSProperties} className={`${styles.hero} relative overflow-hidden`}>
      <NeuralScene kind="aurora" mode={mode}/>
      <div className={styles.commandGrid} aria-hidden="true"/>
      <div className={`container-x ${styles.commandHeader}`}><span><span className={styles.statusDot}/> PERSONAL DEVELOPER WORKSPACE</span><span>OMEGA X <b>/</b> V.06</span></div>
      <div className={`container-x ${styles.commandLayout}`}>
        <div className={styles.identity}>
          <div className="w-full max-w-2xl min-w-0">
            <div data-hero-reveal="availability" className={styles.availability}><span className={styles.statusDot}/>Available for opportunities</div>
            <p className="mb-5">
              <span data-hero-reveal="greeting" data-hero-delay="0.04" className="block font-mono text-xs text-slate-400">Hello, I&apos;m</span>{" "}
              <span className={`${styles.name} mt-1.5 block`}>
                {portfolio.name.split(" ").map((word, index, words) => <Fragment key={`${word}-${index}`}><span data-hero-reveal="name" data-hero-delay={.08 + index * .06} className={styles.nameWord}>{word}</span>{index < words.length - 1 ? " " : null}</Fragment>)}
              </span>
            </p>
            <h1 className={styles.headline}>
              <span className="sr-only">Build with curiosity.</span>
              <span aria-hidden="true" data-hero-reveal="heading" data-hero-delay="0.48" className="inline-block whitespace-nowrap"><span className={styles.headlineWord}>Build</span> <span className={styles.headlineWord}>with</span></span><br/>
              <span aria-hidden="true" data-hero-reveal="heading" data-hero-delay="0.65" className="inline-block"><span className={`${styles.headlineWord} ${styles.headlineAccent}`}>curiosity.</span></span>
            </h1>
            <p data-hero-reveal="description" data-hero-delay="1.52" className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">{portfolio.description}</p>
            <div data-hero-reveal="role" data-hero-delay="1.6"><RoleEngine/></div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a data-magnetic data-hero-reveal="action" data-hero-delay="1.85" href="#projects" className={`${styles.action} ${styles.primaryAction} focus-ring inline-flex items-center gap-2 rounded-xl bg-violet-300 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(196,181,253,.18)] hover:bg-white`}>View featured projects <ArrowUpRight size={16}/></a>
              <a data-magnetic data-hero-reveal="action" data-hero-delay="1.95" href="#contact" className={`${styles.action} ${styles.contactAction} focus-ring inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-white hover:border-cyan-300/50 hover:text-cyan-200`}>Contact me</a>
              <a data-magnetic data-hero-reveal="action" data-hero-delay="2.05" href={portfolio.resume} aria-label="Download CV" className={`${styles.action} ${styles.resumeAction} focus-ring inline-flex items-center gap-2 rounded-xl border border-violet-300/25 bg-gradient-to-r from-violet-500/20 to-blue-500/20 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,.12)]`}><Download size={15}/> Download CV</a>
            </div>
            <div className="mt-8 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 text-xs sm:gap-3 sm:text-sm">
              <a data-magnetic data-hero-reveal="social" data-hero-delay="2" href={portfolio.github} target="_blank" rel="noreferrer" aria-label="Visit GitHub profile" className={`${styles.social} ${styles.github} focus-ring inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-1 py-3 text-xs font-medium text-violet-100`}><span className={styles.socialIcon}><Icon name="github" size={16}/></span>GitHub</a>
              <a data-magnetic data-hero-reveal="social" data-hero-delay="2.1" href={portfolio.linkedin} target="_blank" rel="noreferrer" aria-label="Visit LinkedIn profile" className={`${styles.social} ${styles.linkedin} focus-ring inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-1 py-3 text-xs font-medium text-cyan-100`}><span className={styles.socialIcon}><Icon name="linkedin" size={16}/></span>LinkedIn</a>
              <a data-magnetic data-hero-reveal="social" data-hero-delay="2.2" href={portfolio.email} aria-label="Email Tashin" className={`${styles.social} ${styles.email} focus-ring inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-1 py-3 text-xs font-medium text-teal-100`}><span className={styles.socialIcon}><Mail size={16}/></span>Email</a>
            </div>
          </div>
        </div>
        <div className={styles.profileEnvironment}>
          <div className={styles.sceneLabel}><span>IDENTITY / HOLOGRAPHIC VIEW</span><span aria-hidden="true">03 ORBITS</span></div>
          <div className={styles.profileScene}>
            <div className={styles.orbitLayer}><NeuralScene kind="orbit" mode={mode}/><div className={styles.fallbackOrbits} aria-hidden="true"><i/><i/><i/></div></div>
            <div className={styles.profileFloat}>
            <div className={`${styles.portraitGlow} pointer-events-none absolute inset-0 rounded-full border border-violet-300/20 shadow-[0_0_64px_rgba(139,92,246,.18)]`}/>
            <div className={`${styles.portraitFrame} absolute inset-5 overflow-hidden rounded-full border-2 bg-slate-900 p-2`}><div className="relative h-full w-full overflow-hidden rounded-full"><Image src="/images/profile.png" alt="Md. Naimul Haque Tashin" fill sizes="(max-width: 767px) 240px, 270px" className="object-cover object-center" priority/></div><div className={styles.photoScan} aria-hidden="true"/></div>
            <div aria-hidden="true" className={`${styles.gradientRing} pointer-events-none absolute inset-5 rounded-full`}/>
            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-cyan-300/25 bg-[#0b1020]/90 px-4 py-2 text-xs font-medium text-cyan-100 shadow-xl backdrop-blur"><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]"/>Open to opportunities</div>
            </div>
          </div>
          <p className={styles.sceneHint}><span aria-hidden="true">⊹</span> Move your pointer to explore <span>/</span> {portfolio.location}</p>
        </div>
        <div className={styles.dataModules}>
          <div className={styles.moduleHeader}><span>NEURAL / DATA MODULES</span><span aria-hidden="true">↗</span></div>
          {portfolio.stats.map((stat, index) => <div key={stat.label} data-hero-reveal="panel" data-hero-delay={.95 + index * .14} className={styles.panelFloat} style={{ "--panel-delay": `${index * -1.9}s`, "--panel-duration": `${6.8 + index * .7}s` } as CSSProperties}><div data-panel className={styles.dataPanel}><div className={styles.panelTop}><span>{String(index + 1).padStart(2, "0")} / {stat.label}</span><span className={styles.statusDot}/></div><p className={styles.panelValue}>{stat.value}</p><p className={styles.panelDetail}>{stat.detail}</p><div className={styles.panelTrace} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>)}
        </div>
        <div className={styles.bottomDock}>
          <DeveloperTerminal/>
          <div className={styles.modeConsole}>
            <div className={styles.moduleHeader}><span>SCENE / VISUAL FREQUENCY</span><span aria-hidden="true">◈</span></div>
            <div className={styles.modeControls} role="group" aria-label="Hero visual mode">{(Object.keys(visualModes) as VisualMode[]).map((key, index) => <button key={key} type="button" className={`${styles.modeButton} focus-ring`} aria-pressed={mode === key} onClick={() => setMode(key)} style={{ "--swatch": visualModes[key].primary } as CSSProperties}><span aria-hidden="true">0{index + 1}<i/></span>{visualModes[key].label}</button>)}</div>
            <div className={styles.motionControls}><p>Same identity. A different spectrum.</p><button type="button" className="focus-ring" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Resume motion" : "Pause motion"}</button></div>
          </div>
        </div>
      </div>
    </section>
    <div className="container-x relative z-10 -mt-2 grid gap-3 pb-24 sm:grid-cols-2 lg:grid-cols-4">{portfolio.infoCards.map(card => <a key={card.label} href={card.icon === "mail" ? portfolio.email : card.icon === "location" ? "#contact" : "#about"} className="info-card focus-ring rounded-2xl border border-white/10 bg-[#0d1324]/90 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-violet-300/35"><div className="mb-5 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/10 text-violet-200"><Icon name={card.icon}/></span><span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">{card.label}</span></div><p className="text-sm font-medium text-white">{card.value}</p><p className="mt-1 text-xs text-slate-500">{card.detail}</p></a>)}</div>
  </>;
}
