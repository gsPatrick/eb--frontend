'use client';

import { useTranslation } from 'react-i18next';
import layout from '../landingpage.module.css';
import styles from './StatsSection.module.css';

const STATS = [
  { value: '200m', key: 'geofence' },
  { value: '5', key: 'languages' },
  { value: '2', key: 'portals' },
  { value: '24/7', key: 'sync' },
];

export default function StatsSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-label={t('landing.stats.ariaLabel')}>
      <div className={`${layout.container} ${styles.inner}`}>
        {STATS.map((stat) => (
          <div key={stat.key} className={styles.stat}>
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{t(`landing.stats.${stat.key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
