"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, ExternalLink, LoaderCircle, Send } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import { InteractiveCard } from "@/components/InteractiveCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import styles from "./PortfolioSections.module.css";

const buildingDetails = portfolio.currentlyBuilding.map(item => {
  const project = portfolio.projects.find(candidate => candidate.title === item.title);
  return { ...item, repo: project?.repo, stack: project?.stack ?? (item.title.includes("Research") ? ["Research Methodology"] : []) };
});

export function CurrentlyBuilding() {
  return (
    <section id="building" data-omega-section className={styles.section}>
      <div className="container-x">
        <Reveal><SectionHeading number="05" eyebrow="Development pipeline" title="Work and questions in motion." body="Documented projects and academic exploration currently shaping the next layer of my learning path."/></Reveal>
        <div className={styles.pipeline}>
          {buildingDetails.map((item, index) => (
            <Reveal key={item.title} delay={index * .065} direction={index % 2 ? "right" : "left"}>
              <InteractiveCard className={styles.pipelineCard} ariaLabel={`${item.title}, ${item.status}`}>
                <div className={styles.pipelineTop}><span className={styles.pipelineNode}><Icon name={item.icon} size={18}/></span><span className={styles.statusBadge}>{item.status}</span></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.stack.length > 0 && <div className={styles.pipelineStack}>{item.stack.map(technology => <span key={technology}>{technology}</span>)}</div>}
                {item.repo && <a href={item.repo} target="_blank" rel="noreferrer" className={`${styles.pipelineLink} focus-ring`}>Repository <ExternalLink size={12}/></a>}
              </InteractiveCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Achievements() {
  return (
    <section id="achievements" data-omega-section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container-x">
        <Reveal><SectionHeading number="06" eyebrow="Academic milestones" title="Verified progress, presented with context." body="A concise timeline of documented academic excellence and authorship—without invented credentials or statistics."/></Reveal>
        <div className={styles.achievementTimeline}>
          {portfolio.achievements.map((item, index) => {
            const featured = item.category === "Academic Excellence";
            return (
              <Reveal key={item.title} delay={index * .1} direction="right">
                <div className={styles.achievementItem}>
                  <span className={styles.achievementNode}><Icon name="award" size={12}/></span>
                  <InteractiveCard className={`${styles.achievementCard} ${featured ? styles.achievementFeatured : ""}`} ariaLabel={item.title}>
                    <div className={styles.achievementHead}><span className={styles.achievementCategory}>{item.category}</span><span className={styles.achievementDate}>{item.date}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.issuer}</p>
                    <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className={`${styles.credentialLink} focus-ring`}>Verify on LinkedIn <ArrowUpRight size={13}/></a>
                  </InteractiveCard>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ResearchQualifications() {
  return (
    <section id="research" data-omega-section className={styles.section}>
      <div className="container-x">
        <Reveal><SectionHeading number="07" eyebrow="Research & qualifications" title="Academic curiosity, clearly labeled." body="Research interests remain exploratory unless documented otherwise. Qualifications and learning activity are presented separately from published work."/></Reveal>
        <div className={styles.researchLayout}>
          <Reveal direction="left">
            <InteractiveCard className={styles.qualificationPanel} ariaLabel="Current academic qualification">
              <span className={styles.cardIcon}><Icon name="graduation" size={20}/></span>
              <h3>Computer Science &amp; Engineering</h3>
              <p>{portfolio.university}</p>
              <div className={styles.qualificationRows}>
                <div><span>Level</span><strong>Current bachelor-level study</strong></div>
                <div><span>Focus</span><strong>Web · OOP · Algorithms · Research</strong></div>
                <div><span>Status</span><strong>Actively learning and building</strong></div>
                <div><span>Location</span><strong>{portfolio.location}</strong></div>
              </div>
            </InteractiveCard>
          </Reveal>
          <div className={styles.researchGrid}>
            {portfolio.researchTopics.map((item, index) => (
              <Reveal key={item.title} delay={index * .045} direction={index % 2 ? "right" : "up"}>
                <InteractiveCard className={styles.researchCard} ariaLabel={`${item.title}, exploratory interest`}>
                  <div className={styles.researchStatus}><span className={styles.cardIcon}><Icon name={item.icon} size={18}/></span><span>{item.title === "Academic Research" ? "Learning" : "Exploratory interest"}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </InteractiveCard>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal direction="up">
          <div className={styles.learningPanel}>
            <h3 className={styles.subheading}>Current learning queue</h3>
            <div className={styles.learningQueue}>{portfolio.learning.map(item => <span key={item}>{item}</span>)}</div>
            <div className={styles.journeyGrid}>{portfolio.journey.map(item => <div className={styles.journeyItem} key={`${item.year}-${item.title}`}><span>{item.year}</span><h4>{item.title}</h4><p>{item.text}</p></div>)}</div>
          </div>
        </Reveal>

        <div className={styles.capabilityGrid}>
          {portfolio.services.map((item, index) => <Reveal key={item.title} delay={index * .035}><div className={styles.capabilityItem}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></div></Reveal>)}
        </div>
      </div>
    </section>
  );
}

type FormErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function Contact() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState("The form prepares a draft in your email application.");
  const [sending, setSending] = useState(false);

  const clearError = (field: keyof FormErrors) => setErrors(current => ({ ...current, [field]: undefined }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nextErrors: FormErrors = {};
    if (!values.name?.trim()) nextErrors.name = "Please enter your name.";
    if (!values.email?.trim()) nextErrors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Please enter a valid email address.";
    if (!values.subject?.trim()) nextErrors.subject = "Please add a subject.";
    if (!values.message?.trim()) nextErrors.message = "Please write a message.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("Please review the highlighted fields.");
      return;
    }
    setSending(true);
    setStatus("Opening your email application with a prepared draft…");
    const body = `From: ${values.name} (${values.email})\n\n${values.message}`;
    const target = `${portfolio.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
    window.setTimeout(() => {
      window.location.href = target;
      setSending(false);
    }, 180);
  };

  const fields = [
    { label: "Name", name: "name", type: "text", autoComplete: "name" },
    { label: "Email", name: "email", type: "email", autoComplete: "email" },
    { label: "Subject", name: "subject", type: "text", autoComplete: "off", full: true }
  ] as const;

  return (
    <section id="contact" data-omega-section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={`container-x ${styles.contactGrid}`}>
        <Reveal direction="left">
          <div className={styles.contactIntro}>
            <div className={styles.sectionIndex}><span>08</span><i/><span>Connection hub</span></div>
            <h2>Let&apos;s build something useful.</h2>
            <p>Have an opportunity, a project idea, or a question about what I&apos;m learning? Reach me directly or prepare a message through the form.</p>
            <div className={styles.contactLinks}>
              <a href={portfolio.github} target="_blank" rel="noreferrer" className={`${styles.contactLink} focus-ring`}><Icon name="github" size={18}/><span>github.com/Tashin90</span><ExternalLink size={13}/></a>
              <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className={`${styles.contactLink} focus-ring`}><Icon name="linkedin" size={18}/><span>LinkedIn profile</span><ExternalLink size={13}/></a>
              <a href={portfolio.email} className={`${styles.contactLink} focus-ring`}><Icon name="mail" size={18}/><span>{portfolio.emailLabel}</span></a>
            </div>
          </div>
        </Reveal>
        <Reveal direction="right">
          <form onSubmit={submit} noValidate className={styles.contactForm}>
            <div className={styles.formTop}><strong>Compose a message</strong><span>MAILTO / SECURE DRAFT</span></div>
            <div className={styles.formGrid}>
              {fields.map(field => <div className={`${styles.field} ${"full" in field && field.full ? styles.fieldFull : ""}`} key={field.name}><label htmlFor={`contact-${field.name}`}>{field.label}</label><input id={`contact-${field.name}`} name={field.name} type={field.type} autoComplete={field.autoComplete} aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `error-${field.name}` : undefined} onChange={() => clearError(field.name)}/>{errors[field.name] && <span id={`error-${field.name}`} className={styles.fieldError}>{errors[field.name]}</span>}</div>)}
              <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" rows={5} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "error-message" : undefined} onChange={() => clearError("message")}/>{errors.message && <span id="error-message" className={styles.fieldError}>{errors.message}</span>}</div>
            </div>
            <div className={styles.formFooter}><p className={styles.formStatus} role="status">{status}</p><button type="submit" disabled={sending} className={`${styles.submitButton} focus-ring`}>{sending ? <LoaderCircle className="animate-spin" size={16}/> : <Send size={15}/>}Open email draft</button></div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className={`${styles.footer} omega-site-footer`}>
      <div className={`container-x ${styles.footerInner}`}>
        <div className={styles.footerIdentity}><strong>{portfolio.name}</strong><span>{portfolio.role}</span></div>
        <nav className={styles.footerLinks} aria-label="Footer navigation"><a href="#home">Home</a><a href="#projects">Projects</a><a href="#research">Research</a><a href={portfolio.github} target="_blank" rel="noreferrer">GitHub</a><a href={portfolio.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={portfolio.resume}>Resume</a></nav>
        <p className={styles.footerMeta}>© {new Date().getFullYear()} · Built with curiosity.</p>
      </div>
    </footer>
  );
}
