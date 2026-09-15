"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, GitFork, Search, Star } from "lucide-react";
import { portfolio, type GithubRepository } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";

const filters = ["All", "Java", "C#", "C++", "Web", "Academic"];
function updated(value: string) { return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(value)); }
function matches(repo: GithubRepository, filter: string) {
  if (filter === "All") return true;
  if (filter === "Web") return ["HTML", "CSS", "JavaScript", "TypeScript", "React"].includes(repo.language ?? "") || repo.topics.some(topic => topic.toLowerCase().includes("web"));
  if (filter === "Academic") return repo.topics.some(topic => topic.toLowerCase().includes("academic")) || /gaming|stayfinder|rental|webtec|graphic/i.test(repo.name);
  return repo.language === filter;
}

export default function GitHubSection() {
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  useEffect(() => { fetch("/api/github").then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); return body; }).then(setRepositories).catch(error => setError(error.message)).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => repositories.filter(repo => !["Tashin90"].includes(repo.name)).filter(repo => matches(repo, filter)).filter(repo => `${repo.name} ${repo.description ?? ""} ${repo.language ?? ""}`.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 12), [repositories, filter, query]);
  return <section id="github" className="section-pad border-y border-white/[.06] bg-[#0a0e1b]"><div className="container-x"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="section-kicker">05 / GitHub activity</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.05em] text-white sm:text-5xl">Building in public.</h2><p className="mt-5 max-w-xl leading-7 text-slate-400">Real repository data from my public GitHub profile—an honest snapshot of what I&apos;m exploring and shipping.</p></div><a href={portfolio.github} target="_blank" rel="noreferrer" className="focus-ring inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200">Explore My GitHub <ExternalLink size={16}/></a></div>
    {!loading && !error && repositories.length > 0 && <div className="mt-10 flex flex-col gap-3 lg:flex-row"><label className="relative block flex-1"><Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search repositories..." aria-label="Search repositories" className="focus-ring w-full rounded-xl border border-white/10 bg-white/[.035] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"/></label><div className="flex flex-wrap gap-2" role="group" aria-label="Filter repositories">{filters.map(item => <button key={item} type="button" onClick={() => setFilter(item)} className={`focus-ring rounded-xl border px-3 py-2 text-xs transition ${filter === item ? "border-cyan-200 bg-cyan-200 text-slate-950" : "border-white/10 text-slate-400 hover:border-cyan-300/40 hover:text-white"}`}>{item}</button>)}</div></div>}
    {loading && <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(item => <div key={item} className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[.03]"/>)}</div>}
    {!loading && error && <div className="mt-12 rounded-2xl border border-amber-300/20 bg-amber-300/[.04] p-6 text-sm text-amber-100">{error} <a href={portfolio.github} target="_blank" rel="noreferrer" className="ml-2 underline">Open GitHub directly</a></div>}
    {!loading && !error && visible.length === 0 && <div className="mt-12 rounded-2xl border border-white/10 p-6 text-slate-400">No repositories match this search right now.</div>}
    {!loading && !error && visible.length > 0 && <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map((repo, index) => <Reveal key={repo.name} delay={index * .03}><article className="h-full rounded-2xl border border-white/10 bg-[#0d1324] p-6 transition hover:-translate-y-1 hover:border-cyan-300/30"><div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Icon name="github" size={17}/></span><a href={repo.url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name} on GitHub`} className="focus-ring rounded text-slate-500 hover:text-white"><ExternalLink size={17}/></a></div><h3 className="mt-6 truncate text-lg font-medium text-white">{repo.name}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{repo.description || "A public repository from my learning and building journey."}</p><div className="mt-5 flex flex-wrap gap-2">{repo.language && <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] text-cyan-100">{repo.language}</span>}{repo.topics.slice(0, 2).map(topic => <span key={topic} className="rounded-full bg-white/[.05] px-2.5 py-1 font-mono text-[10px] text-slate-400">{topic}</span>)}</div><div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-4 font-mono text-[10px] text-slate-500"><span className="inline-flex items-center gap-1"><Star size={12}/> {repo.stars}</span><span className="inline-flex items-center gap-1"><GitFork size={12}/> {repo.forks}</span><span className="ml-auto">Updated {updated(repo.updatedAt)}</span></div><a href={repo.url} target="_blank" rel="noreferrer" className="focus-ring mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-200 hover:text-white">View on GitHub <ExternalLink size={13}/></a></article></Reveal>)}</div>}
  </div></section>;
}
