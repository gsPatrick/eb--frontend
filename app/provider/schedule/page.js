'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Icon from '@/components/atoms/Icon';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import * as ordersApi from '@/src/services/api/orders';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/provider.module.css';

function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return String(dateStr).slice(0, 10) === today;
}

function openDirections(address, event) {
  event.preventDefault();
  event.stopPropagation();
  if (!address) return;
  const query = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
}

export default function ProviderSchedulePage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  const fetchTodayOrders = useCallback(async () => {
    const { items } = await ordersApi.list({ limit: 50 });
    return items.filter(
      (order) =>
        ['pending', 'in_progress'].includes(order.status) && isToday(order.scheduledDate)
    );
  }, []);

  const { data: orders, loading } = useApiQuery(fetchTodayOrders, []);
  const todayOrders = useMemo(() => orders || [], [orders]);

  return (
    <ProviderLayout>
      <div className={styles.page}>
        {loading ? (
          <>
            <PageHeaderSkeleton />
            <CardGridSkeleton variant="schedule" count={3} />
          </>
        ) : (
          <>
            <PageHeader
              title={t('provider.schedule.title')}
              subtitle={t('provider.schedule.subtitle')}
            />

            {todayOrders.length === 0 ? (
              <EmptyState
                icon="schedule"
                title={t('empty.schedule.title')}
                description={t('empty.schedule.description')}
              />
            ) : (
              <div className={styles.scheduleGrid}>
                {todayOrders.map((order) => {
                  const status = getOrderStatusBadge(order.status, t);
                  const actionLabel =
                    order.status === 'in_progress'
                      ? t('provider.schedule.continueService')
                      : t('provider.schedule.startExecution');

                  return (
                    <Link
                      key={order.id}
                      href={`/provider/execution/${order.id}`}
                      className={styles.scheduleCardLink}
                    >
                      <article className={styles.scheduleCard}>
                        {order.propertyPhoto && (
                          <img
                            src={order.propertyPhoto}
                            alt={order.property}
                            className={styles.scheduleImage}
                          />
                        )}
                        <div className={styles.scheduleBody}>
                          <div className={styles.scheduleHeader}>
                            <div>
                              <h2 className={styles.scheduleTitle}>{order.property}</h2>
                              <p className={styles.scheduleMeta}>
                                {order.propertyAddress}
                                <br />
                                {formatCurrency(order.providerPayoutAmount ?? order.totalPrice, intlLocale)}
                                {order.estimatedDurationMinutes
                                  ? ` · ~${Math.round(order.estimatedDurationMinutes / 60)}h`
                                  : ''}
                              </p>
                            </div>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>

                          <div className={styles.scheduleFooter}>
                            <span className={styles.scheduleMeta}>
                              {order.scheduledTime || t('provider.schedule.timeTbc')} ·{' '}
                              {formatDate(order.scheduledDate, intlLocale)}
                            </span>
                          </div>

                          <div className={styles.scheduleActions}>
                            <button
                              type="button"
                              className={styles.scheduleMapBtn}
                              onClick={(event) => openDirections(order.propertyAddress, event)}
                            >
                              <Icon name="map" size={16} />
                              {t('provider.schedule.openMaps')}
                            </button>
                            <span className={styles.scheduleAction}>{actionLabel}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </ProviderLayout>
  );
}
