"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./PortfolioSections.module.css";

export function InteractiveCard({ children, className = "", ariaLabel }: { children: ReactNode; className?: string; ariaLabel?: string }) {
  const cardRef = useRef<HTMLElement>(null);
  const frameRef = useRef(0);

  const move = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.setProperty("--card-rx", `${(-y * 3.2).toFixed(2)}deg`);
      card.style.setProperty("--card-ry", `${(x * 3.2).toFixed(2)}deg`);
      card.style.setProperty("--card-x", `${((x + .5) * 100).toFixed(1)}%`);
      card.style.setProperty("--card-y", `${((y + .5) * 100).toFixed(1)}%`);
    });
  };
  const reset = () => {
    cancelAnimationFrame(frameRef.current);
    const card = cardRef.current;
    if (!card) return;
    card.style.removeProperty("--card-rx");
    card.style.removeProperty("--card-ry");
    card.style.removeProperty("--card-x");
    card.style.removeProperty("--card-y");
  };

  return <article ref={cardRef} aria-label={ariaLabel} onPointerMove={move} onPointerLeave={reset} className={`${styles.interactiveCard} ${className}`}>{children}</article>;
}
