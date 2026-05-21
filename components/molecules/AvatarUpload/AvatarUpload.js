'use client';

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import styles from './AvatarUpload.module.css';

const MAX_SIZE = 2 * 1024 * 1024;

export default function AvatarUpload({ name, src, onChange }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  const handleSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.wrap}>
      <Avatar name={name} src={src} size="lg" className={styles.avatar} />
      <div className={styles.meta}>
        <strong>{t('profile.avatar')}</strong>
        <span>{t('profile.avatarHint')}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.input}
          onChange={handleSelect}
        />
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          {t('profile.changeAvatar')}
        </Button>
      </div>
    </div>
  );
}
