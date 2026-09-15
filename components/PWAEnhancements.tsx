"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAEnhancements() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone || sessionStorage.getItem("tashin-install-dismissed")) return;
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      window.setTimeout(() => setVisible(true), 1800);
    };
    const onInstalled = () => { setVisible(false); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onBeforeInstall); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const dismiss = () => { sessionStorage.setItem("tashin-install-dismissed", "1"); setVisible(false); };
  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setInstallEvent(null);
  };

  if (!visible || !installEvent) return null;
  return <aside className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-4 rounded-2xl border border-violet-300/25 bg-[#0d1324]/95 p-4 text-white shadow-2xl backdrop-blur-xl" aria-label="Install portfolio app"><div><p className="text-sm font-semibold">Install Tashin Portfolio</p><p className="mt-1 text-xs text-slate-400">Keep this portfolio close at hand.</p></div><button type="button" onClick={install} className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-200 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"><Download size={14}/> Install</button><button type="button" onClick={dismiss} className="focus-ring rounded-lg p-1.5 text-slate-500 transition hover:text-white" aria-label="Dismiss install prompt"><X size={16}/></button></aside>;
}
