import Input from '@/components/atoms/Input';
import Icon from '@/components/atoms/Icon';
import styles from './SearchField.module.css';

export default function SearchField({ value, onChange, placeholder = 'Buscar...', className }) {
  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      <Icon name="search" size={18} className={styles.icon} />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}
