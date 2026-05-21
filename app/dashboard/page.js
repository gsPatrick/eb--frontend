'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import AlertCard from '@/components/molecules/AlertCard';
import AlertCarousel from '@/components/molecules/AlertCarousel';
import BillingChart from '@/components/molecules/BillingChart';
import Pagination from '@/components/molecules/Pagination';
import StatCard from '@/components/molecules/StatCard';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { usePagination } from '@/hooks/usePagination';
import { inventoryApi, ordersApi, propertiesApi } from '@/src/services/api';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import {
  getStockSeverity,
  INVENTORY_STOCK_STATUS,
  summarizeInventoryStock,
} from '@/utils/inventoryHelpers';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import styles from '@/styles/admin.module.css';

function buildBillingByYear(orders) {
  const byYear = {};

  orders
    .filter((order) => order.status === 'completed' && order.finishedAt)
    .forEach((order) => {
      const date = new Date(order.finishedAt);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (!byYear[year]) byYear[year] = {};
      byYear[year][month] = (byYear[year][month] || 0) + order.totalPrice;
    });

  return Object.fromEntries(
    Object.entries(byYear).map(([year, months]) => [
      year,
      Object.entries(months).map(([month, value]) => ({
        month: Number(month),
        value,
      })),
    ])
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data, loading, refetch } = useApiQuery(
    async () => {
      const [ordersRes, propertiesRes, inventoryRes] = await Promise.all([
        ordersApi.list(),
        propertiesApi.list(),
        inventoryApi.list(),
      ]);

      return {
        orders: ordersRes.items,
        properties: propertiesRes.items,
        inventory: inventoryRes.items,
      };
    },
    [],
    { initialData: { orders: [], properties: [], inventory: [] } }
  );

  useRealtimeRefresh('dashboard', refetch);
  useRealtimeRefresh('orders', refetch);
  useRealtimeRefresh('inventory', refetch);

  const orders = data?.orders ?? [];
  const properties = data?.properties ?? [];
  const inventory = data?.inventory ?? [];
  const stockSummary = useMemo(() => summarizeInventoryStock(inventory), [inventory]);

  const inventoryAlerts = useMemo(
    () =>
      inventory
        .filter((item) => item.status !== INVENTORY_STOCK_STATUS.OK)
        .sort(
          (a, b) =>
            getStockSeverity(a.status) - getStockSeverity(b.status) ||
            a.property.localeCompare(b.property)
        )
        .map((item) => ({
          id: item.id,
          property: item.property,
          item: item.item,
          quantity: item.quantity,
          minQuantity: item.minQuantity,
          status: item.status,
        })),
    [inventory]
  );

  const stockAlertMeta = useMemo(() => {
    if (stockSummary.critical > 0) {
      return {
        variant: 'error',
        title: t('admin.dashboard.criticalStockTitle'),
        description: t('admin.dashboard.criticalStockDescription'),
        count: stockSummary.critical,
        pulse: true,
      };
    }

    if (stockSummary.review > 0) {
      return {
        variant: 'warning',
        title: t('admin.dashboard.reviewStockTitle'),
        description: t('admin.dashboard.reviewStockDescription'),
        count: stockSummary.review,
        pulse: false,
      };
    }

    return {
      variant: 'success',
      title: t('admin.dashboard.stockOkTitle'),
      description: t('admin.dashboard.stockOkDescription'),
      count: stockSummary.ok,
      pulse: false,
    };
  }, [stockSummary, t]);

  const { paginatedItems, paginationProps } = usePagination(orders);
  const billingByYear = useMemo(() => buildBillingByYear(orders), [orders]);

  const today = new Date().toISOString().slice(0, 10);
  const cleaningsToday = orders.filter((order) => order.scheduledDate === today).length;
  const inProgress = orders.filter((order) => order.status === 'in_progress').length;
  const activeProperties = properties.filter((property) => property.status === 'active').length;

  const monthlyBilling = useMemo(() => {
    const now = new Date();
    return orders
      .filter((order) => {
        if (order.status !== 'completed' || !order.finishedAt) return false;
        const date = new Date(order.finishedAt);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);
  }, [orders]);

  const recentColumns = useMemo(
    () => [
      { key: 'property', label: t('admin.dashboard.columns.property') },
      {
        key: 'provider',
        label: t('admin.dashboard.columns.provider'),
        render: (row) => row.provider || t('common.notAvailable'),
      },
      {
        key: 'status',
        label: t('admin.dashboard.columns.status'),
        render: (row) => {
          const status = getOrderStatusBadge(row.status, t);
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        key: 'scheduledDate',
        label: t('admin.dashboard.columns.date'),
        render: (row) => formatDate(row.scheduledDate),
      },
      {
        key: 'totalPrice',
        label: t('admin.dashboard.columns.total'),
        align: 'right',
        render: (row) => formatCurrency(row.totalPrice),
      },
    ],
    [t]
  );

  return (
      <div className={styles.page}>
        <div className={styles.grid4}>
          <StatCard
            label={t('admin.dashboard.cleaningsToday')}
            value={cleaningsToday}
            change={t('admin.dashboard.cleaningsTodayChange')}
            changeType="up"
            icon="users"
            loading={loading}
          />
          <StatCard
            label={t('admin.dashboard.ordersInProgress')}
            value={inProgress}
            change={t('admin.dashboard.ordersInProgressChange')}
            changeType="neutral"
            icon="orders"
            loading={loading}
          />
          <StatCard
            label={t('admin.dashboard.activeProperties')}
            value={activeProperties}
            change={t('admin.dashboard.activePropertiesChange')}
            changeType="neutral"
            icon="properties"
            loading={loading}
          />
          <StatCard
            label={t('admin.dashboard.monthlyBilling')}
            value={formatCurrency(monthlyBilling)}
            change={t('admin.dashboard.monthlyBillingChange')}
            changeType="up"
            icon="billing"
            loading={loading}
          />
        </div>

        {!loading && (
        <section className={styles.alertSection}>
          <div className={styles.stockSummary}>
            <div className={cn(styles.stockStat, styles.stockStatOk)}>
              <span className={styles.stockStatLabel}>{t('common.okStock')}</span>
              <strong className={styles.stockStatValue}>{stockSummary.ok}</strong>
            </div>
            <div className={cn(styles.stockStat, styles.stockStatReview)}>
              <span className={styles.stockStatLabel}>{t('common.reviewStock')}</span>
              <strong className={styles.stockStatValue}>{stockSummary.review}</strong>
            </div>
            <div className={cn(styles.stockStat, styles.stockStatCritical)}>
              <span className={styles.stockStatLabel}>{t('common.criticalStock')}</span>
              <strong className={styles.stockStatValue}>{stockSummary.critical}</strong>
            </div>
          </div>

          <AlertCard
            fullWidth
            variant={stockAlertMeta.variant}
            title={stockAlertMeta.title}
            description={stockAlertMeta.description}
            count={stockAlertMeta.count}
            pulse={stockAlertMeta.pulse}
          />
          <AlertCarousel items={inventoryAlerts} t={t} />
        </section>
        )}

        <BillingChart dataByYear={billingByYear} loading={loading} />

        <div className={styles.cardSection}>
          <div className={styles.toolbar}>
            <h2 className={styles.sectionTitle}>{t('admin.dashboard.recentOrders')}</h2>
            <Link href="/dashboard/orders" className={styles.link}>
              {t('admin.dashboard.viewFullTable')}
            </Link>
          </div>
          <DataTable
            columns={recentColumns}
            rows={paginatedItems}
            loading={loading}
            emptyMessage={t('common.emptyNoRecords')}
            footer={!loading ? <Pagination {...paginationProps} /> : null}
          />
        </div>
      </div>
  );
}
