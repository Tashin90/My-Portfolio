"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDownRight, ArrowUpRight, Download, Mail } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import { DeveloperTerminal, RoleEngine, StatementEngine } from "./hero/CommandText";
import { HolographicCore } from "./hero/HolographicCore";
import { ModeSwitcher } from "./hero/ModeSwitcher";
import { NeuralPanels } from "./hero/NeuralPanels";
import NeuralScene from "./hero/NeuralScene";
import { visualModes, type VisualMode } from "./hero/visualModes";
import styles from "./Hero.module.css";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<VisualMode>("cyan");
  const [paused, setPaused] = useState(false);
  const palette = visualModes[mode];

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    hero.dispatchEvent(new Event("neural-pause"));
  }, [paused]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let pointerFrame = 0;
    let visible = true;

    const syncMotion = () => {
      hero.dataset.motion = visible && !document.hidden && !reducedMotion.matches && hero.dataset.userPaused !== "true" ? "running" : "paused";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || pointerFrame || event.pointerType === "touch") return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const bounds = hero.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
        hero.style.setProperty("--pointer-x", x.toFixed(3));
        hero.style.setProperty("--pointer-y", y.toFixed(3));
        hero.style.setProperty("--light-x", `${event.clientX - bounds.left}px`);
        hero.style.setProperty("--light-y", `${event.clientY - bounds.top}px`);

        const panel = (event.target as Element).closest<HTMLElement>("[data-panel]");
        hero.querySelectorAll<HTMLElement>("[data-panel]").forEach(item => {
          if (item !== panel) {
            item.style.removeProperty("--panel-x");
            item.style.removeProperty("--panel-y");
          }
        });
        if (panel) {
          const panelBounds = panel.getBoundingClientRect();
          panel.style.setProperty("--panel-x", `${((event.clientX - panelBounds.left) / panelBounds.width) * 100}%`);
          panel.style.setProperty("--panel-y", `${((event.clientY - panelBounds.top) / panelBounds.height) * 100}%`);
        }
      });
    };
    const resetPointer = () => {
      hero.style.setProperty("--pointer-x", "0");
      hero.style.setProperty("--pointer-y", "0");
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncMotion();
    });

    observer.observe(hero);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", resetPointer);
    hero.addEventListener("neural-pause", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    syncMotion();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(pointerFrame);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", resetPointer);
      hero.removeEventListener("neural-pause", syncMotion);
      reducedMotion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
    };
  }, []);

  const themeStyle = {
    "--accent": palette.primary,
    "--accent-alt": palette.secondary,
    "--accent-third": palette.tertiary
  } as CSSProperties;

  return (
    <section
      ref={heroRef}
      id="home"
      className={styles.hero}
      data-visual-mode={mode}
      data-user-paused={paused}
      data-motion="running"
      style={themeStyle}
    >
      <NeuralScene kind="aurora" mode={mode}/>
      <div className={styles.auroraFallback} aria-hidden="true"><i/><i/><i/></div>
      <div className={styles.perspectiveGrid} aria-hidden="true"/>
      <div className={styles.noiseLayer} aria-hidden="true"/>
      <div className={styles.pointerLight} aria-hidden="true"/>

      <div className={styles.commandShell}>
        <header className={styles.systemBar}>
          <div><span className={styles.liveDot}/> OMEGA X / NEURAL COMMAND CENTER</div>
          <div className={styles.systemReadout}><span>PORTFOLIO OS</span><b>v2.6</b><span>SECURE CONNECTION</span></div>
          <div className={styles.clockLine}>DHAKA <span>UTC +06:00</span></div>
        </header>

        <div className={styles.cockpit}>
          <section className={styles.identityConsole} aria-labelledby="hero-name">
            <div className={styles.consoleCorners} aria-hidden="true"><i/><i/><i/><i/></div>
            <div className={styles.identityStatus}><span>IDENTITY NODE</span><i/> ONLINE</div>
            <p className={styles.greeting}>Hello, I&apos;m</p>
            <h1 id="hero-name" className={styles.name}>{portfolio.name}</h1>
            <StatementEngine/>
            <RoleEngine/>
            <p className={styles.description}>{portfolio.description}</p>

            <div className={styles.actions}>
              <a href="#projects" className={`${styles.primaryAction} focus-ring`}><span className={styles.buttonLabel}>Explore Projects</span><ArrowUpRight size={18}/><span className={styles.buttonSweep} aria-hidden="true"/></a>
              <a href={portfolio.resume} className={`${styles.secondaryAction} focus-ring`}><Download size={18}/><span className={styles.buttonLabel}>Download CV</span><span className={styles.buttonSweep} aria-hidden="true"/></a>
            </div>

            <div className={styles.contactStrip}>
              <a href={portfolio.github} target="_blank" rel="noreferrer" className={`${styles.githubButton} focus-ring`} aria-label="Open GitHub profile"><Icon name="github" size={19}/><span>GitHub</span><span className={styles.buttonSweep} aria-hidden="true"/></a>
              <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className={`${styles.linkedinButton} focus-ring`} aria-label="Open LinkedIn profile"><Icon name="linkedin" size={19}/><span>LinkedIn</span><span className={styles.buttonSweep} aria-hidden="true"/></a>
              <a href={portfolio.email} className={`${styles.emailButton} focus-ring`} aria-label={`Email ${portfolio.name}`}><Mail size={19}/><span>Email</span><span className={styles.buttonSweep} aria-hidden="true"/></a>
            </div>
          </section>

          <section className={styles.coreZone} aria-label="Interactive holographic identity core">
            <ModeSwitcher mode={mode} paused={paused} onModeChange={setMode} onPauseChange={() => setPaused(value => !value)}/>
            <HolographicCore mode={mode}/>
          </section>

          <NeuralPanels/>

          <div className={styles.terminalDock}>
            <DeveloperTerminal/>
          </div>

          <aside className={styles.systemRail} aria-label="System status">
            <div><span>AVAILABILITY</span><strong><i/> OPEN TO OPPORTUNITIES</strong></div>
            <div><span>FOCUS</span><strong>WEB / SOFTWARE / RESEARCH</strong></div>
            <div><span>LOCATION</span><strong>{portfolio.location.toUpperCase()}</strong></div>
          </aside>
        </div>

        <footer className={styles.commandFooter}>
          <a href="#about" className="focus-ring"><span>ENTER PORTFOLIO</span><ArrowDownRight size={16}/></a>
          <div aria-hidden="true"><i/><span>INTERFACE STABLE</span><i/><span>ALL SYSTEMS NOMINAL</span></div>
          <span>SCROLL TO EXPLORE / 01—07</span>
        </footer>
      </div>
    </section>
  );
}
