import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import styles from './EmptyState.module.css';

export default function EmptyState({
  icon = 'info',
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.empty}>
      <span className={styles.iconWrap}>
        <Icon name={icon} size={32} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className={styles.action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
