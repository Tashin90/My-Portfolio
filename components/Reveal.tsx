"use client";

import { motion, useReducedMotion } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

type RevealProps = { children: ReactNode; className?: string; delay?: number };

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal({ children, className = "", delay = 0 }, ref) {
  const reduced = useReducedMotion();
  return <motion.div ref={ref} className={className} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .14 }} transition={{ duration: .55, delay, ease: "easeOut" }}>{children}</motion.div>;
});
