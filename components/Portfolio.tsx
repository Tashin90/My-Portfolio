import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import GitHubSection from "@/components/GitHubSection";
import { TechMarquee } from "@/components/ProfessionalSections";
import { About, Skills } from "@/components/AboutSkills";
import { Achievements, Contact, CurrentlyBuilding, Footer, ResearchQualifications } from "@/components/MoreSections";
import PWAEnhancements from "@/components/PWAEnhancements";
import BackToTop from "@/components/BackToTop";

export default function Portfolio() {
  return <><Navbar/><main><Hero/><About/><Skills/><TechMarquee/><Projects/><GitHubSection/><CurrentlyBuilding/><Achievements/><ResearchQualifications/><Contact/></main><Footer/><BackToTop/><PWAEnhancements/></>;
}
