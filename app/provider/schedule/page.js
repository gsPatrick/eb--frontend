'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
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
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function ProviderSchedulePage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  const fetchTodayOrders = useCallback(async () => {
    const { items } = await ordersApi.list({ status: 'pending,in_progress' });
    return items.filter((order) => isToday(order.scheduledDate));
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

                  return (
                    <article key={order.id} className={styles.scheduleCard}>
                      {order.propertyPhoto && (
                        <img
                          src={order.propertyPhoto}
                          alt={order.property}
                          className={styles.scheduleImage}
                        />
                      )}
                      <div className={styles.scheduleBody}>
                        <div>
                          <h2 className={styles.scheduleTitle}>{order.property}</h2>
                          <p className={styles.scheduleMeta}>
                            {order.propertyAddress}
                            <br />
                            {t('provider.schedule.client')}: {order.client} ·{' '}
                            {formatCurrency(order.totalPrice)}
                          </p>
                        </div>

                        <div className={styles.scheduleFooter}>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <span className={styles.scheduleMeta}>
                            {order.scheduledTime || t('provider.schedule.timeTbc')} ·{' '}
                            {formatDate(order.scheduledDate, intlLocale)}
                          </span>
                        </div>

                        <Link href={`/provider/execution/${order.id}`}>
                          <Button fullWidth>
                            {order.status === 'in_progress'
                              ? t('provider.schedule.continueService')
                              : t('provider.schedule.startExecution')}
                          </Button>
                        </Link>
                      </div>
                    </article>
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
