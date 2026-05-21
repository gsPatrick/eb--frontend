import Logo from '@/components/atoms/Logo';
import profileStyles from '@/components/templates/ProfileLayout/ProfileLayout.module.css';
import styles from './SettingsLayout.module.css';

export default function SettingsLayout({ homeHref = '/dashboard', title, subtitle, stats, children }) {
  return (
    <div className={profileStyles.layout}>
      <aside className={profileStyles.summaryPanel}>
        <div className={profileStyles.summaryGlow} aria-hidden="true" />
        <div className={profileStyles.summaryContent}>
          <Logo variant="auth" href={homeHref} />

          <div className={styles.hero}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className={profileStyles.stats}>
            {stats.map((stat) => (
              <div key={`${stat.label}-${stat.value}`} className={profileStyles.statCard}>
                {stat.icon && <span className={styles.statIcon}>{stat.icon}</span>}
                <strong>{stat.label}</strong>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className={profileStyles.formPanel}>{children}</section>
    </div>
  );
}
