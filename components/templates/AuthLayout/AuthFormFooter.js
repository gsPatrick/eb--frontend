'use client';

import { useTranslation } from 'react-i18next';
import LanguageDropdown from '@/components/molecules/LanguageDropdown';
import styles from './AuthFormFooter.module.css';

export default function AuthFormFooter({ authSwitch }) {
  const { t } = useTranslation();

  return (
    <>
      {authSwitch && <div className={styles.authSwitch}>{authSwitch}</div>}

      <div className={styles.footer}>
        <span className={styles.footerLabel}>{t('profile.language')}</span>
        <LanguageDropdown theme="light" />
      </div>
    </>
  );
}
