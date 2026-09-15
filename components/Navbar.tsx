"use client";

import { useEffect, useState } from "react";
import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [light, setLight] = useState(false);

  useEffect(() => {
    const sections = ["home", ...portfolio.nav.map(item => item.toLowerCase())];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: "-25% 0px -60%" });
    sections.forEach(id => document.getElementById(id) && observer.observe(document.getElementById(id)!));
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => { setLight(value => { document.documentElement.classList.toggle("light", !value); return !value; }); };
  return <header className="site-nav fixed inset-x-0 top-0 z-50 border-b border-white/[.06] bg-[#070a13]/75 backdrop-blur-xl">
    <nav className="container-x flex h-[76px] items-center justify-between gap-6" aria-label="Main navigation">
      <a href="#home" className="focus-ring flex shrink-0 items-center gap-3 rounded-lg" onClick={() => setOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/35 bg-violet-400/10 font-mono text-sm font-bold text-violet-200">T.</span><span className="text-sm font-semibold tracking-tight text-white">Tashin<span className="text-violet-300">.</span></span></a>
      <div className="hidden items-center gap-1 lg:flex">{portfolio.nav.map(item => { const id = item.toLowerCase(); return <a key={item} href={`#${id}`} className={`focus-ring relative rounded-lg px-3 py-2 text-xs transition ${active === id ? "text-white" : "text-slate-400 hover:text-white"}`}>{active === id && <span className="absolute inset-x-3 -bottom-[14px] h-px bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,.9)]"/>}{item}</a>; })}</div>
      <div className="hidden items-center gap-2 sm:flex"><button type="button" onClick={toggleTheme} className="focus-ring rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-violet-300/40 hover:text-white" aria-label={light ? "Use dark theme" : "Use light theme"}><Icon name={light ? "moon" : "sun"} size={16}/></button><a href={portfolio.resume} className="focus-ring rounded-lg border border-violet-300/40 bg-violet-300/10 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-300 hover:text-slate-950">Resume / CV</a></div>
      <button type="button" className="focus-ring rounded-lg p-2 text-slate-300 sm:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(value => !value)}><Icon name={open ? "x" : "menu"} size={21}/></button>
    </nav>
    {open && <div className="border-t border-white/[.07] bg-[#070a13] px-5 py-5 sm:hidden"><div className="container-x flex flex-col gap-2">{portfolio.nav.map(item => { const id = item.toLowerCase(); return <a key={item} href={`#${id}`} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-3 text-sm ${active === id ? "bg-violet-300/10 text-violet-200" : "text-slate-300"}`}>{item}</a>; })}<a href={portfolio.resume} className="mt-2 rounded-lg bg-violet-300 px-3 py-3 text-center text-sm font-semibold text-slate-950">Download CV</a></div></div>}
  </header>;
}
