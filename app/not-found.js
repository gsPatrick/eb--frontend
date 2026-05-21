'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/atoms/Logo';
import Button from '@/components/atoms/Button';
import styles from '@/styles/error.module.css';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <Logo variant="auth" href="/" />
        <span className={styles.code}>404</span>
        <h1>{t('errors.notFound.title')}</h1>
        <p>{t('errors.notFound.description')}</p>
        <div className={styles.actions}>
          <Link href="/login">
            <Button>{t('errors.notFound.goToLogin')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
