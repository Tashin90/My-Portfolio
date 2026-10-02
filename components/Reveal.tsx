"use client";

import { motion, useReducedMotion } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

type RevealProps = { children: ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "scale" };

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal({ children, className = "", delay = 0, direction = "up" }, ref) {
  const reduced = useReducedMotion();
  const initial = direction === "left" ? { opacity: 0, x: -22 } : direction === "right" ? { opacity: 0, x: 22 } : direction === "scale" ? { opacity: 0, scale: .975 } : { opacity: 0, y: 18 };
  return <motion.div ref={ref} className={className} initial={reduced ? false : initial} whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .58, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
});
