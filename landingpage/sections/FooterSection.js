'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import layout from '../landingpage.module.css';
import styles from './FooterSection.module.css';

const PRODUCT_LINKS = [
  { key: 'features', href: '#recursos' },
  { key: 'howItWorks', href: '#como-funciona' },
  { key: 'languages', href: '#idiomas' },
  { key: 'experiences', href: '#experiencias' },
];

const ACCESS_LINKS = [
  { key: 'login', href: '/login' },
  { key: 'register', href: '/register' },
];

export default function FooterSection() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.accentBar} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={`${layout.container} ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink}>
            <img
              src="/logo.png"
              alt="eb. Services and Solutions"
              className={styles.logo}
            />
          </Link>
          <p className={styles.tagline}>{t('landing.footer.tagline')}</p>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>{t('landing.footer.product')}</h4>
            <ul className={styles.colList}>
              {PRODUCT_LINKS.map((item) => (
                <li key={item.key}>
                  <Link href={item.href}>{t(`landing.nav.${item.key}`)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>{t('landing.footer.access')}</h4>
            <ul className={styles.colList}>
              {ACCESS_LINKS.map((item) => (
                <li key={item.key}>
                  <Link href={item.href}>{t(`landing.nav.${item.key}`)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={layout.container}>
          <p>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
