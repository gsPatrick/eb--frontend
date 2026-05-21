import Icon from '@/components/atoms/Icon';
import Card from '@/components/molecules/Card';
import styles from './AlertCard.module.css';
import { cn } from '@/utils/cn';

export default function AlertCard({
  title,
  description,
  count,
  pulse = true,
  fullWidth = false,
  variant = 'error',
  className,
}) {
  return (
    <Card
      variant="glass"
      className={cn(
        styles.card,
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        pulse && variant !== 'success' && styles.pulse,
        className
      )}
    >
      <div className={cn(styles.iconWrap, styles[`icon_${variant}`])}>
        <Icon name="alert" size={22} />
        {pulse && variant !== 'success' && <span className={cn(styles.pulseRing, styles[`ring_${variant}`])} aria-hidden="true" />}
      </div>
      <div className={styles.content}>
        {fullWidth ? (
          <>
            <div className={styles.headerText}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            {count != null && <span className={cn(styles.count, styles[`count_${variant}`])}>{count}</span>}
          </>
        ) : (
          <>
            <div className={styles.top}>
              <h3>{title}</h3>
              {count != null && <span className={cn(styles.count, styles[`count_${variant}`])}>{count}</span>}
            </div>
            <p>{description}</p>
          </>
        )}
      </div>
    </Card>
  );
}
