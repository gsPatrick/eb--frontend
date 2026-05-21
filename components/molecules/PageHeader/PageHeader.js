import styles from './PageHeader.module.css';
import { cn } from '@/utils/cn';

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn(styles.header, className)}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
