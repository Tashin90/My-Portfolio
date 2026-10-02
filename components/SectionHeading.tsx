import styles from "./PortfolioSections.module.css";

export function SectionHeading({ number, eyebrow, title, body, align = "left" }: {
  number: string;
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <header className={`${styles.sectionHeading} ${align === "center" ? styles.headingCenter : ""}`}>
      <div className={styles.sectionIndex}><span>{number}</span><i/><span>{eyebrow}</span></div>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </header>
  );
}
