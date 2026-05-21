import styles from './Input.module.css';
import { cn } from '@/utils/cn';

export default function Input({
  type = 'text',
  error = false,
  disabled = false,
  className,
  ...props
}) {
  return (
    <input
      type={type}
      disabled={disabled}
      className={cn(styles.input, error && styles.error, disabled && styles.disabled, className)}
      {...props}
    />
  );
}
