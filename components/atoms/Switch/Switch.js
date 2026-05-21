'use client';

import styles from './Switch.module.css';
import { cn } from '@/utils/cn';

export default function Switch({ label, checked, onChange, disabled = false, className, id }) {
  const inputId = id || `switch-${label?.replace(/\s/g, '-').toLowerCase()}`;

  return (
    <label htmlFor={inputId} className={cn(styles.wrapper, disabled && styles.disabled, className)}>
      <input
        type="checkbox"
        role="switch"
        id={inputId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
