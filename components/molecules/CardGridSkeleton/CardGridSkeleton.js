import Skeleton from '@/components/atoms/Skeleton';
import styles from './CardGridSkeleton.module.css';

const GRID_CLASS = {
  property: styles.propertyGrid,
  inventory: styles.inventoryGrid,
  history: styles.historyList,
  schedule: styles.scheduleGrid,
  contract: styles.contractList,
};

export default function CardGridSkeleton({ variant = 'property', count = 3 }) {
  const gridClass = GRID_CLASS[variant] || styles.propertyGrid;

  return (
    <div className={gridClass} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        if (variant === 'property') {
          return (
            <article key={index} className={styles.propertyCard}>
              <Skeleton variant="rect" className={styles.propertyImage} height={180} />
              <div className={styles.propertyBody}>
                <Skeleton variant="title" width="65%" />
                <Skeleton variant="text" width="85%" />
                <Skeleton variant="text" width="45%" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </div>
              </div>
            </article>
          );
        }

        if (variant === 'inventory') {
          return (
            <article key={index} className={styles.inventoryCard}>
              <Skeleton variant="title" width="55%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rect" height={8} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="text" width="35%" />
                <Skeleton variant="text" width="30%" />
              </div>
            </article>
          );
        }

        if (variant === 'history') {
          return (
            <article key={index} className={styles.historyCard}>
              <Skeleton variant="title" width="50%" />
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="rect" height={96} />
            </article>
          );
        }

        if (variant === 'schedule') {
          return (
            <article key={index} className={styles.scheduleCard}>
              <Skeleton variant="rect" className={styles.scheduleImage} height={160} />
              <div className={styles.scheduleBody}>
                <Skeleton variant="title" width="60%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="button" width="100%" />
              </div>
            </article>
          );
        }

        return (
          <article key={index} className={styles.contractCard}>
            <Skeleton variant="title" width="55%" />
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="rect" height={72} />
            <div style={{ display: 'flex', gap: 12 }}>
              <Skeleton variant="button" width={120} />
              <Skeleton variant="button" width={140} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
