'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import layout from '../landingpage.module.css';
import styles from './PortalsSection.module.css';

export default function PortalsSection() {
  const { t } = useTranslation();

  const experiences = [
    {
      icon: 'orders',
      titleKey: 'providerTitle',
      taglineKey: 'providerTagline',
      descKey: 'providerDesc',
      featuresKey: 'providerFeatures',
      ctaKey: 'providerCta',
      highlight: true,
    },
    {
      icon: 'properties',
      titleKey: 'clientTitle',
      taglineKey: 'clientTagline',
      descKey: 'clientDesc',
      featuresKey: 'clientFeatures',
      ctaKey: 'clientCta',
      highlight: false,
    },
  ];

  return (
    <section id="experiencias" className={`${layout.section} ${styles.section}`}>
      <div className={layout.container}>
        <div className={styles.header}>
          <span className={styles.sectionLabel}>{t('landing.experiences.label')}</span>
          <h2 className={styles.sectionTitle}>
            {t('landing.experiences.title')}{' '}
            <span className={styles.titleHighlight}>{t('landing.experiences.titleHighlight')}</span>
          </h2>
          <p className={styles.sectionSubtitle}>{t('landing.experiences.subtitle')}</p>
        </div>

        <div className={styles.grid}>
          {experiences.map((item) => (
            <article
              key={item.titleKey}
              className={`${styles.card} ${item.highlight ? styles.cardHighlight : ''}`}
            >
              <div className={styles.cardHead}>
                <div className={styles.iconWrap}>
                  <Icon name={item.icon} size={24} />
                </div>
                <div>
                  <h3 className={styles.cardTitle}>{t(`landing.experiences.${item.titleKey}`)}</h3>
                  <span className={styles.tagline}>{t(`landing.experiences.${item.taglineKey}`)}</span>
                </div>
              </div>
              <p className={styles.cardDesc}>{t(`landing.experiences.${item.descKey}`)}</p>
              <ul className={styles.featureList}>
                {t(`landing.experiences.${item.featuresKey}`, { returnObjects: true }).map((feature) => (
                  <li key={feature}>
                    <Icon name="check" size={14} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={styles.cardLink}>
                {t(`landing.experiences.${item.ctaKey}`)}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
