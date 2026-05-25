import {
  NavbarSection,
  HeroSection,
  LanguagesSection,
  FeaturesSection,
  HowItWorksSection,
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
        <FeaturesSection />
        <HowItWorksSection />
        <LanguagesSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
