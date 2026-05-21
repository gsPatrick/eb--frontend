import styles from './Textarea.module.css';
import { cn } from '@/utils/cn';

export default function Textarea({ error = false, disabled = false, className, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      disabled={disabled}
      className={cn(styles.textarea, error && styles.error, disabled && styles.disabled, className)}
      {...props}
    />
  );
}
