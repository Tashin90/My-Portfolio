import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import { InteractiveCard } from "@/components/InteractiveCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import styles from "./PortfolioSections.module.css";

const marks: Record<string, string> = {
  "C#": "C#", "C++": "C++", Java: "JV", JavaScript: "JS", SQL: "SQL",
  HTML: "H5", CSS: "C3", React: "RE", "Next.js": "NX", "Tailwind CSS": "TW",
  "Data Structures": "DS", Algorithms: "AL", "Object-Oriented Programming": "OO", "Problem Solving": "PS",
  "SQL Server": "MS", MySQL: "MY", SQLite: "SQ", Git: "GT", GitHub: "GH",
  "VS Code": "VS", "Visual Studio": "V#", "Machine Learning": "ML", AI: "AI", "REST APIs": "API", Research: "RS"
};

function TechnologyMark({ name }: { name: string }) {
  return <span className={styles.techMark} aria-hidden="true">{marks[name] ?? name.slice(0, 2).toUpperCase()}</span>;
}

export function About() {
  return (
    <section id="about" data-omega-section className={styles.section}>
      <div className="container-x">
        <Reveal><SectionHeading number="01" eyebrow="Holographic identity" title="Curious by default. Practical by design." body="A grounded introduction to the person, education, and direction behind the work."/></Reveal>
        <div className={styles.aboutGrid}>
          <Reveal direction="left">
            <InteractiveCard className={styles.bioPanel} ariaLabel="About Md. Naimul Haque Tashin">
              <span className={styles.bioLabel}><i/>Identity profile / verified</span>
              <h3>Building software while strengthening the foundations underneath it.</h3>
              <p>I&apos;m a CSE student at <strong>{portfolio.university}</strong>, learning by building and by understanding how software works beneath the surface. My current path sits at the intersection of web development, software engineering fundamentals, and academic curiosity.</p>
              <div className={styles.identityTrack}>
                <span>Academic identity</span>
                <div className={styles.trackLine}><i className={styles.trackNode}/><div><h4>Computer Science &amp; Engineering</h4><p>{portfolio.university}</p></div></div>
                <div className={styles.trackLine}><i className={styles.trackNode}/><div><h4>Learning through practical systems</h4><p>Web interfaces, academic software, programming fundamentals, and research exploration.</p></div></div>
              </div>
            </InteractiveCard>
          </Reveal>
          <div className={styles.identityCards}>
            {portfolio.infoCards.map((card, index) => (
              <Reveal key={card.label} delay={index * .06} direction={index % 2 ? "right" : "up"}>
                <InteractiveCard className={styles.identityCard} ariaLabel={`${card.label}: ${card.value}`}>
                  <span className={styles.cardIcon}><Icon name={card.icon} size={18}/></span>
                  <small>{card.label}</small>
                  <h3>{card.value}</h3>
                  <p>{card.detail}</p>
                </InteractiveCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Skills() {
  return (
    <section id="skills" data-omega-section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container-x">
        <Reveal><SectionHeading number="02" eyebrow="Technology matrix" title="A toolkit mapped to real work." body="Languages, concepts, databases, and tools currently used or actively explored—without artificial proficiency scores."/></Reveal>
        <div className={styles.skillsGrid}>
          {portfolio.skills.map((skill, index) => (
            <Reveal key={skill.title} delay={index * .055} direction={index % 3 === 0 ? "left" : index % 3 === 2 ? "right" : "up"}>
              <InteractiveCard className={styles.skillCard} ariaLabel={skill.title}>
                <div className={styles.skillTop}><span className={styles.cardIcon}><Icon name={skill.icon} size={19}/></span><span>MATRIX / {String(index + 1).padStart(2, "0")}</span></div>
                <h3>{skill.title}</h3>
                <p>{skill.description}</p>
                <div className={styles.techList}>{skill.items.map(item => <span className={styles.techItem} key={item}><TechnologyMark name={item}/>{item}</span>)}</div>
              </InteractiveCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
