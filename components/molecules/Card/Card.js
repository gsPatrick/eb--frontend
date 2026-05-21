import styles from './Card.module.css';
import { cn } from '@/utils/cn';

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  onClick,
}) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={cn(styles.card, styles[variant], styles[`pad_${padding}`], onClick && styles.clickable, className)}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Tag>
  );
}
