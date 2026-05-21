import styles from './Spinner.module.css';
import { cn } from '@/utils/cn';

export default function Spinner({ size = 'md', className }) {
  return <span className={cn(styles.spinner, styles[size], className)} aria-label="Carregando" />;
}
