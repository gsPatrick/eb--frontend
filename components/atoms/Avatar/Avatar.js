import styles from './Avatar.module.css';
import { cn } from '@/utils/cn';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, src, size = 'md', className }) {
  return (
    <div
      className={cn(styles.avatar, styles[size], className)}
      title={name}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className={styles.image} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
    </div>
  );
}
