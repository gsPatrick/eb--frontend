import styles from './Checkbox.module.css';
import { cn } from '@/utils/cn';

export default function Checkbox({ label, id, className, ...props }) {
  const inputId = id || `checkbox-${label?.replace(/\s/g, '-').toLowerCase()}`;

  return (
    <label htmlFor={inputId} className={cn(styles.wrapper, className)}>
      <input type="checkbox" id={inputId} className={styles.input} {...props} />
      <span className={styles.box} aria-hidden="true" />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
