import Avatar from '@/components/atoms/Avatar';
import Icon from '@/components/atoms/Icon';
import styles from './ListItem.module.css';
import { cn } from '@/utils/cn';

export default function ListItem({
  title,
  subtitle,
  avatar,
  icon,
  trailing,
  active = false,
  onClick,
  className,
}) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={cn(styles.item, active && styles.active, onClick && styles.clickable, className)}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {avatar && <Avatar name={avatar.name} src={avatar.src} size="sm" />}
      {icon && !avatar && (
        <span className={styles.iconWrap}>
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </Tag>
  );
}
