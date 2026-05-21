'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import DataTable from '@/components/organisms/DataTable';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { propertiesApi } from '@/src/services/api';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

function mapPropertySyncLogs(properties) {
  return properties.flatMap((property) => {
    const syncLogs = property.metadata?.syncLogs || property.syncLogs || [];

    return syncLogs.map((log, index) => ({
      id: log.id || `${property.id}-${index}`,
      property: property.name,
      client: property.client,
      icalUrl: property.icalUrl,
      status: log.status || 'success',
      message: log.message || '',
      ranAt: log.ranAt || log.createdAt,
    }));
  });
}

export default function AdminSyncLogPage() {
  const { t } = useTranslation();
  const { data: syncLogs = [], loading } = useApiQuery(
    () => propertiesApi.list().then((response) => mapPropertySyncLogs(response.items)),
    [],
    { initialData: [] }
  );
  const { paginatedItems, paginationProps } = usePagination(syncLogs);

  const columns = useMemo(
    () => [
      { key: 'property', label: t('admin.syncLog.columns.property') },
      { key: 'client', label: t('admin.syncLog.columns.client') },
      {
        key: 'icalUrl',
        label: t('admin.syncLog.columns.icalUrl'),
        render: (row) => row.icalUrl || t('common.notAvailable'),
      },
      {
        key: 'status',
        label: t('admin.syncLog.columns.status'),
        render: (row) => (
          <Badge variant={row.status === 'success' ? 'success' : 'error'}>
            {row.status === 'success' ? t('status.sync.success') : t('status.sync.error')}
          </Badge>
        ),
      },
      { key: 'message', label: t('admin.syncLog.columns.message') },
      {
        key: 'ranAt',
        label: t('admin.syncLog.columns.ranAt'),
        render: (row) => formatDate(row.ranAt),
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
            title={t('admin.syncLog.title')}
            subtitle={t('admin.syncLog.subtitle')}
          />
        )}

        <DataTable
          columns={columns}
          rows={paginatedItems}
          loading={loading}
          emptyMessage={t('common.emptyNoRecords')}
          footer={!loading ? <Pagination {...paginationProps} /> : null}
        />
      </div>
    </DashboardLayout>
  );
}
