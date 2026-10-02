import Image from "next/image";
import { portfolio } from "@/data/portfolio";
import NeuralScene from "./NeuralScene";
import type { VisualMode } from "./visualModes";
import styles from "../Hero.module.css";

export function HolographicCore({ mode }: { mode: VisualMode }) {
  return (
    <div className={styles.coreAssembly} data-core>
      <div className={styles.coreCoordinates} aria-hidden="true"><span>23.8103° N</span><span>90.4125° E</span></div>
      <div className={styles.coreMechanism}>
        <div className={styles.coreHalo}/>
        <div className={`${styles.orbitRing} ${styles.orbitRingOuter}`}><i/><i/><i/><i/></div>
        <div className={`${styles.orbitRing} ${styles.orbitRingMid}`}><i/><i/><i/></div>
        <div className={`${styles.orbitRing} ${styles.orbitRingInner}`}><i/><i/></div>
        <NeuralScene kind="orbit" mode={mode}/>
        <div className={styles.coreReticle} aria-hidden="true"><i/><i/><i/><i/></div>
        <div className={styles.identityCapsule}>
          <div className={styles.identityImage}>
            <Image
              src="/images/profile.png"
              alt={portfolio.name}
              fill
              sizes="(max-width: 767px) 250px, (max-width: 1199px) 320px, 390px"
              className="object-cover object-center"
              priority
            />
            <div className={styles.imageScan}/>
            <div className={styles.imageNoise}/>
          </div>
          <div className={styles.capsuleBrackets} aria-hidden="true"><i/><i/><i/><i/></div>
        </div>
        <div className={styles.corePulse} aria-hidden="true"/>
      </div>
      <div className={styles.coreLabel}>
        <span><i/> IDENTITY VERIFIED</span>
        <strong>{portfolio.shortName.toUpperCase()} // CORE</strong>
        <small>{portfolio.location}</small>
      </div>
      <div className={styles.coreTelemetry} aria-hidden="true">
        <span>ORBIT <b>03</b></span>
        <span>PARALLAX <b>ON</b></span>
        <span>SIGNAL <b>STABLE</b></span>
      </div>
    </div>
  );
}
