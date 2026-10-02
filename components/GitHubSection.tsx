"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, GitFork, Search, Star } from "lucide-react";
import { portfolio, type GithubRepository } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import { InteractiveCard } from "@/components/InteractiveCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import styles from "./PortfolioSections.module.css";

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

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github", { signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); return body; })
      .then(setRepositories)
      .catch(fetchError => { if (fetchError.name !== "AbortError") setError(fetchError.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => repositories
    .filter(repo => repo.name !== "Tashin90")
    .filter(repo => matches(repo, filter))
    .filter(repo => `${repo.name} ${repo.description ?? ""} ${repo.language ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()))
    .slice(0, 12), [repositories, filter, query]);

  return (
    <section id="github" data-omega-section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container-x">
        <div className={styles.sectionToolbar}>
          <Reveal direction="left"><SectionHeading number="04" eyebrow="Developer activity center" title="Public repositories, without inflated metrics." body="Live repository data from GitHub with graceful fallback behavior when the external API is unavailable."/></Reveal>
          <a href={portfolio.github} target="_blank" rel="noreferrer" className={`${styles.githubHeaderAction} focus-ring`}>Open GitHub profile <ExternalLink size={15}/></a>
        </div>

        {!loading && !error && repositories.length > 0 && (
          <div className={styles.repoControls}>
            <label className={styles.searchBox}><Search size={16}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search repositories, descriptions, or languages" aria-label="Search repositories"/></label>
            <div className={styles.filterGroup} role="group" aria-label="Filter repositories">{filters.map(item => <button key={item} type="button" aria-pressed={filter === item} data-active={filter === item} onClick={() => setFilter(item)} className={`${styles.filterButton} focus-ring`}>{item}</button>)}</div>
          </div>
        )}

        {loading && <div className={styles.skeletonGrid} aria-label="Loading repositories">{[1,2,3,4,5,6].map(item => <div key={item} className={styles.skeleton}/>)}</div>}
        {!loading && error && <div className={styles.statePanel}>GitHub data could not be loaded right now. <a href={portfolio.github} target="_blank" rel="noreferrer">Open the profile directly</a>.</div>}
        {!loading && !error && visible.length === 0 && <div className={styles.statePanel}>No repositories match the current search and filter.</div>}
        {!loading && !error && visible.length > 0 && (
          <div className={styles.repoGrid}>
            {visible.map((repo, index) => (
              <Reveal key={repo.name} delay={index * .035} direction={index % 3 === 0 ? "left" : "up"}>
                <InteractiveCard className={styles.repoCard} ariaLabel={`${repo.name} GitHub repository`}>
                  <div className={styles.repoTop}><span className={styles.cardIcon}><Icon name="github" size={18}/></span><a href={repo.url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name} on GitHub`} className="focus-ring"><ExternalLink size={16}/></a></div>
                  <h3>{repo.name}</h3>
                  <p>{repo.description || "A public repository from my learning and building journey."}</p>
                  <div className={styles.projectStack}>{repo.language && <span>{repo.language}</span>}{repo.topics.slice(0, 2).map(topic => <span key={topic}>{topic}</span>)}</div>
                  <div className={styles.repoMeta}><span><Star size={12}/>{repo.stars}</span><span><GitFork size={12}/>{repo.forks}</span><span>Updated {updated(repo.updatedAt)}</span></div>
                  <a href={repo.url} target="_blank" rel="noreferrer" className={`${styles.repoLink} focus-ring`}>View repository <ExternalLink size={13}/></a>
                </InteractiveCard>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
