'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { fieldReportsApi } from '@/src/services/api';
import { formatDateTime } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

export default function AdminFieldReportsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [resolving, setResolving] = useState(false);

  const fetchReports = () => fieldReportsApi.list({ limit: 100 }).then((response) => response.items);
  const { data: reports = [], loading, refetch, setData } = useApiQuery(fetchReports, [], {
    initialData: [],
  });

  useRealtimeRefresh('fieldReports', refetch);

  const columns = useMemo(
    () => [
      { key: 'property', label: t('admin.fieldReports.columns.property') },
      { key: 'provider', label: t('admin.fieldReports.columns.provider') },
      {
        key: 'type',
        label: t('admin.fieldReports.columns.type'),
        render: (row) => t(`admin.fieldReports.types.${row.type}`, row.type),
      },
      {
        key: 'status',
        label: t('admin.fieldReports.columns.status'),
        render: (row) => (
          <Badge variant={row.status === 'open' ? 'warning' : 'success'}>
            {t(`admin.fieldReports.statuses.${row.status}`, row.status)}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        label: t('admin.fieldReports.columns.date'),
        render: (row) => formatDateTime(row.createdAt),
      },
    ],
    [t]
  );

  const handleResolve = async () => {
    if (!selected) return;
    setResolving(true);
    try {
      const updated = await fieldReportsApi.resolve(selected.id);
      setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      toast.success(t('admin.fieldReports.resolved'), t('admin.fieldReports.resolvedMessage'));
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('admin.fieldReports.title')}
        subtitle={t('admin.fieldReports.subtitle')}
      />

      <DataTable
        columns={columns}
        rows={reports}
        loading={loading}
        emptyMessage={t('common.emptyNoRecords')}
        onRowClick={setSelected}
      />

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('admin.fieldReports.detailTitle')}
        size="lg"
      >
        {selected ? (
          <div className={styles.modalBody}>
            <p>
              <strong>{t('admin.fieldReports.columns.type')}:</strong>{' '}
              {t(`admin.fieldReports.types.${selected.type}`, selected.type)}
            </p>
            <p>{selected.description}</p>
            {selected.photos?.length ? (
              <div className={styles.photoGrid}>
                {selected.photos.map((photo) => (
                  <img key={photo} src={photo} alt="" className={styles.reportPhoto} />
                ))}
              </div>
            ) : null}
            {selected.status === 'open' ? (
              <Button loading={resolving} onClick={handleResolve}>
                {t('admin.fieldReports.markResolved')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
