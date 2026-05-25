'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import HeroVideoLoop from '../components/HeroVideoLoop';
import layout from '../landingpage.module.css';
import styles from './HeroSection.module.css';

const VIDEO_SRC = '/landing/hero.mp4';
const LOGO_SRC = '/logo.png';
const DEMO_MAILTO = 'mailto:contato@ebservices.com?subject=EB%20Services%20-%20Demo%20Request';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.mediaCol}>
        <div className={styles.videoFrame}>
          <HeroVideoLoop src={VIDEO_SRC} />
          <div className={styles.videoFallback} aria-hidden="true">
            <span className={styles.fallbackPulse} />
          </div>
        </div>
      </div>

      <div className={styles.contentCol}>
        <div className={styles.contentInner}>
          <Link href="/" className={styles.heroLogoLink}>
            <img src={LOGO_SRC} alt="EB Services and Solutions" className={styles.heroLogo} />
          </Link>

          <span className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            {t('landing.hero.badge')}
          </span>

          <h1 className={styles.title}>{t('landing.hero.title')}</h1>

          <p className={styles.subtitle}>{t('landing.hero.subtitle')}</p>

          <div className={styles.ctas}>
            <Link href="/register">
              <Button size="lg">{t('landing.hero.createAccount')}</Button>
            </Link>
            <a href={DEMO_MAILTO} className={styles.demoLink}>
              <Button variant="secondary" size="lg">
                {t('landing.hero.scheduleDemo')}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
