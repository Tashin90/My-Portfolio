"use client";

import { useEffect } from "react";

export default function OmegaThemeBridge() {
  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) return;

    const syncMode = () => {
      document.documentElement.dataset.omegaMode = hero.dataset.visualMode ?? "cyan";
    };

    syncMode();
    const observer = new MutationObserver(syncMode);
    observer.observe(hero, { attributes: true, attributeFilter: ["data-visual-mode"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
