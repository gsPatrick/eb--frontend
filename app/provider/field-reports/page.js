'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import PageHeader from '@/components/molecules/PageHeader';
import Modal from '@/components/molecules/Modal';
import DataTable from '@/components/organisms/DataTable';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { fieldReportsApi } from '@/src/services/api';
import { formatDateTime } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

export default function ProviderFieldReportsPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  const fetchReports = () => fieldReportsApi.list({ limit: 100 }).then((response) => response.items);
  const { data: reports = [], loading, refetch } = useApiQuery(fetchReports, [], { initialData: [] });

  useRealtimeRefresh('fieldReports', refetch);

  const columns = useMemo(
    () => [
      { key: 'property', label: t('provider.fieldReports.columns.property') },
      {
        key: 'type',
        label: t('provider.fieldReports.columns.type'),
        render: (row) => t(`admin.fieldReports.types.${row.type}`, row.type),
      },
      {
        key: 'status',
        label: t('provider.fieldReports.columns.status'),
        render: (row) => (
          <Badge variant={row.status === 'open' ? 'warning' : 'success'}>
            {t(`admin.fieldReports.statuses.${row.status}`, row.status)}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        label: t('provider.fieldReports.columns.date'),
        render: (row) => formatDateTime(row.createdAt),
      },
    ],
    [t]
  );

  return (
    <ProviderLayout>
      <div className={styles.page}>
        <PageHeader
          title={t('provider.fieldReports.title')}
          subtitle={t('provider.fieldReports.subtitle')}
        />

        <DataTable
          columns={columns}
          rows={reports}
          loading={loading}
          emptyMessage={t('provider.fieldReports.empty')}
          onRowClick={setSelected}
        />

        <Modal
          isOpen={Boolean(selected)}
          onClose={() => setSelected(null)}
          title={t('provider.fieldReports.detailTitle')}
          size="lg"
        >
          {selected ? (
            <div className={styles.modalBody}>
              <p>
                <strong>{t('provider.fieldReports.columns.property')}:</strong> {selected.property}
              </p>
              <p>
                <strong>{t('provider.fieldReports.columns.type')}:</strong>{' '}
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
            </div>
          ) : null}
        </Modal>
      </div>
    </ProviderLayout>
  );
}
