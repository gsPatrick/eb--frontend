import styles from './FigmaIcon.module.css';

export default function FigmaIcon({ src, alt = '', size = 16, className }) {
  if (!src) return null;
  return <img src={src} alt={alt} width={size} height={size} className={`${styles.icon} ${className || ''}`} />;
}
