'use client';

import { useTranslation } from 'react-i18next';
import { LOCALES } from '@/i18n/config';
import layout from '../landingpage.module.css';
import styles from './LanguagesSection.module.css';

export default function LanguagesSection() {
  const { t } = useTranslation();

  return (
    <section id="idiomas" className={`${layout.section} ${styles.section}`}>
      <div className={layout.container}>
        <div className={styles.header}>
          <span className={layout.sectionLabel}>{t('landing.languages.label')}</span>
          <h2 className={layout.sectionTitle}>
            {t('landing.languages.title')}{' '}
            <span className={layout.gradientText}>{t('landing.languages.titleHighlight')}</span>
          </h2>
          <p className={layout.sectionSubtitle}>{t('landing.languages.subtitle')}</p>
        </div>

        <div className={styles.flagGrid} role="list">
          {LOCALES.map((locale) => (
            <article key={locale.code} className={styles.flagCard} role="listitem">
              <span className={styles.flag} aria-hidden="true">
                {locale.flag}
              </span>
              <div className={styles.flagMeta}>
                <strong>{locale.label}</strong>
                <span>{locale.code.toUpperCase()}</span>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.hint}>{t('landing.languages.hint')}</p>
      </div>
    </section>
  );
}
