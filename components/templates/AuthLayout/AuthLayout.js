'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import AuthFormFooter from './AuthFormFooter';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ title, subtitle, children, authSwitch }) {
  const { t } = useTranslation();

  return (
    <div className={styles.layout}>
      <main className={styles.formPanel}>
        <div className={styles.formWrap}>
          <div className={styles.formBrandMobile}>
            <Link href="/" className={styles.mobileLogoLink}>
              <img
                src="/logo.png"
                alt="eb. Services and Solutions"
                className={styles.mobileLogo}
              />
            </Link>
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{title}</h2>
            {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
          </div>

          {children}

          <AuthFormFooter authSwitch={authSwitch} />
        </div>
      </main>

      <aside className={styles.brandPanel}>
        <div className={styles.brandGlow} aria-hidden="true" />
        <div className={styles.brandContent}>
          <Link href="/" className={styles.desktopLogoLink}>
            <img
              src="/logo.png"
              alt="eb. Services and Solutions"
              className={styles.desktopLogo}
            />
          </Link>

          <div className={styles.hero}>
            <p className={styles.heroEyebrow}>{t('auth.brand.eyebrow')}</p>
            <h1 className={styles.heroTitle}>{t('auth.brand.title')}</h1>
            <p className={styles.heroText}>{t('auth.brand.text')}</p>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <strong>24/7</strong>
              <span>{t('auth.brand.monitoring')}</span>
            </div>
            <div className={styles.statCard}>
              <strong>100%</strong>
              <span>{t('auth.brand.digital')}</span>
            </div>
            <div className={styles.statCard}>
              <strong>RBAC</strong>
              <span>{t('auth.brand.secure')}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
