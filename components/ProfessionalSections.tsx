"use client";

import { ArrowUpRight, Check, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import styles from "./PortfolioSections.module.css";

export function TechMarquee() {
  const items = [...portfolio.techStack, ...portfolio.techStack];
  const reduced = useReducedMotion();
  return <section aria-label="Technology stack" className={styles.marquee}>
    <div className={`container-x ${styles.marqueeInner}`}><span className={styles.marqueeLabel}>Working stack</span><div className={styles.marqueeTrack}><motion.div className="flex w-max gap-2" animate={reduced ? undefined : { x: [0, -680] }} transition={reduced ? undefined : { duration: 32, repeat: Infinity, ease: "linear" }}>
      {items.map((item, index) => <span key={`${item}-${index}`} className={styles.marqueeItem}>{item}</span>)}
    </motion.div></div></div>
  </section>;
}

export function FeaturedCaseStudy() {
  const project = portfolio.projects[0];
  const study = portfolio.gamingStoreCaseStudy;
  return <section id="case-study" className="section-pad border-y border-white/[.06] bg-[#080d1b]"><div className="container-x">
    <Reveal><div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="section-kicker">04 / Featured case study</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.05em] text-white sm:text-5xl">From concept to concrete work.</h2><p className="mt-5 max-w-xl leading-7 text-slate-400">A closer look at the project currently carrying the most learning value in my portfolio.</p></div><span className="w-fit rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-violet-100">Primary project</span></div></Reveal>
    <Reveal><article className="case-study-card relative overflow-hidden rounded-3xl border border-violet-300/25 bg-[#0d1324] shadow-[0_24px_90px_rgba(0,0,0,.28)]"><div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-cyan-300/10 bg-violet-400/[.06] blur-2xl"/><div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:p-12"><div><div className="flex items-center gap-3"><span className="font-mono text-5xl font-semibold tracking-[-.08em] text-white/[.12]">01</span><span className="rounded-full border border-violet-200/30 bg-violet-200/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-violet-100">Featured project</span></div><h3 className="mt-8 text-4xl font-semibold tracking-[-.06em] text-white sm:text-6xl">{project.title}</h3><p className="mt-6 max-w-xl text-base leading-8 text-slate-300">{study.overview}</p><div className="mt-8 flex flex-wrap gap-2">{project.stack.map(item => <span key={item} className="rounded-lg border border-violet-300/15 bg-violet-300/[.07] px-3 py-2 font-mono text-xs text-violet-100">{item}</span>)}</div><a href={project.repo} target="_blank" rel="noreferrer" className="focus-ring mt-9 inline-flex items-center gap-2 rounded-xl bg-violet-200 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white">View on GitHub <ExternalLink size={15}/></a></div><div className="grid gap-3 self-center sm:grid-cols-2 lg:grid-cols-1"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-violet-200">Project overview</p><p className="mt-3 text-sm leading-6 text-slate-400">{study.overview}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-cyan-200">Problem / goal</p><p className="mt-3 text-sm leading-6 text-slate-400">{study.goal}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-blue-200">Approach</p><p className="mt-3 text-sm leading-6 text-slate-400">{study.approach}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-teal-200">Current status</p><p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300"><Check size={15} className="text-teal-300"/>{study.status}</p></div></div></div></article></Reveal>
  </div></section>;
}
