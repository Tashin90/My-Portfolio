"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";
import styles from "../Hero.module.css";

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
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }); observer.observe(node);
    preference.addEventListener("change", sync); document.addEventListener("visibilitychange", sync);
    hero?.addEventListener("neural-pause", sync);
    return () => { observer.disconnect(); preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); hero?.removeEventListener("neural-pause", sync); };
  }, []);
  return { ref, active };
}

const roles = portfolio.role.split(" · ");

export function RoleEngine() {
  const { ref, active } = useMotionActivity();
  const [text, setText] = useState<string>(roles[0]);
  useEffect(() => {
    if (!active) return;
    let index = 0, length = roles[0].length, deleting = true;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const role = roles[index];
      length += deleting ? -1 : 1;
      setText(role.slice(0, Math.max(0, length)));
      let delay = deleting ? 45 : 90;
      if (length <= 0) { deleting = false; index = (index + 1) % roles.length; delay = 350; }
      else if (length >= role.length) { deleting = true; delay = 2300; }
      timer = setTimeout(step, delay);
    };
    setText(roles[0]); timer = setTimeout(step, 2300);
    return () => clearTimeout(timer);
  }, [active]);
  return <div ref={ref} className={styles.roleEngine}><span className="sr-only">{portfolio.role}</span><span aria-hidden="true" className={styles.roleVisual}><span className={styles.promptSymbol}>~/</span> {active ? text : roles[0]}<span className={styles.cursor}>▌</span></span></div>;
}

const terminalSteps = [
  { command: "npm run dev", output: "Exploring interfaces with React + Next.js" },
  { command: "git status", output: "Learning through real projects · Git + GitHub" },
  { command: "npm run build", output: "Building practical software, one iteration at a time" },
  { command: "// research interests", output: "Machine Learning · AI · Academic Research" }
] as const;

export function DeveloperTerminal() {
  const { ref, active } = useMotionActivity();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setIndex(value => (value + 1) % terminalSteps.length), 5600);
    return () => clearInterval(timer);
  }, [active]);
  const step = terminalSteps[active ? index : 0];
  return <div ref={ref} className={styles.terminal} aria-label="Decorative developer terminal simulation">
    <div className={styles.terminalBar}><span aria-hidden="true" className={styles.terminalDots}><i/><i/><i/></span><span>tashin / workspace</span><span className={styles.simulationLabel}>SIMULATION</span></div>
    <span className="sr-only">An illustrative terminal about web development, Git, and research interests. No commands are executed.</span>
    <div aria-hidden="true" key={step.command} className={styles.terminalOutput}><p><span className={styles.promptSymbol}>❯</span> {step.command}<span className={styles.cursor}>▌</span></p><p>{step.output}</p></div>
  </div>;
}
