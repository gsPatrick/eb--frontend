'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/atoms/Logo';
import Button from '@/components/atoms/Button';
import LandingLanguageSelector from '../components/LandingLanguageSelector';
import styles from './NavbarSection.module.css';

const NAV_KEYS = [
  { href: '#recursos', key: 'features' },
  { href: '#como-funciona', key: 'howItWorks' },
  { href: '#idiomas', key: 'languages' },
];

export default function NavbarSection() {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo variant="default" href="/" className={styles.logo} />

        <nav className={styles.nav} aria-label="Principal">
          {NAV_KEYS.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {t(`landing.nav.${link.key}`)}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <LandingLanguageSelector />
          <Link href="/login" className={styles.loginLink}>
            {t('landing.nav.login')}
          </Link>
          <Link href="/register" className={styles.ctaLink}>
            <Button size="sm" className={styles.ctaBtn}>
              {t('landing.nav.register')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
