'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/molecules/Modal';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Select from '@/components/atoms/Select';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { ordersApi } from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import styles from './OrderDetailModal.module.css';

function MapPreview({ lat, lng, label, variant = 'property', emptyLabel }) {
  if (lat == null || lng == null) {
    return (
      <div className={styles.mapCard}>
        <div className={styles.mapEmpty}>
          <Icon name="map" size={22} />
          <span>{emptyLabel}</span>
        </div>
        <span className={`${styles.mapLabel} ${styles[`mapLabel_${variant}`]}`}>{label}</span>
      </div>
    );
  }

  const delta = 0.004;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

  return (
    <div className={styles.mapCard}>
      <iframe
        title={`Mapa ${label}`}
        className={styles.mapFrame}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
      />
      <span className={`${styles.mapLabel} ${styles[`mapLabel_${variant}`]}`}>{label}</span>
    </div>
  );
}

function PhotoPanel({ title, photos, emptyMessage }) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {photos?.length ? (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <img key={photo} src={photo} alt={title} className={styles.photo} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyPhotos}>
          <Icon name="info" size={18} />
          <span>{emptyMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  providers = [],
  onAssigned,
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setSelectedProviderId(order?.providerId || '');
  }, [order?.id, order?.providerId]);

  const status = useMemo(
    () => (order ? getOrderStatusBadge(order.status, t) : null),
    [order, t]
  );

  const canAssign = order && ['pending', 'in_progress'].includes(order.status);
  const activeProviders = useMemo(
    () => providers.filter((user) => user.role === 'provider' && user.active),
    [providers]
  );

  const handleAssign = async () => {
    if (!order || !selectedProviderId) return;

    setAssigning(true);
    try {
      const updated = await ordersApi.assign(order.id, selectedProviderId);
      toast.success(t('admin.orders.assignSuccess'), t('admin.orders.assignSuccessMessage'));
      onAssigned?.(updated);
    } catch (error) {
      toast.error(t('common.error'), error.message || t('admin.orders.assignError'));
    } finally {
      setAssigning(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order.property} size="xl">
      <div className={styles.content}>
        <div className={styles.subheader}>
          <div className={styles.subheaderMain}>
            <span className={styles.osId}>OS · {order.id.toUpperCase()}</span>
            <p className={styles.address}>{order.propertyAddress}</p>
          </div>
          {status && <Badge variant={status.variant}>{status.label}</Badge>}
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.provider')}</span>
            <strong>{order.provider || t('admin.orders.unassigned')}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.client')}</span>
            <strong>{order.client}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.date')}</span>
            <strong>{formatDate(order.scheduledDate)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.total')}</span>
            <strong>{formatCurrency(order.totalPrice)}</strong>
          </div>
        </div>

        {canAssign && (
          <section className={styles.assignSection}>
            <div className={styles.assignHeader}>
              <h3 className={styles.sectionTitle}>{t('admin.orders.assignProvider')}</h3>
              <p className={styles.assignHint}>{t('admin.orders.assignProviderHint')}</p>
            </div>
            <div className={styles.assignRow}>
              <Select
                id="order-provider"
                value={selectedProviderId}
                onChange={(event) => setSelectedProviderId(event.target.value)}
                className={styles.assignSelect}
              >
                <option value="">{t('admin.orders.selectProvider')}</option>
                {activeProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </Select>
              <Button
                variant="primary"
                disabled={!selectedProviderId || assigning}
                onClick={handleAssign}
              >
                {assigning ? t('common.loading') : t('admin.orders.assignButton')}
              </Button>
            </div>
          </section>
        )}

        <div className={styles.compareGrid}>
          <PhotoPanel
            title={t('admin.orders.beforePhotos')}
            photos={order.beforePhotos}
            emptyMessage={t('admin.orders.noBeforePhotos')}
          />
          <PhotoPanel
            title={t('admin.orders.afterPhotos')}
            photos={order.afterPhotos}
            emptyMessage={t('admin.orders.noAfterPhotos')}
          />
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('admin.orders.gpsTracking')}</h3>
          <div className={styles.mapGrid}>
            <MapPreview
              lat={order.propertyLat}
              lng={order.propertyLong}
              label={t('admin.orders.propertyLocation')}
              variant="property"
              emptyLabel={t('admin.orders.noGps')}
            />
            <MapPreview
              lat={order.checkinLat}
              lng={order.checkinLong}
              label={t('admin.orders.checkinLocation')}
              variant="checkin"
              emptyLabel={t('admin.orders.noGps')}
            />
            <MapPreview
              lat={order.checkoutLat}
              lng={order.checkoutLong}
              label={t('admin.orders.checkoutLocation')}
              variant="checkout"
              emptyLabel={t('admin.orders.noGps')}
            />
          </div>
        </section>

        {order.extras?.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('admin.orders.extrasSection')}</h3>
            <ul className={styles.extrasList}>
              {order.extras.map((extra) => (
                <li key={extra.name}>
                  <span>{extra.name}</span>
                  <strong>{formatCurrency(extra.defaultPrice ?? extra.price ?? 0)}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
