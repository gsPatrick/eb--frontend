'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import HeroVideoLoop from '../components/HeroVideoLoop';
import layout from '../landingpage.module.css';
import styles from './HeroSection.module.css';

const VIDEO_SRC = '/landing/hero.mp4';
const LOGO_SRC = '/logo.png';

const TRUST_KEYS = ['trust1', 'trust2', 'trust3'];

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
            <img
              src={LOGO_SRC}
              alt="eb. Services and Solutions"
              className={styles.heroLogo}
            />
          </Link>

          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            {t('landing.hero.badge')}
          </span>

          <h1 className={styles.title}>
            {t('landing.hero.title')}{' '}
            <span className={layout.gradientText}>{t('landing.hero.titleHighlight')}</span>{' '}
            {t('landing.hero.titleEnd')}
          </h1>

          <p className={styles.subtitle}>{t('landing.hero.subtitle')}</p>

          <div className={styles.ctas}>
            <Link href="/register">
              <Button size="lg">{t('landing.hero.createAccount')}</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                {t('landing.hero.login')}
              </Button>
            </Link>
          </div>

          <ul className={styles.trust}>
            {TRUST_KEYS.map((key) => (
              <li key={key}>
                <Icon name="check" size={16} />
                {t(`landing.hero.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
