import styles from './Select.module.css';
import { cn } from '@/utils/cn';

export default function Select({ error = false, disabled = false, className, children, ...props }) {
  return (
    <div className={styles.wrapper}>
      <select
        disabled={disabled}
        className={cn(styles.select, error && styles.error, disabled && styles.disabled, className)}
        {...props}
      >
        {children}
      </select>
      <span className={styles.chevron} aria-hidden="true">▾</span>
    </div>
  );
}
