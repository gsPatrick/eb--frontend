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
  className,
}) {
  return (
    <Card
      variant="glass"
      className={cn(styles.card, fullWidth && styles.fullWidth, pulse && styles.pulse, className)}
    >
      <div className={styles.iconWrap}>
        <Icon name="alert" size={22} />
        {pulse && <span className={styles.pulseRing} aria-hidden="true" />}
      </div>
      <div className={styles.content}>
        {fullWidth ? (
          <>
            <div className={styles.headerText}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            {count != null && <span className={styles.count}>{count}</span>}
          </>
        ) : (
          <>
            <div className={styles.top}>
              <h3>{title}</h3>
              {count != null && <span className={styles.count}>{count}</span>}
            </div>
            <p>{description}</p>
          </>
        )}
      </div>
    </Card>
  );
}
