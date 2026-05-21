import styles from './Divider.module.css';
import { cn } from '@/utils/cn';

export default function Divider({ label, className }) {
  if (label) {
    return (
      <div className={cn(styles.labeled, className)} role="separator">
        <span className={styles.line} />
        <span className={styles.label}>{label}</span>
        <span className={styles.line} />
      </div>
    );
  }

  return <hr className={cn(styles.divider, className)} />;
}
