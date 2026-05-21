import Link from 'next/link';
import AuthFormFooter from './AuthFormFooter';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ title, subtitle, children, authSwitch }) {
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
            <p className={styles.heroEyebrow}>Plataforma de gestão</p>
            <h1 className={styles.heroTitle}>
              Controle total dos seus serviços e propriedades
            </h1>
            <p className={styles.heroText}>
              Acompanhe ordens de serviço, contratos, inventário e equipes em um
              painel moderno e intuitivo.
            </p>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <strong>24/7</strong>
              <span>Monitoramento</span>
            </div>
            <div className={styles.statCard}>
              <strong>100%</strong>
              <span>Digital</span>
            </div>
            <div className={styles.statCard}>
              <strong>RBAC</strong>
              <span>Seguro</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
