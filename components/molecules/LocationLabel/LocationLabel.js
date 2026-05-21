'use client';

import { useTranslation } from 'react-i18next';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import styles from './LocationLabel.module.css';

export default function LocationLabel({ latitude, longitude, title, className }) {
  const { t } = useTranslation();
  const { label, loading, coords } = useReverseGeocode(latitude, longitude);

  if (latitude == null || longitude == null) {
    return null;
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {title ? <span className={styles.title}>{title}</span> : null}
      <strong className={styles.label}>
        {loading ? t('common.loading') : label || t('location.unknownAddress')}
      </strong>
      <span className={styles.coords}>
        {t('location.coordinates')}: {coords}
      </span>
    </div>
  );
}
