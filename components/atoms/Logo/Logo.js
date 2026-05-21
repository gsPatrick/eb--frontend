import Link from 'next/link';
import styles from './Logo.module.css';
import { cn } from '@/utils/cn';

const LOGO_SRC = {
  full: '/logo.png',
  small: '/logo-pequena.png',
};

const VARIANT_CONFIG = {
  default: { src: 'full', wrap: 'default' },
  sidebar: { src: 'full', wrap: 'default' },
  auth: { src: 'full', wrap: 'auth' },
  sidebarClean: { src: 'small', wrap: 'small' },
  sidebarIcon: { src: 'small', wrap: 'smallIcon' },
  compact: { src: 'small', wrap: 'small' },
};

export default function Logo({ variant = 'default', className, href }) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;

  const content = (
    <div className={cn(styles.wrap, styles[`wrap_${config.wrap}`], className)}>
      <img
        src={LOGO_SRC[config.src]}
        alt="eb. Services and Solutions"
        className={cn(styles.image, styles[variant])}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
}
