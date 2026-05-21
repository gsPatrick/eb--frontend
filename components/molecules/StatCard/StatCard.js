import FigmaIcon from '@/components/atoms/FigmaIcon';
import Icon from '@/components/atoms/Icon';
import Skeleton from '@/components/atoms/Skeleton';
import styles from './StatCard.module.css';
import { cn } from '@/utils/cn';

export default function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconSrc,
  loading = false,
  className,
}) {
  if (loading) {
    return (
      <div className={cn(styles.card, className)}>
        <div className={styles.content}>
          <Skeleton variant="text" width="55%" />
          <Skeleton variant="title" className={styles.skeletonValue} />
          <Skeleton variant="text" width="40%" />
        </div>
        <Skeleton variant="text" width={24} height={24} />
      </div>
    );
  }

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
        {change && (
          <p className={cn(styles.change, styles[`change_${changeType}`])}>{change}</p>
        )}
      </div>

      {iconSrc ? (
        <FigmaIcon src={iconSrc} size={24} alt="" className={styles.icon} />
      ) : icon ? (
        <Icon name={icon} size={24} strokeWidth={2} className={styles.icon} />
      ) : null}
    </div>
  );
}
