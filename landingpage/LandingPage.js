import {
  NavbarSection,
  HeroSection,
  LanguagesSection,
  ImpactSection,
  FeaturesSection,
  HowItWorksSection,
  PortalsSection,
  StatsSection,
  CtaSection,
  FooterSection,
} from './sections';
import styles from './landingpage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <NavbarSection />
      <main className={styles.main}>
        <HeroSection />
        <LanguagesSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PortalsSection />
        <ImpactSection />
        <StatsSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
