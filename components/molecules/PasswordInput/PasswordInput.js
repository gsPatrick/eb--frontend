'use client';

import { useState } from 'react';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import { cn } from '@/utils/cn';
import styles from './PasswordInput.module.css';

export default function PasswordInput({ className, error = false, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn(styles.wrap, error && styles.error, className)}>
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        error={error}
        className={styles.input}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
}
