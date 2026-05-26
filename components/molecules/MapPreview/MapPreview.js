'use client';

import Icon from '@/components/atoms/Icon';
import styles from './MapPreview.module.css';

export default function MapPreview({
  latitude,
  longitude,
  overlayLabel,
  variant = 'property',
  emptyLabel,
  className,
  height = 160,
}) {
  const lat = latitude != null ? Number(latitude) : null;
  const lng = longitude != null ? Number(longitude) : null;

  if (lat == null || lng == null) {
    if (!emptyLabel) return null;

    return (
      <div className={[styles.card, className].filter(Boolean).join(' ')}>
        <div className={styles.empty} style={{ minHeight: height }}>
          <Icon name="map" size={22} />
          <span>{emptyLabel}</span>
        </div>
        {overlayLabel ? (
          <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{overlayLabel}</span>
        ) : null}
      </div>
    );
  }

  const delta = 0.004;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      <iframe
        title={overlayLabel || 'Map'}
        className={styles.frame}
        style={{ height }}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
      />
      {overlayLabel ? (
        <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{overlayLabel}</span>
      ) : null}
    </div>
  );
}
