'use client';

import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import Logo from '@/components/atoms/Logo';
import styles from './AuthTransitionOverlay.module.css';

export default function AuthTransitionOverlay({ type, userName }) {
  const { t } = useTranslation();
  const isLogin = type === 'login';
  const firstName = userName?.split(' ')[0];

  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <Logo variant="auth" href="/" />
        </div>

        <div className={`${styles.iconRing} ${isLogin ? styles.iconRingSuccess : styles.iconRingLogout}`}>
          <Icon name={isLogin ? 'check' : 'logout'} size={28} strokeWidth={2.5} />
        </div>

        <h2 className={styles.title}>
          {isLogin
            ? firstName
              ? t('auth.transition.welcome', { name: firstName })
              : t('auth.transition.welcomeBack')
            : t('auth.transition.goodbye')}
        </h2>
        <p className={styles.subtitle}>
          {isLogin ? t('auth.transition.loginSubtitle') : t('auth.transition.logoutSubtitle')}
        </p>

        <div className={styles.loader} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
