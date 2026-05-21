'use client';

import Icon from '@/components/atoms/Icon';
import Logo from '@/components/atoms/Logo';
import styles from './AuthTransitionOverlay.module.css';

export default function AuthTransitionOverlay({ type, userName }) {
  const isLogin = type === 'login';

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
          {isLogin ? `Bem-vindo, ${userName?.split(' ')[0] || 'de volta'}` : 'Até logo'}
        </h2>
        <p className={styles.subtitle}>
          {isLogin ? 'Entrando na plataforma…' : 'Encerrando sua sessão com segurança…'}
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
