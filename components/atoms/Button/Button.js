import styles from './Button.module.css';
import { cn } from '@/utils/cn';
import Spinner from '../Spinner';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className={styles.spinner} />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
