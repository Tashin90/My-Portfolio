"use client";

import Image from "next/image";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import styles from "./Hero.module.css";

export default function Hero() {
  return <>
    <section id="home" className={`${styles.hero} hero-grid relative overflow-hidden pb-10 pt-[104px] sm:pb-12 sm:pt-[112px] lg:pb-12 lg:pt-24`}><div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[130px]"/><div className="pointer-events-none absolute right-0 top-20 h-[360px] w-[360px] rounded-full bg-cyan-400/[.07] blur-[110px]"/>
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_.75fr_.7fr] lg:gap-8">
        <div className="min-w-0">
          <div className="w-full max-w-2xl min-w-0">
            <div className={`${styles.enter} ${styles.availability} mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/[.07] px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-violet-200`}><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]"/>Available for opportunities</div>
            <p className="mb-5">
              <span className={`${styles.enter} ${styles.greeting} block font-mono text-xs text-slate-400`}>Hello, I&apos;m</span>{" "}
              <span className={`${styles.enter} ${styles.name} mt-1.5 block`}>{portfolio.name}</span>
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.07em] text-white sm:text-7xl lg:text-[clamp(4.2rem,6.2vw,5.6rem)]">
              <span className={`${styles.enter} ${styles.headingStart} inline-block whitespace-nowrap`}>Build with</span><br/>
              <span className={`${styles.enter} ${styles.headingEnd} ${styles.headlineAccent} text-gradient inline-block`}>curiosity.</span>
            </h1>
            <p className={`${styles.enter} ${styles.description} mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg`}>{portfolio.description}</p>
            <p className={`${styles.enter} ${styles.role} mt-4 font-mono text-xs uppercase tracking-[.15em] text-slate-400`}>{portfolio.role}</p>
            <div className={`${styles.enter} ${styles.actions} mt-9 flex flex-wrap gap-3`}>
              <a href="#projects" className={`${styles.action} ${styles.primaryAction} focus-ring inline-flex items-center gap-2 rounded-xl bg-violet-300 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(196,181,253,.18)] hover:bg-white`}>View featured projects <ArrowUpRight size={16}/></a>
              <a href="#contact" className={`${styles.action} ${styles.contactAction} focus-ring inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-white hover:border-cyan-300/50 hover:text-cyan-200`}>Contact me</a>
              <a href={portfolio.resume} aria-label="Download CV" className={`${styles.action} ${styles.resumeAction} focus-ring inline-flex items-center gap-2 rounded-xl border border-violet-300/25 bg-gradient-to-r from-violet-500/20 to-blue-500/20 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,.12)]`}><Download size={15}/> Download CV</a>
            </div>
            <div className={`${styles.enter} ${styles.socials} mt-8 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 text-xs sm:gap-3 sm:text-sm`}>
              <a href={portfolio.github} target="_blank" rel="noreferrer" aria-label="Visit GitHub profile" className={`${styles.social} ${styles.github} focus-ring inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-1 py-3 text-xs font-medium text-violet-100`}><span className={styles.socialIcon}><Icon name="github" size={16}/></span>GitHub</a>
              <a href={portfolio.linkedin} target="_blank" rel="noreferrer" aria-label="Visit LinkedIn profile" className={`${styles.social} ${styles.linkedin} focus-ring inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-1 py-3 text-xs font-medium text-cyan-100`}><span className={styles.socialIcon}><Icon name="linkedin" size={16}/></span>LinkedIn</a>
              <a href={portfolio.email} aria-label="Email Tashin" className={`${styles.social} ${styles.email} focus-ring inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-1 py-3 text-xs font-medium text-teal-100`}><span className={styles.socialIcon}><Mail size={16}/></span>Email</a>
            </div>
          </div>
        </div>
        <Reveal className={`${styles.viewportReveal} flex justify-center lg:justify-end`} delay={.2}>
          <div className={`${styles.portraitFloat} relative aspect-square w-[min(310px,calc(100vw-80px))] sm:w-[360px]`}>
            <div className={`${styles.portraitGlow} pointer-events-none absolute inset-0 rounded-full border border-violet-300/20 shadow-[0_0_64px_rgba(139,92,246,.18)]`}/>
            <div className={`${styles.innerRing} pointer-events-none absolute -inset-5 rounded-full border border-dashed border-cyan-300/20`}/>
            <div className={`${styles.outerRing} pointer-events-none absolute -inset-9 rounded-full border border-violet-300/15`}/>
            <div className={`${styles.portraitFrame} absolute inset-5 overflow-hidden rounded-full border-2 border-violet-200/50 bg-slate-900 p-2 shadow-[0_0_50px_rgba(34,211,238,.15)]`}><div className="relative h-full w-full overflow-hidden rounded-full"><Image src="/images/profile.png" alt="Md. Naimul Haque Tashin" fill sizes="(max-width: 640px) 280px, 330px" className="object-cover object-center" priority/></div></div>
            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-cyan-300/25 bg-[#0b1020]/90 px-4 py-2 text-xs font-medium text-cyan-100 shadow-xl backdrop-blur"><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]"/>Open to opportunities</div>
          </div>
        </Reveal>
        <Reveal className={`${styles.viewportReveal} grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2`} delay={.16}>{portfolio.stats.map(stat => <div key={stat.label} className="stat-card rounded-2xl border border-white/10 bg-white/[.035] p-4 transition hover:-translate-y-1 hover:border-violet-300/30"><p className="text-xl font-semibold tracking-tight text-white">{stat.value}</p><p className="mt-1 text-xs font-medium text-violet-200">{stat.label}</p><p className="mt-2 text-[11px] leading-5 text-slate-500">{stat.detail}</p></div>)}</Reveal>
      </div>
    </section>
    <div className="container-x relative z-10 -mt-2 grid gap-3 pb-24 sm:grid-cols-2 lg:grid-cols-4">{portfolio.infoCards.map(card => <a key={card.label} href={card.icon === "mail" ? portfolio.email : card.icon === "location" ? "#contact" : "#about"} className="info-card focus-ring rounded-2xl border border-white/10 bg-[#0d1324]/90 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-violet-300/35"><div className="mb-5 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/10 text-violet-200"><Icon name={card.icon}/></span><span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">{card.label}</span></div><p className="text-sm font-medium text-white">{card.value}</p><p className="mt-1 text-xs text-slate-500">{card.detail}</p></a>)}</div>
  </>;
}
