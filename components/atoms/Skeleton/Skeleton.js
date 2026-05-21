import styles from './Skeleton.module.css';
import { cn } from '@/utils/cn';

export default function Skeleton({ variant = 'text', width, height, className }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={cn(styles.skeleton, styles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}
