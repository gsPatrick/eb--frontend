'use client';

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import StatCard from '@/components/molecules/StatCard';
import DataTable from '@/components/organisms/DataTable';
import ClientLayout from '@/components/templates/ClientLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { ordersApi } from '@/src/services/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/client.module.css';

function getOrderDate(order) {
  return order.finishedAt || order.scheduledDate;
}

function mapOrderToBillingRow(order) {
  return {
    id: order.id,
    property: order.property,
    provider: order.provider,
    date: getOrderDate(order),
    basePrice: order.basePrice,
    extrasTotalPrice: order.extrasTotalPrice,
    totalPrice: order.totalPrice,
  };
}

function isInMonth(dateStr, year, month) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date.getFullYear() === year && date.getMonth() === month;
}

function sumTotal(orders) {
  return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
}

export default function ClientBillingPage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const toast = useToast();

  const fetchBillingOrders = useCallback(
    () =>
      ordersApi.list({ status: 'completed' }).then((result) =>
        result.items.map(mapOrderToBillingRow)
      ),
    []
  );

  const { data: orders = [], loading } = useApiQuery(fetchBillingOrders, [], {
    initialData: [],
  });

  const { paginatedItems, paginationProps } = usePagination(orders);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth();

  const currentMonthOrders = useMemo(
    () => orders.filter((order) => isInMonth(order.date, currentYear, currentMonth)),
    [orders, currentYear, currentMonth]
  );

  const previousMonthOrders = useMemo(
    () => orders.filter((order) => isInMonth(order.date, previousYear, previousMonth)),
    [orders, previousYear, previousMonth]
  );

  const monthTotal = sumTotal(currentMonthOrders);
  const previousMonthTotal = sumTotal(previousMonthOrders);

  const currentMonthLabel = new Intl.DateTimeFormat(intlLocale, {
    month: 'long',
    year: 'numeric',
  }).format(now);

  const columns = useMemo(
    () => [
      { key: 'property', label: t('client.billing.property') },
      { key: 'provider', label: t('client.billing.provider'), render: (row) => row.provider || '—' },
      { key: 'date', label: t('client.billing.date'), render: (row) => formatDate(row.date, intlLocale) },
      {
        key: 'basePrice',
        label: t('client.billing.base'),
        align: 'right',
        render: (row) => formatCurrency(row.basePrice),
      },
      {
        key: 'extrasTotalPrice',
        label: t('client.billing.extras'),
        align: 'right',
        render: (row) => formatCurrency(row.extrasTotalPrice),
      },
      {
        key: 'totalPrice',
        label: t('client.billing.total'),
        align: 'right',
        render: (row) => formatCurrency(row.totalPrice),
      },
    ],
    [intlLocale, t]
  );

  return (
    <ClientLayout>
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton showActions />
        ) : (
          <PageHeader
            title={t('client.billing.title')}
            subtitle={t('client.billing.subtitle')}
            actions={
              <Button
                variant="secondary"
                onClick={() => toast.info(t('toast.exportTitle'), t('toast.exportMessage'))}
              >
                {t('client.billing.downloadStatement')}
              </Button>
            }
          />
        )}

        <div className={styles.billingSummary}>
          <StatCard
            label={currentMonthLabel}
            value={formatCurrency(monthTotal)}
            change={t('client.billing.cleaningsCount', { count: currentMonthOrders.length })}
            changeType="neutral"
            icon="billing"
            loading={loading}
          />
          <StatCard
            label={t('client.billing.previousMonth')}
            value={formatCurrency(previousMonthTotal)}
            change={t('client.billing.cleaningsCount', { count: previousMonthOrders.length })}
            changeType="neutral"
            icon="billing"
            loading={loading}
          />
        </div>

        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>{t('client.billing.detailedStatement')}</h2>
          <DataTable
            columns={columns}
            rows={paginatedItems}
            loading={loading}
            emptyMessage={t('common.emptyNoRecords')}
            footer={!loading ? <Pagination {...paginationProps} /> : null}
          />
        </div>
      </div>
    </ClientLayout>
  );
}
