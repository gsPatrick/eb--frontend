'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import StatCard from '@/components/molecules/StatCard';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { reviewsApi } from '@/src/services/api';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

function Stars({ rating }) {
  return (
    <span>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  );
}

function buildProviderRatings(reviews) {
  const byProvider = {};

  reviews.forEach((review) => {
    if (!review.provider) return;

    if (!byProvider[review.provider]) {
      byProvider[review.provider] = { provider: review.provider, total: 0, count: 0 };
    }

    byProvider[review.provider].total += review.rating;
    byProvider[review.provider].count += 1;
  });

  return Object.values(byProvider).map((item) => ({
    provider: item.provider,
    average: item.total / item.count,
    count: item.count,
  }));
}

export default function AdminReviewsPage() {
  const { t } = useTranslation();
  const { data: reviews = [], loading } = useApiQuery(
    () => reviewsApi.list().then((response) => response.items),
    [],
    { initialData: [] }
  );
  const { paginatedItems, paginationProps } = usePagination(reviews);
  const providerRatings = useMemo(() => buildProviderRatings(reviews), [reviews]);

  const columns = useMemo(
    () => [
      { key: 'provider', label: t('admin.reviews.columns.provider') },
      { key: 'client', label: t('admin.reviews.columns.client') },
      { key: 'property', label: t('admin.reviews.columns.property') },
      {
        key: 'rating',
        label: t('admin.reviews.columns.rating'),
        render: (row) => <Stars rating={row.rating} />,
      },
      { key: 'comment', label: t('admin.reviews.columns.comment') },
      {
        key: 'createdAt',
        label: t('admin.reviews.columns.date'),
        render: (row) => formatDate(row.createdAt),
      },
    ],
    [t]
  );

  return (
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title={t('admin.reviews.title')}
            subtitle={t('admin.reviews.subtitle')}
          />
        )}

        <div className={styles.grid2}>
          {providerRatings.map((item) => (
            <StatCard
              key={item.provider}
              label={item.provider}
              value={`${item.average.toFixed(1)} ★`}
              change={t('admin.reviews.reviewsCount', { count: item.count })}
              changeType="neutral"
              icon="reviews"
              loading={loading}
            />
          ))}
        </div>

        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>{t('admin.reviews.recentComments')}</h2>
          <DataTable
            columns={columns}
            rows={paginatedItems}
            loading={loading}
            emptyMessage={t('common.emptyNoRecords')}
            footer={!loading ? <Pagination {...paginationProps} /> : null}
          />
        </div>
      </div>
  );
}
