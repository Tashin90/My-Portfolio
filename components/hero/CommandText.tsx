"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";
import styles from "../Hero.module.css";

const statements = [
  { lead: "Build", signal: "with curiosity." },
  { lead: "Create", signal: "with logic." },
  { lead: "Research", signal: "with purpose." },
  { lead: "Engineer", signal: "with intent." }
] as const;

const roles = portfolio.role
  .split("·")
  .map(role => role.replaceAll("Â", "").trim())
  .filter(Boolean);

function useMotionActivity() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const hero = node.closest<HTMLElement>("#home");
    let visible = false;
    const sync = () => setActive(visible && !document.hidden && !preference.matches && hero?.dataset.userPaused !== "true");
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    });
    observer.observe(node);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    hero?.addEventListener("neural-pause", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      hero?.removeEventListener("neural-pause", sync);
    };
  }, []);

  return { ref, active };
}

export function StatementEngine() {
  const { ref, active } = useMotionActivity();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % statements.length), 3600);
    return () => window.clearInterval(timer);
  }, [active]);

  const statement = statements[active ? index : 0];
  return (
    <div ref={ref} className={styles.statementEngine} aria-live="polite">
      <span className="sr-only">{statement.lead} {statement.signal}</span>
      <div aria-hidden="true" key={`${statement.lead}-${statement.signal}`} className={styles.statementFrame}>
        <span className={styles.statementLead}>{statement.lead}</span>
        <span className={styles.statementSignal}>{statement.signal}</span>
      </div>
      <div className={styles.statementIndex} aria-hidden="true">
        {statements.map((_, itemIndex) => <i key={itemIndex} data-active={itemIndex === index}/>) }
      </div>
    </div>
  );
}

export function RoleEngine() {
  const { ref, active } = useMotionActivity();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || roles.length < 2) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % roles.length), 2600);
    return () => window.clearInterval(timer);
  }, [active]);

  const role = roles[active ? index : 0] ?? portfolio.role;
  return (
    <div ref={ref} className={styles.roleEngine}>
      <span className={styles.rolePrefix} aria-hidden="true">ACTIVE ROLE</span>
      <span className={styles.roleViewport} aria-live="polite">
        <span key={role} className={styles.roleText}>{role}</span>
      </span>
    </div>
  );
}

const terminalLines = [
  { prompt: "system", message: "initializing portfolio interface..." },
  { prompt: "index", message: `loading ${portfolio.projects.length} featured projects...` },
  { prompt: "links", message: "syncing profile links..." },
  { prompt: "status", message: "available for opportunities" },
  { prompt: "modules", message: "web / software / research" }
] as const;

export function DeveloperTerminal() {
  const { ref, active } = useMotionActivity();
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setCursor(value => (value + 1) % terminalLines.length), 1500);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <section ref={ref} className={styles.terminal} aria-label="Illustrative portfolio system activity">
      <div className={styles.terminalHeader}>
        <span className={styles.terminalLights} aria-hidden="true"><i/><i/><i/></span>
        <span>OMEGA://portfolio/activity</span>
        <span className={styles.simulationBadge}>SIMULATED FEED</span>
      </div>
      <div className={styles.terminalBody}>
        {terminalLines.map((line, lineIndex) => (
          <p key={line.prompt} data-active={lineIndex === cursor}>
            <span>[{line.prompt}]</span>
            <span>{line.message}</span>
            {lineIndex === cursor && <i aria-hidden="true"/>}
          </p>
        ))}
      </div>
    </section>
  );
}
