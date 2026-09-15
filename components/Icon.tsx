import { Award, BrainCircuit, Code2, Database, ExternalLink, Github, Globe2, GraduationCap, Layers3, Linkedin, Mail, MapPin, Menu, Moon, Radio, Search, Send, Sparkles, Sun, Terminal, Wrench, X, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = { award: Award, brain: BrainCircuit, code: Code2, database: Database, external: ExternalLink, github: Github, globe: Globe2, graduation: GraduationCap, layers: Layers3, linkedin: Linkedin, mail: Mail, location: MapPin, menu: Menu, moon: Moon, radio: Radio, search: Search, send: Send, spark: Sparkles, sun: Sun, terminal: Terminal, tool: Wrench, x: X };

export function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: string; size?: number; strokeWidth?: number }) {
  const Component = icons[name] ?? Sparkles;
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
