import { portfolio } from "@/data/portfolio";
import { Icon } from "@/components/Icon";
import styles from "../Hero.module.css";

const clean = (value: string) => value.replaceAll("Â", "");

const modules = [
  {
    code: "EDU-01",
    icon: "graduation",
    label: "Education",
    value: "Computer Science & Engineering",
    detail: portfolio.university
  },
  {
    code: "PRJ-05",
    icon: "code",
    label: "Project Index",
    value: `${portfolio.projects.length} Featured Projects`,
    detail: "Academic and practical work"
  },
  {
    code: "WEB-02",
    icon: "globe",
    label: "Development",
    value: "Web Development",
    detail: clean(portfolio.infoCards.find(card => card.label === "Focus")?.detail ?? "Learning through real projects")
  },
  {
    code: "RSH-04",
    icon: "brain",
    label: "Research Vector",
    value: "Research Interest",
    detail: `${portfolio.interests[2]} / ${portfolio.interests[5]}`
  }
] as const;

export function NeuralPanels() {
  return (
    <aside className={styles.neuralPanels} aria-label="Portfolio neural data modules">
      <div className={styles.railHeader}>
        <span>NEURAL DATA</span>
        <span>04 MODULES</span>
      </div>
      {modules.map((module, index) => (
        <div className={styles.panelOrbit} key={module.code} style={{ "--module-index": index } as React.CSSProperties}>
          <article className={styles.neuralPanel} data-panel>
            <div className={styles.panelHeader}>
              <span className={styles.panelIcon}><Icon name={module.icon} size={15}/></span>
              <span>{module.code}</span>
              <i/>
            </div>
            <p className={styles.panelLabel}>{module.label}</p>
            <h3>{module.value}</h3>
            <p className={styles.panelDescription}>{module.detail}</p>
            <div className={styles.signalBars} aria-hidden="true">{Array.from({ length: 14 }, (_, barIndex) => <i key={barIndex}/>)}</div>
          </article>
        </div>
      ))}
    </aside>
  );
}
