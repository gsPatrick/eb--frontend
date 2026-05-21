import styles from './Label.module.css';
import { cn } from '@/utils/cn';

export default function Label({ children, htmlFor, required = false, className }) {
  return (
    <label htmlFor={htmlFor} className={cn(styles.label, className)}>
      {children}
      {required && <span className={styles.required} aria-hidden="true">*</span>}
    </label>
  );
}
