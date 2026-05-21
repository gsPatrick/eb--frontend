'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import Icon from '@/components/atoms/Icon';
import GeofenceAlert from '@/components/molecules/GeofenceAlert';
import LocationLabel from '@/components/molecules/LocationLabel';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import * as ordersApi from '@/src/services/api/orders';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { isWithinGeofence } from '@/utils/geofence';
import { formatCurrency } from '@/utils/formatters';
import styles from '@/styles/provider.module.css';

function buildSelectedExtras(order) {
  return (order?.extras || []).reduce((acc, extra) => {
    const extraId = extra.extraId || extra.id;
    if (extraId) acc[extraId] = true;
    return acc;
  }, {});
}

export default function ProviderExecutionPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  const fetchOrder = useCallback(() => ordersApi.getById(params.id), [params.id]);
  const { data: order, loading, setData: setOrder } = useApiQuery(fetchOrder, [params.id]);

  const fetchExtras = useCallback(async () => {
    const { items } = await ordersApi.listExtras();
    return items;
  }, []);
  const { data: extrasCatalog } = useApiQuery(fetchExtras, []);

  const [pendingCheckinCoords, setPendingCheckinCoords] = useState(null);
  const [beforePhotoFiles, setBeforePhotoFiles] = useState([]);
  const [afterPhotoFiles, setAfterPhotoFiles] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState({});
  const [loadingGps, setLoadingGps] = useState(null);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [loadingExtras, setLoadingExtras] = useState({});
  const [geofenceDistance, setGeofenceDistance] = useState(null);

  useEffect(() => {
    if (order) {
      setSelectedExtras(buildSelectedExtras(order));
    }
  }, [order?.id, order?.extras]);

  const geofenceRadius = order?.geofenceRadiusM ?? 200;
  const isSubmitting = submittingCheckIn || submittingCheckout || loadingGps !== null;

  const validateGeofence = useCallback(
    (coords) => {
      if (order?.propertyLat == null || order?.propertyLong == null) {
        return { within: true, distance: 0 };
      }

      return isWithinGeofence(
        coords.lat,
        coords.lng,
        order.propertyLat,
        order.propertyLong,
        geofenceRadius
      );
    },
    [order?.propertyLat, order?.propertyLong, geofenceRadius]
  );

  const handleGeofenceApiError = useCallback(
    (err, coords) => {
      if (err.code === 'OUT_OF_PROXIMITY') {
        const distance =
          err.details?.distanceMeters ??
          (coords ? validateGeofence(coords).distance : geofenceRadius + 1);
        setGeofenceDistance(distance);
        return true;
      }

      toast.error(t('common.error'), err.message);
      return false;
    },
    [geofenceRadius, t, toast, validateGeofence]
  );

  const captureGps = useCallback(
    () =>
      new Promise((resolve) => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) =>
              resolve({
                lat: Number(position.coords.latitude.toFixed(6)),
                lng: Number(position.coords.longitude.toFixed(6)),
              }),
            () =>
              resolve({
                lat: order?.propertyLat || -22.9711,
                lng: order?.propertyLong || -43.1822,
              })
          );
          return;
        }

        resolve({
          lat: order?.propertyLat || -22.9711,
          lng: order?.propertyLong || -43.1822,
        });
      }),
    [order?.propertyLat, order?.propertyLong]
  );

  if (loading) {
    return (
      <ProviderLayout>
        <div className={styles.page}>
          <p>{t('common.loading')}</p>
        </div>
      </ProviderLayout>
    );
  }

  if (!order) {
    return (
      <ProviderLayout>
        <div className={styles.page}>
          <p>{t('provider.execution.notFound')}</p>
          <Link href="/provider/schedule">{t('provider.execution.backToSchedule')}</Link>
        </div>
      </ProviderLayout>
    );
  }

  const status = getOrderStatusBadge(order.status, t);
  const checkedIn = order.status !== 'pending';
  const checkedOut = order.status === 'completed';
  const checkinCoords =
    order.checkinLat != null
      ? { lat: order.checkinLat, lng: order.checkinLong }
      : pendingCheckinCoords;
  const hasBeforePhotos = order.beforePhotos.length > 0 || beforePhotoFiles.length > 0;
  const hasAfterPhotos = order.afterPhotos.length > 0 || afterPhotoFiles.length > 0;
  const step4Enabled = checkedIn && hasBeforePhotos;
  const canCompleteCheckout = step4Enabled && hasAfterPhotos;
  const step2Enabled = Boolean(pendingCheckinCoords) || checkedIn;

  const handleCaptureCheckinGps = async () => {
    setLoadingGps('checkin');
    const coords = await captureGps();
    const { within, distance } = validateGeofence(coords);
    setLoadingGps(null);

    if (!within) {
      setGeofenceDistance(distance);
      toast.warning(
        t('provider.execution.geofenceTitle'),
        t('provider.execution.geofenceDescription', { radius: geofenceRadius })
      );
      return;
    }

    setGeofenceDistance(null);
    setPendingCheckinCoords(coords);
    toast.success(
      t('toast.checkInSuccess'),
      t('toast.checkInGpsMessage', { lat: coords.lat, longitude: coords.lng })
    );
  };

  const handleBeforePhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const newEntries = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    const allEntries = [...beforePhotoFiles, ...newEntries];
    setBeforePhotoFiles(allEntries);

    if (order.status !== 'pending') {
      toast.success(
        t('toast.beforePhotosUploaded'),
        t('toast.photosAddedMessage', { count: files.length })
      );
      return;
    }

    if (!pendingCheckinCoords) {
      toast.warning(t('provider.execution.gpsNotCaptured'), t('provider.execution.step1Hint'));
      return;
    }

    setSubmittingCheckIn(true);
    try {
      const updated = await ordersApi.checkIn(params.id, {
        lat: pendingCheckinCoords.lat,
        long: pendingCheckinCoords.lng,
        photos: allEntries.map((entry) => entry.file),
      });
      setOrder(updated);
      setPendingCheckinCoords(null);
      toast.success(
        t('toast.beforePhotosUploaded'),
        t('toast.photosAddedMessage', { count: files.length })
      );
    } catch (err) {
      setBeforePhotoFiles((prev) => prev.slice(0, prev.length - newEntries.length));
      handleGeofenceApiError(err, pendingCheckinCoords);
    } finally {
      setSubmittingCheckIn(false);
      event.target.value = '';
    }
  };

  const handleExtraToggle = (extraId) => async (event) => {
    const checked = event.target.checked;

    if (!checked) {
      if (!order.extras.some((extra) => (extra.extraId || extra.id) === extraId)) {
        setSelectedExtras((prev) => ({ ...prev, [extraId]: false }));
      }
      return;
    }

    setSelectedExtras((prev) => ({ ...prev, [extraId]: true }));
    setLoadingExtras((prev) => ({ ...prev, [extraId]: true }));

    try {
      const updated = await ordersApi.addExtra(params.id, extraId);
      setOrder(updated);
      setSelectedExtras(buildSelectedExtras(updated));
    } catch (err) {
      setSelectedExtras((prev) => ({ ...prev, [extraId]: false }));
      toast.error(t('common.error'), err.message);
    } finally {
      setLoadingExtras((prev) => ({ ...prev, [extraId]: false }));
    }
  };

  const handleAfterPhotos = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const newEntries = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setAfterPhotoFiles((prev) => [...prev, ...newEntries]);
    toast.success(
      t('toast.afterPhotosUploaded'),
      t('toast.photosAddedMessage', { count: files.length })
    );
    event.target.value = '';
  };

  const handleCheckOut = async () => {
    if (!hasAfterPhotos) {
      toast.warning(t('toast.afterPhotosRequired'), t('toast.afterPhotosRequiredMessage'));
      return;
    }

    setLoadingGps('checkout');
    const coords = await captureGps();
    const { within, distance } = validateGeofence(coords);
    setLoadingGps(null);

    if (!within) {
      setGeofenceDistance(distance);
      toast.warning(
        t('provider.execution.geofenceTitle'),
        t('provider.execution.geofenceDescription', { radius: geofenceRadius })
      );
      return;
    }

    setSubmittingCheckout(true);
    try {
      const updated = await ordersApi.checkOut(params.id, {
        lat: coords.lat,
        long: coords.lng,
        photos: afterPhotoFiles.map((entry) => entry.file),
      });
      setOrder(updated);
      setGeofenceDistance(null);
      toast.success(t('toast.serviceCompleted'), t('toast.serviceCompletedMessage'));
      router.push('/provider/schedule');
    } catch (err) {
      handleGeofenceApiError(err, coords);
    } finally {
      setSubmittingCheckout(false);
    }
  };

  return (
    <ProviderLayout>
      {geofenceDistance !== null && (
        <GeofenceAlert
          distanceMeters={geofenceDistance}
          radiusMeters={geofenceRadius}
          onDismiss={() => setGeofenceDistance(null)}
        />
      )}

      <div className={styles.executionWrap}>
        <section className={styles.executionHero}>
          <div className={styles.executionHeroGlow} aria-hidden="true" />
          <div className={styles.executionHeroContent}>
            <Badge variant={status.variant}>{status.label}</Badge>
            <h1>{order.property}</h1>
            <p>
              {order.propertyAddress} · {t('provider.execution.clientLabel')} {order.client} ·{' '}
              {formatCurrency(order.totalPrice)}
            </p>
            <Link href="/provider/schedule">← {t('provider.execution.backToSchedule')}</Link>
          </div>
        </section>

        <div className={styles.executionSteps}>
          <section className={styles.executionPanel}>
            <h2 className={styles.panelTitle}>{t('provider.execution.step1Title')}</h2>
            <p className={styles.panelHint}>{t('provider.execution.step1Hint')}</p>
            <span className={`${styles.gpsBadge} ${checkinCoords ? styles.gpsBadgeSuccess : ''}`}>
              <Icon name="map" size={16} />
              {checkinCoords
                ? t('provider.execution.gpsCaptured', {
                    lat: checkinCoords.lat,
                    longitude: checkinCoords.lng,
                  })
                : t('provider.execution.gpsNotCaptured')}
            </span>
            {checkinCoords ? (
              <LocationLabel latitude={checkinCoords.lat} longitude={checkinCoords.lng} />
            ) : null}
            <Button
              onClick={handleCaptureCheckinGps}
              loading={loadingGps === 'checkin'}
              disabled={checkedIn || Boolean(pendingCheckinCoords) || isSubmitting}
            >
              {checkedIn || pendingCheckinCoords
                ? t('provider.execution.checkInComplete')
                : t('provider.execution.doCheckIn')}
            </Button>
          </section>

          <section
            className={`${styles.executionPanel} ${!step2Enabled ? styles.executionPanelDisabled : ''}`}
          >
            <h2 className={styles.panelTitle}>{t('provider.execution.step2Title')}</h2>
            <p className={styles.panelHint}>{t('provider.execution.step2Hint')}</p>
            <div className={styles.photoUpload}>
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                multiple
                className={styles.photoInput}
                onChange={handleBeforePhotos}
              />
              <Button
                variant="secondary"
                onClick={() => beforeInputRef.current?.click()}
                disabled={!step2Enabled || isSubmitting}
                loading={submittingCheckIn}
              >
                {t('provider.execution.addBeforePhotos')}
              </Button>
              {hasBeforePhotos && (
                <div className={styles.photoGrid}>
                  {order.beforePhotos.map((photo) => (
                    <img key={photo} src={photo} alt={t('common.before')} className={styles.photoThumb} />
                  ))}
                  {beforePhotoFiles.map((entry) => (
                    <img
                      key={entry.preview}
                      src={entry.preview}
                      alt={t('common.before')}
                      className={styles.photoThumb}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section
            className={`${styles.executionPanel} ${!checkedIn ? styles.executionPanelDisabled : ''}`}
          >
            <h2 className={styles.panelTitle}>{t('provider.execution.step3Title')}</h2>
            <p className={styles.panelHint}>{t('provider.execution.step3Hint')}</p>
            <div className={styles.extrasList}>
              {(extrasCatalog || []).map((extra) => (
                <label key={extra.id} className={styles.extraItem}>
                  <span>
                    <strong>{extra.name}</strong>
                    <br />
                    <small>
                      {formatCurrency(extra.defaultPrice)} · {extra.estimatedTime} min
                    </small>
                  </span>
                  <Checkbox
                    checked={Boolean(selectedExtras[extra.id])}
                    onChange={handleExtraToggle(extra.id)}
                    disabled={!checkedIn || isSubmitting || loadingExtras[extra.id]}
                  />
                </label>
              ))}
            </div>
          </section>

          <section
            className={`${styles.executionPanel} ${!step4Enabled || checkedOut ? styles.executionPanelDisabled : ''}`}
          >
            <h2 className={styles.panelTitle}>{t('provider.execution.step4Title')}</h2>
            <p className={styles.panelHint}>{t('provider.execution.step4Hint')}</p>
            <span className={`${styles.gpsBadge} ${checkedOut ? styles.gpsBadgeSuccess : ''}`}>
              <Icon name="map" size={16} />
              {checkedOut
                ? t('provider.execution.gpsCaptured', {
                    lat: order.checkoutLat,
                    longitude: order.checkoutLong,
                  })
                : t('provider.execution.gpsCheckoutPending')}
            </span>
            <div className={styles.photoUpload}>
              <input
                ref={afterInputRef}
                type="file"
                accept="image/*"
                multiple
                className={styles.photoInput}
                onChange={handleAfterPhotos}
              />
              <Button
                variant="secondary"
                onClick={() => afterInputRef.current?.click()}
                disabled={!step4Enabled || checkedOut || isSubmitting}
              >
                {t('provider.execution.addAfterPhotos')}
              </Button>
              {hasAfterPhotos && (
                <div className={styles.photoGrid}>
                  {order.afterPhotos.map((photo) => (
                    <img key={photo} src={photo} alt={t('common.after')} className={styles.photoThumb} />
                  ))}
                  {afterPhotoFiles.map((entry) => (
                    <img
                      key={entry.preview}
                      src={entry.preview}
                      alt={t('common.after')}
                      className={styles.photoThumb}
                    />
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleCheckOut}
              loading={submittingCheckout || loadingGps === 'checkout'}
              disabled={!canCompleteCheckout || checkedOut || isSubmitting}
            >
              {t('provider.execution.completeService')}
            </Button>
          </section>
        </div>
      </div>
    </ProviderLayout>
  );
}
