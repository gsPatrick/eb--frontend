import Skeleton from '@/components/atoms/Skeleton';
import styles from './PageHeaderSkeleton.module.css';

export default function PageHeaderSkeleton({ showActions = false }) {
  return (
    <div className={styles.header} aria-hidden="true">
      <div>
        <Skeleton variant="title" className={styles.title} />
        <Skeleton variant="text" width="72%" />
      </div>
      {showActions && (
        <div className={styles.actions}>
          <Skeleton variant="button" width={120} />
        </div>
      )}
    </div>
  );
}
