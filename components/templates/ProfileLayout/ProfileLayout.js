'use client';

import { useTranslation } from 'react-i18next';
import Avatar from '@/components/atoms/Avatar';
import Logo from '@/components/atoms/Logo';
import { formatDate } from '@/utils/formatters';
import styles from './ProfileLayout.module.css';

export default function ProfileLayout({
  user,
  children,
  homeHref = '/dashboard',
  stats,
}) {
  const { t } = useTranslation();

  const defaultStats = [
    { label: t('roles.admin'), value: t('profile.fullAccess') },
    { label: t('common.active'), value: t('profile.verifiedAccount') },
    { label: formatDate(user.lastLoginAt), value: t('profile.lastAccess') },
  ];

  const statItems = stats || defaultStats;

  return (
    <div className={styles.layout}>
      <aside className={styles.summaryPanel}>
        <div className={styles.summaryGlow} aria-hidden="true" />
        <div className={styles.summaryContent}>
          <Logo variant="auth" href={homeHref} />

          <div className={styles.profileCard}>
            <Avatar name={user.name} src={user.avatar} size="lg" className={styles.avatar} />
            <h1>{user.firstName || user.name}</h1>
            <span className={styles.roleLabel}>{user.roleLabel || t('roles.admin')}</span>
            <p className={styles.email}>{user.email}</p>
          </div>

          <div className={styles.stats}>
            {statItems.map((stat) => (
              <div key={`${stat.label}-${stat.value}`} className={styles.statCard}>
                <strong>{stat.label}</strong>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className={styles.formPanel}>{children}</section>
    </div>
  );
}
