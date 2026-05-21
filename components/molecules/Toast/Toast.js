import Icon from '@/components/atoms/Icon';
import styles from './Toast.module.css';
import { cn } from '@/utils/cn';

const ICONS = {
  success: 'check',
  error: 'alert',
  warning: 'alert',
  info: 'info',
};

export default function Toast({ title, message, variant = 'info', onDismiss }) {
  return (
    <div className={cn(styles.toast, styles[variant])} role="alert">
      <span className={styles.iconWrap}>
        <Icon name={ICONS[variant]} size={18} />
      </span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {message && <p className={styles.message}>{message}</p>}
      </div>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Fechar">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
