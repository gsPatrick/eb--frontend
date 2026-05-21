'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import Tabs from '@/components/molecules/Tabs';
import DataTable from '@/components/organisms/DataTable';
import OrderDetailModal from '@/components/organisms/OrderDetailModal';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { usePagination } from '@/hooks/usePagination';
import { ordersApi } from '@/src/services/api';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

export default function OrdersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data: orders = [], loading, refetch } = useApiQuery(
    () => ordersApi.list().then((response) => response.items),
    [],
    { initialData: [] }
  );

  useRealtimeRefresh('orders', refetch);

  const statusTabs = useMemo(
    () => [
      { id: 'all', label: t('admin.orders.tabs.all') },
      { id: 'pending', label: t('admin.orders.tabs.pending') },
      { id: 'in_progress', label: t('admin.orders.tabs.inProgress') },
      { id: 'completed', label: t('admin.orders.tabs.completed') },
    ],
    [t]
  );

  const filtered =
    activeTab === 'all' ? orders : orders.filter((order) => order.status === activeTab);

  const { paginatedItems, paginationProps, resetPage } = usePagination(filtered);

  useEffect(() => {
    resetPage();
  }, [activeTab, resetPage]);

  const columns = useMemo(
    () => [
      {
        key: 'provider',
        label: t('admin.orders.columns.provider'),
        render: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {row.provider ? (
              <>
                <Avatar name={row.provider} size="sm" />
                {row.provider}
              </>
            ) : (
              t('common.notAvailable')
            )}
          </div>
        ),
      },
      { key: 'property', label: t('admin.orders.columns.property') },
      { key: 'client', label: t('admin.orders.columns.client') },
      {
        key: 'status',
        label: t('admin.orders.columns.status'),
        render: (row) => {
          const status = getOrderStatusBadge(row.status, t);
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        key: 'scheduledDate',
        label: t('admin.orders.columns.date'),
        render: (row) => formatDate(row.scheduledDate),
      },
      {
        key: 'totalPrice',
        label: t('admin.orders.columns.total'),
        align: 'right',
        render: (row) => formatCurrency(row.totalPrice),
      },
    ],
    [t]
  );

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title={t('admin.orders.title')}
            subtitle={t('admin.orders.subtitle')}
          />
        )}

        {!loading && <Tabs tabs={statusTabs} activeTab={activeTab} onChange={setActiveTab} />}

        <DataTable
          columns={columns}
          rows={paginatedItems}
          onRowClick={loading ? undefined : setSelectedOrder}
          loading={loading}
          emptyMessage={t('common.emptyNoRecords')}
          footer={!loading ? <Pagination {...paginationProps} /> : null}
        />

        <OrderDetailModal
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
        />
      </div>
    </DashboardLayout>
  );
}
