'use client';

import { useTranslation } from 'react-i18next';
import layout from '../landingpage.module.css';
import styles from './ImpactSection.module.css';

export default function ImpactSection() {
  const { t } = useTranslation();

  return (
    <section className={`${layout.section} ${styles.section}`}>
      <div className={layout.container}>
        <blockquote className={styles.quote}>
          <p className={styles.line}>{t('landing.impact.line1')}</p>
          <p className={styles.lineHighlight}>{t('landing.impact.line2')}</p>
        </blockquote>
      </div>
    </section>
  );
}
