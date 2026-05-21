'use client';

import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import styles from './GeofenceAlert.module.css';

export default function GeofenceAlert({ distanceMeters, radiusMeters = 200, onDismiss }) {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay} role="alertdialog" aria-modal="true" aria-labelledby="geofence-title">
      <div className={styles.panel}>
        <span className={styles.iconWrap}>
          <Icon name="map" size={28} />
        </span>
        <h2 id="geofence-title" className={styles.title}>
          {t('provider.execution.geofenceTitle')}
        </h2>
        <p className={styles.description}>{t('provider.execution.geofenceDescription', { radius: radiusMeters })}</p>
        <span className={styles.distance}>
          {t('provider.execution.geofenceDistance', { distance: Math.round(distanceMeters) })}
        </span>
        <Button fullWidth onClick={onDismiss}>
          {t('provider.execution.geofenceDismiss')}
        </Button>
      </div>
    </div>
  );
}
