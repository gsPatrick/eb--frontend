'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/atoms/Logo';
import Button from '@/components/atoms/Button';
import styles from '@/styles/error.module.css';

export default function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <Logo variant="auth" href="/" />
        <span className={styles.code}>403</span>
        <h1>{t('errors.forbidden.title')}</h1>
        <p>{t('errors.forbidden.description')}</p>
        <div className={styles.actions}>
          <Link href="/login">
            <Button>{t('errors.forbidden.changeAccount')}</Button>
          </Link>
          <Link href="/provider/schedule">
            <Button variant="secondary">{t('errors.forbidden.providerPortal')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
