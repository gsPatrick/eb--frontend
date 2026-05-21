'use client';

import { useTranslation } from 'react-i18next';
import layout from '../landingpage.module.css';
import styles from './HowItWorksSection.module.css';

const STEPS = ['step1', 'step2', 'step3', 'step4'];

export default function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section id="como-funciona" className={`${layout.section} ${styles.section}`}>
      <div className={layout.container}>
        <div className={styles.header}>
          <span className={styles.sectionLabel}>{t('landing.howItWorks.label')}</span>
          <h2 className={styles.sectionTitle}>
            {t('landing.howItWorks.title')}{' '}
            <span className={styles.accent}>{t('landing.howItWorks.titleHighlight')}</span>
          </h2>
        </div>

        <ol className={styles.timeline}>
          {STEPS.map((stepKey, index) => (
            <li key={stepKey} className={styles.item}>
              <div className={styles.marker}>
                <span className={styles.stepNum}>{String(index + 1).padStart(2, '0')}</span>
                {index < STEPS.length - 1 && <span className={styles.line} />}
              </div>
              <div className={styles.content}>
                <h3 className={styles.itemTitle}>{t(`landing.howItWorks.${stepKey}Title`)}</h3>
                <p className={styles.itemDesc}>{t(`landing.howItWorks.${stepKey}Desc`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
