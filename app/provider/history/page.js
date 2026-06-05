'use client';

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
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
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import * as ordersApi from '@/src/services/api/orders';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/provider.module.css';

async function fetchProviderHistory() {
  const [completed, billed] = await Promise.all([
    ordersApi.list({ status: 'completed', limit: 100 }),
    ordersApi.list({ status: 'billed', limit: 100 }),
  ]);

  const merged = [...completed.items, ...billed.items];
  merged.sort(
    (a, b) =>
      new Date(b.finishedAt || b.scheduledDate) - new Date(a.finishedAt || a.scheduledDate)
  );
  return merged;
}

export default function ProviderHistoryPage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  const fetchHistory = useCallback(fetchProviderHistory, []);
  const { data: orders = [], loading, refetch } = useApiQuery(fetchHistory, [], {
    initialData: [],
  });

  useRealtimeRefresh('history', refetch);

  const totalEarned = useMemo(
    () => orders.reduce((sum, order) => sum + Number((order.providerPayoutAmount ?? order.totalPrice) || 0), 0),
    [orders]
  );

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
              title={t('provider.history.title')}
              subtitle={t('provider.history.subtitle')}
            />

            {orders.length > 0 ? (
              <div className={styles.historySummary}>
                <div>
                  <p className={styles.historySummaryLabel}>{t('provider.history.totalEarned')}</p>
                  <strong className={styles.historySummaryValue}>
                    {formatCurrency(totalEarned, intlLocale)}
                  </strong>
                </div>
                <p className={styles.historySummaryMeta}>
                  {t('provider.history.completedCount', { count: orders.length })}
                </p>
              </div>
            ) : null}

            {orders.length === 0 ? (
              <EmptyState
                icon="history"
                title={t('empty.history.title')}
                description={t('empty.history.description')}
              />
            ) : (
              <div className={styles.historyList}>
                {orders.map((order) => {
                  const status = getOrderStatusBadge(order.status, t);
                  const photoCount =
                    (order.beforePhotos?.length || 0) + (order.afterPhotos?.length || 0);

                  return (
                    <Link
                      key={order.id}
                      href={`/provider/history/${order.id}`}
                      className={styles.historyCardLink}
                    >
                      <article className={styles.historyCard}>
                        <div className={styles.historyCardHeader}>
                          <div>
                            <h2 className={styles.scheduleTitle}>{order.property}</h2>
                            <p className={styles.scheduleMeta}>
                              {order.propertyAddress}
                              <br />
                              {formatDate(order.finishedAt || order.scheduledDate, intlLocale)} ·{' '}
                              {formatCurrency(order.providerPayoutAmount ?? order.totalPrice, intlLocale)}
                            </p>
                          </div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className={styles.historyCardFooter}>
                          <p className={styles.scheduleMeta}>
                            {photoCount > 0
                              ? t('provider.history.photoCount', { count: photoCount })
                              : t('provider.history.noPhotos')}
                          </p>
                          <span className={styles.historyViewLink}>
                            {t('provider.history.viewDetails')}
                            <Icon name="chevronRight" size={16} />
                          </span>
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
