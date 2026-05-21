import styles from './Badge.module.css';
import { cn } from '@/utils/cn';

export default function Badge({ children, variant = 'default', size = 'md', className }) {
  return (
    <span className={cn(styles.badge, styles[variant], styles[size], className)}>
      {children}
    </span>
  );
}
