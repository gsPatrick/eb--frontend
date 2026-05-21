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
  const defaultStats = [
    { label: 'Admin', value: 'Acesso total' },
    { label: 'Ativa', value: 'Conta verificada' },
    { label: formatDate(user.lastLoginAt), value: 'Último acesso' },
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
            <span className={styles.roleLabel}>{user.roleLabel || 'Administradora'}</span>
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
