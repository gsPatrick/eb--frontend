'use client';

import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import layout from '../landingpage.module.css';
import styles from './FeaturesSection.module.css';

const FEATURES = [
  { icon: 'map', key: 'geofence', forKey: 'forProvider' },
  { icon: 'orders', key: 'photos', forKey: 'forBoth' },
  { icon: 'sync', key: 'realtime', forKey: 'forBoth' },
  { icon: 'inventory', key: 'inventory', forKey: 'forBoth' },
  { icon: 'billing', key: 'billing', forKey: 'forBoth' },
  { icon: 'reviews', key: 'reviews', forKey: 'forClient' },
];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="recursos" className={`${layout.section} ${styles.section}`}>
      <div className={layout.container}>
        <div className={styles.header}>
          <span className={layout.sectionLabel}>{t('landing.features.label')}</span>
          <h2 className={layout.sectionTitle}>
            {t('landing.features.title')}{' '}
            <span className={layout.gradientText}>{t('landing.features.titleHighlight')}</span>
          </h2>
          <p className={layout.sectionSubtitle}>{t('landing.features.subtitle')}</p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <article key={feature.key} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <Icon name={feature.icon} size={22} />
                </div>
                <span className={styles.forBadge}>{t(`landing.features.${feature.forKey}`)}</span>
              </div>
              <h3 className={styles.cardTitle}>{t(`landing.features.${feature.key}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`landing.features.${feature.key}.description`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
