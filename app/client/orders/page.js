'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ClientLayout from '@/components/templates/ClientLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { ordersApi } from '@/src/services/api';
import { CLEANING_TYPES, formatEstimatedDuration, getCleaningTypeLabel } from '@/utils/cleaningTypes';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/client.module.css';

function canRequestExtras(order) {
  if (order.status !== 'pending') return false;
  const scheduled = new Date(`${order.scheduledDate}T00:00:00`);
  const deadline = new Date(scheduled.getTime() - 24 * 60 * 60 * 1000);
  return Date.now() <= deadline.getTime();
}

export default function ClientOrdersPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [requestingId, setRequestingId] = useState(null);

  const fetchData = useCallback(async () => {
    const [ordersRes, extrasRes] = await Promise.all([
      ordersApi.list({ status: 'pending', limit: 100 }),
      ordersApi.listExtras({ limit: 100 }),
    ]);
    return { orders: ordersRes.items, extras: extrasRes.items };
  }, []);

  const { data, loading, refetch, setData } = useApiQuery(fetchData, [], {
    initialData: { orders: [], extras: [] },
  });

  useRealtimeRefresh('orders', refetch);

  const orders = data?.orders ?? [];
  const extras = data?.extras ?? [];

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => String(a.scheduledDate).localeCompare(String(b.scheduledDate))),
    [orders]
  );

  const handleRequestExtra = async (order, extraId) => {
    setRequestingId(`${order.id}:${extraId}`);
    try {
      const updated = await ordersApi.requestExtra(order.id, extraId);
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((item) => (item.id === order.id ? updated : item)),
      }));
      toast.success(t('client.orders.extraRequested'), t('client.orders.extraRequestedMessage'));
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <ClientLayout>
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title={t('client.orders.title')}
            subtitle={t('client.orders.subtitle')}
          />
        )}

        {!loading && sortedOrders.length === 0 ? (
          <EmptyState
            icon="orders"
            title={t('client.orders.emptyTitle')}
            description={t('client.orders.emptyDescription')}
          />
        ) : (
          <div className={styles.ordersStack}>
            {sortedOrders.map((order) => {
              const editable = canRequestExtras(order);
              const selectedExtraIds = new Set((order.extras || []).map((extra) => extra.extraId || extra.id));

              return (
                <Card key={order.id} className={styles.orderCard} padding="md">
                  <div className={styles.orderHeader}>
                    <div>
                      <h2 className={styles.orderTitle}>{order.property}</h2>
                      <p className={styles.orderMeta}>{formatDate(order.scheduledDate)}</p>
                    </div>
                    <Badge variant="info">{t('status.order.pending')}</Badge>
                  </div>

                  <div className={styles.orderDetails}>
                    <span>
                      {t('client.orders.cleaningType')}:{' '}
                      <strong>{getCleaningTypeLabel(order.cleaningType, t)}</strong>
                    </span>
                    <span>
                      {t('client.orders.estimatedTime')}:{' '}
                      <strong>{formatEstimatedDuration(order.estimatedDurationMinutes, t)}</strong>
                    </span>
                    <span>
                      {t('common.total')}: <strong>{formatCurrency(order.totalPrice)}</strong>
                    </span>
                  </div>

                  <div className={styles.extrasSection}>
                    <h3>{t('client.orders.extrasTitle')}</h3>
                    <p className={styles.extrasHint}>
                      {editable
                        ? t('client.orders.extrasHintOpen')
                        : t('client.orders.extrasHintClosed')}
                    </p>

                    {order.extras?.length > 0 ? (
                      <ul className={styles.extrasSelected}>
                        {order.extras.map((extra) => (
                          <li key={`${extra.id}-${extra.name}`}>
                            {extra.name} — {formatCurrency(extra.defaultPrice)}
                            {extra.source === 'client_request' ? (
                              <Badge variant="success">{t('client.orders.requestedByYou')}</Badge>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className={styles.extrasGrid}>
                      {extras.map((extra) => {
                        const selected = selectedExtraIds.has(extra.id);
                        const loadingExtra = requestingId === `${order.id}:${extra.id}`;

                        return (
                          <Button
                            key={extra.id}
                            variant={selected ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={!editable || selected || loadingExtra}
                            loading={loadingExtra}
                            onClick={() => handleRequestExtra(order, extra.id)}
                          >
                            {selected ? extra.name : `+ ${extra.name}`}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
