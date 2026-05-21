import Skeleton from '@/components/atoms/Skeleton';
import styles from './SidebarSkeleton.module.css';
import { cn } from '@/utils/cn';

const NAV_COUNT = 8;

export default function SidebarSkeleton({ collapsed = false }) {
  return (
    <div className={cn(styles.shell, collapsed && styles.shellCollapsed)} aria-hidden="true">
      <aside className={cn(styles.sidebar, collapsed && styles.sidebarCollapsed)}>
        <div className={styles.header}>
          <Skeleton variant="text" width={collapsed ? 32 : '70%'} height={collapsed ? 32 : 24} />
        </div>

        <nav className={styles.nav}>
          {Array.from({ length: collapsed ? 5 : NAV_COUNT }).map((_, index) => (
            <div key={index} className={cn(styles.navItem, collapsed && styles.navItemCollapsed)}>
              <Skeleton variant="circle" width={20} height={20} />
              {!collapsed && <Skeleton variant="text" width={`${55 + (index % 3) * 12}%`} />}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className={styles.promo}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" className={styles.logout} />
          </div>
        )}

        <div className={styles.logout}>
          <Skeleton variant="button" width={collapsed ? 40 : '100%'} />
        </div>
      </aside>
    </div>
  );
}
