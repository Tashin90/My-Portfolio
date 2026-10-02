import { Pause, Play } from "lucide-react";
import { visualModes, type VisualMode } from "./visualModes";
import styles from "../Hero.module.css";

export function ModeSwitcher({ mode, paused, onModeChange, onPauseChange }: {
  mode: VisualMode;
  paused: boolean;
  onModeChange: (mode: VisualMode) => void;
  onPauseChange: () => void;
}) {
  return (
    <div className={styles.modeSwitcher}>
      <span className={styles.modeTitle}>VISUAL MODE</span>
      <div className={styles.modeOptions} role="group" aria-label="Visual spectrum">
        {(Object.keys(visualModes) as VisualMode[]).map((key, index) => (
          <button
            key={key}
            type="button"
            className="focus-ring"
            aria-pressed={mode === key}
            onClick={() => onModeChange(key)}
            style={{ "--swatch": visualModes[key].primary } as React.CSSProperties}
          >
            <i/>
            <span>0{index + 1}</span>
            {visualModes[key].label}
          </button>
        ))}
      </div>
      <button type="button" className={`${styles.pauseButton} focus-ring`} aria-pressed={paused} onClick={onPauseChange}>
        {paused ? <Play size={13}/> : <Pause size={13}/>}<span>{paused ? "Resume" : "Pause"}</span>
      </button>
    </div>
  );
}
