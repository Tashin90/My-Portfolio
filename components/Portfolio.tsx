import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import GitHubSection from "@/components/GitHubSection";
import { FeaturedCaseStudy, TechMarquee } from "@/components/ProfessionalSections";
import { About, Skills } from "@/components/AboutSkills";
import { Achievements, Contact, CurrentlyBuilding, EducationJourney, Footer, ResearchLearningServices } from "@/components/MoreSections";
import PWAEnhancements from "@/components/PWAEnhancements";

export default function Portfolio() {
  return <><Navbar/><main><Hero/><About/><Skills/><Projects/><TechMarquee/><FeaturedCaseStudy/><GitHubSection/><CurrentlyBuilding/><EducationJourney/><Achievements/><ResearchLearningServices/><Contact/></main><Footer/><PWAEnhancements/></>;
}
