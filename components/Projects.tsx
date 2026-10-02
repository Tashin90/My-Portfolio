"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { portfolio, type Project } from "@/data/portfolio";
import { InteractiveCard } from "@/components/InteractiveCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import styles from "./PortfolioSections.module.css";

const filters = ["All", "Web", "Java", "C#", "C++", "Academic"];

function ProjectVisual({ project, index }: { project: Project; index: number }) {
  return (
    <div className={styles.projectVisual} aria-label={`Abstract visual for ${project.title}; no project screenshot is available`}>
      <div className={styles.visualGrid}/>
      <div className={styles.visualOrb}/>
      <span className={styles.projectCode}>{String(index + 1).padStart(2, "0")}</span>
      <div className={styles.visualMeta}><span>{project.category} / {project.type}</span><span>System concept</span></div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const featured = project.featured;
  const study = featured ? portfolio.gamingStoreCaseStudy : null;
  return (
    <InteractiveCard className={`${styles.projectCard} ${featured ? styles.featuredProject : ""}`} ariaLabel={`${project.title} project`}>
      <ProjectVisual project={project} index={index}/>
      <div className={styles.projectContent}>
        <span className={styles.projectType}>{featured ? "Primary featured work" : `${project.type} project`}</span>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {study && <p><strong>Goal:</strong> {study.goal}</p>}
        <div className={styles.projectStack}>{project.stack.map(item => <span key={item}>{item}</span>)}</div>
        <div className={styles.projectActions}>
          <span>{study?.status ?? "Selected portfolio work"}</span>
          <a href={project.repo} target="_blank" rel="noreferrer" className={`${styles.actionLink} focus-ring`}>GitHub repository <ExternalLink size={14}/></a>
        </div>
      </div>
    </InteractiveCard>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const visible = useMemo(() => portfolio.projects.filter(project => filter === "All" || project.category === filter || project.type === filter), [filter]);

  return (
    <section id="projects" data-omega-section className={styles.section}>
      <div className="container-x">
        <div className={styles.sectionToolbar}>
          <Reveal direction="left"><SectionHeading number="03" eyebrow="Premium showcase" title="Projects with practical learning value." body="Verified academic and practical projects, presented with their real descriptions, technology stacks, and repository links."/></Reveal>
          <div className={styles.filterGroup} role="group" aria-label="Filter projects">
            {filters.map(item => <button type="button" key={item} aria-pressed={filter === item} data-active={filter === item} onClick={() => setFilter(item)} className={`${styles.filterButton} focus-ring`}>{item}</button>)}
          </div>
        </div>
        <motion.div layout className={styles.projectGrid}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, index) => (
              <motion.div className={project.featured ? styles.featuredProjectWrap : ""} layout key={project.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} transition={{ duration: .32 }}>
                <ProjectCard project={project} index={portfolio.projects.indexOf(project)}/>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
