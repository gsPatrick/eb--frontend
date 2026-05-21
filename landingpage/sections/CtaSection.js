'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import layout from '../landingpage.module.css';
import styles from './CtaSection.module.css';

export default function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={`${layout.container} ${styles.inner}`}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.content}>
          <h2 className={styles.title}>{t('landing.cta.title')}</h2>
          <p className={styles.subtitle}>{t('landing.cta.subtitle')}</p>
          <div className={styles.actions}>
            <Link href="/register">
              <Button size="lg">{t('landing.cta.createAccount')}</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                {t('landing.cta.hasAccess')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
