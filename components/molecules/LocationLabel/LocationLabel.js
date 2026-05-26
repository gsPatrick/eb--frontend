'use client';

import { useTranslation } from 'react-i18next';
import MapPreview from '@/components/molecules/MapPreview';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import styles from './LocationLabel.module.css';

export default function LocationLabel({
  latitude,
  longitude,
  title,
  address,
  className,
  variant = 'property',
  mapOverlay = false,
  emptyLabel,
}) {
  const { t } = useTranslation();
  const hasCoords = latitude != null && longitude != null;
  const { label, loading } = useReverseGeocode(latitude, longitude, hasCoords && !address);
  const placeName = address || label || t('location.unknownAddress');

  if (!hasCoords && !emptyLabel) {
    return null;
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {title && !mapOverlay ? <span className={styles.title}>{title}</span> : null}
      <MapPreview
        latitude={latitude}
        longitude={longitude}
        overlayLabel={mapOverlay ? title : undefined}
        variant={variant}
        emptyLabel={emptyLabel}
      />
      {hasCoords ? (
        <strong className={styles.label}>
          {loading && !address ? t('common.loading') : placeName}
        </strong>
      ) : null}
    </div>
  );
}
