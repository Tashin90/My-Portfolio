"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAEnhancements() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    // Test offline behavior with `npm run build` and `npm start`; avoid caching dev bundles.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(error => console.warn("Portfolio service worker registration failed:", error));
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    let dismissed = false;
    try { dismissed = Boolean(sessionStorage.getItem("tashin-install-dismissed")); } catch { /* Storage can be unavailable in private browsing. */ }
    if (standalone || dismissed) return;
    let timer: number | undefined;
    let installed = false;
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      if (dismissedRef.current || installed) return;
      window.clearTimeout(timer);
      setInstallEvent(event as InstallPromptEvent);
      timer = window.setTimeout(() => setVisible(true), 1800);
    };
    const onInstalled = () => {
      installed = true;
      window.clearTimeout(timer);
      setVisible(false);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.clearTimeout(timer); window.removeEventListener("beforeinstallprompt", onBeforeInstall); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const dismiss = () => {
    dismissedRef.current = true;
    try { sessionStorage.setItem("tashin-install-dismissed", "1"); } catch { /* Dismissal still works without storage. */ }
    setVisible(false);
    setInstallEvent(null);
  };
  const install = async () => {
    if (!installEvent) return;
    const event = installEvent;
    setVisible(false);
    setInstallEvent(null);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === "dismissed") {
        dismissedRef.current = true;
        try { sessionStorage.setItem("tashin-install-dismissed", "1"); } catch { /* Storage is optional. */ }
      }
    } catch { /* A consumed or unavailable browser prompt must not break the page. */ }
  };

  if (!visible || !installEvent) return null;
  return <aside className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-4 rounded-2xl border border-violet-300/25 bg-[#0d1324]/95 p-4 text-white shadow-2xl backdrop-blur-xl" aria-label="Install portfolio app"><div><p className="text-sm font-semibold">Install Tashin Portfolio</p><p className="mt-1 text-xs text-slate-400">Keep this portfolio close at hand.</p></div><button type="button" onClick={install} className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-200 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"><Download size={14}/> Install</button><button type="button" onClick={dismiss} className="focus-ring rounded-lg p-1.5 text-slate-500 transition hover:text-white" aria-label="Dismiss install prompt"><X size={16}/></button></aside>;
}
