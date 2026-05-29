'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Icon from '@/components/atoms/Icon';
import LocationLabel from '@/components/molecules/LocationLabel';
import PageHeader from '@/components/molecules/PageHeader';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import * as ordersApi from '@/src/services/api/orders';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/provider.module.css';

export default function ProviderHistoryDetailPage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const params = useParams();

  const fetchOrder = useCallback(() => ordersApi.getById(params.id), [params.id]);
  const { data: order, loading } = useApiQuery(fetchOrder, [params.id]);

  if (loading && !order) {
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
          <p>{t('provider.history.notFound')}</p>
          <Link href="/provider/history">{t('provider.history.backToList')}</Link>
        </div>
      </ProviderLayout>
    );
  }

  const status = getOrderStatusBadge(order.status, t);

  return (
    <ProviderLayout>
      <div className={styles.page}>
        <Link href="/provider/history" className={styles.historyBackLink}>
          <Icon name="chevronLeft" size={18} />
          {t('provider.history.backToList')}
        </Link>

        <PageHeader title={order.property} subtitle={order.propertyAddress} />

        <article className={styles.historyDetailCard}>
          <div className={styles.historyCardHeader}>
            <div>
              <p className={styles.scheduleMeta}>
                {formatDate(order.finishedAt || order.scheduledDate, intlLocale)} ·{' '}
                {formatCurrency(order.providerPayoutAmount ?? order.totalPrice, intlLocale)}
              </p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className={styles.historyLocationGrid}>
            <LocationLabel
              title={t('provider.history.propertyLocation')}
              latitude={order.propertyLat}
              longitude={order.propertyLong}
              address={order.propertyAddress}
            />
            <LocationLabel
              title={t('provider.history.checkInLocation')}
              latitude={order.checkinLat}
              longitude={order.checkinLong}
            />
            <LocationLabel
              title={t('provider.history.checkOutLocation')}
              latitude={order.checkoutLat}
              longitude={order.checkoutLong}
            />
          </div>

          {order.extras?.length ? (
            <div className={styles.historyExtras}>
              <h3 className={styles.panelTitle}>{t('provider.history.extrasPerformed')}</h3>
              <ul className={styles.historyExtrasList}>
                {order.extras.map((extra) => (
                  <li key={extra.id || extra.extraId}>
                    {extra.name} · {formatCurrency(extra.defaultPrice, intlLocale)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>

        {(order.beforePhotos?.length || order.afterPhotos?.length) ? (
          <section className={styles.photoCompareSection}>
            <div className={styles.photoCompareGrid}>
              <div className={styles.photoCompareColumn}>
                <h3 className={styles.panelTitle}>{t('common.before')}</h3>
                <div className={styles.photoCompareStack}>
                  {order.beforePhotos?.length ? (
                    order.beforePhotos.map((photo) => (
                      <a key={photo} href={photo} target="_blank" rel="noopener noreferrer">
                        <img src={photo} alt={t('common.before')} className={styles.photoCompareThumb} />
                      </a>
                    ))
                  ) : (
                    <p className={styles.photoCompareEmpty}>{t('provider.history.noPhotos')}</p>
                  )}
                </div>
              </div>
              <div className={styles.photoCompareColumn}>
                <h3 className={styles.panelTitle}>{t('common.after')}</h3>
                <div className={styles.photoCompareStack}>
                  {order.afterPhotos?.length ? (
                    order.afterPhotos.map((photo) => (
                      <a key={photo} href={photo} target="_blank" rel="noopener noreferrer">
                        <img src={photo} alt={t('common.after')} className={styles.photoCompareThumb} />
                      </a>
                    ))
                  ) : (
                    <p className={styles.photoCompareEmpty}>{t('provider.history.noPhotos')}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <p className={styles.scheduleMeta}>{t('provider.history.noPhotos')}</p>
        )}
      </div>
    </ProviderLayout>
  );
}
