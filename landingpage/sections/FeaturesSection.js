'use client';

import { useTranslation } from 'react-i18next';
import layout from '../landingpage.module.css';
import styles from './FeaturesSection.module.css';

const SEGMENTS = [
  { key: 'commercial', emoji: '🏢' },
  { key: 'airbnb', emoji: '🔑' },
  { key: 'residential', emoji: '🏡' },
  { key: 'postConstruction', emoji: '🔨' },
];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="recursos" className={`${layout.section} ${styles.section}`}>
      <div className={layout.container}>
        <div className={styles.header}>
          <span className={layout.sectionLabel}>{t('landing.segments.label')}</span>
          <h2 className={layout.sectionTitle}>{t('landing.segments.title')}</h2>
          <p className={layout.sectionSubtitle}>{t('landing.segments.subtitle')}</p>
        </div>

        <div className={styles.grid}>
          {SEGMENTS.map((segment) => (
            <article key={segment.key} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrap} aria-hidden="true">
                  <span className={styles.segmentEmoji}>{segment.emoji}</span>
                </div>
              </div>
              <h3 className={styles.cardTitle}>{t(`landing.segments.${segment.key}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`landing.segments.${segment.key}.description`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
