'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ReviewModal from '@/components/organisms/ReviewModal';
import ClientLayout from '@/components/templates/ClientLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { ordersApi } from '@/src/services/api';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/client.module.css';

function downloadUrl(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function mapOrderToHistoryEntry(order) {
  return {
    id: order.id,
    property: order.property,
    provider: order.provider,
    date: order.finishedAt || order.scheduledDate,
    finishedAt: order.finishedAt,
    beforePhotos: order.beforePhotos || [],
    afterPhotos: order.afterPhotos || [],
    totalPrice: order.totalPrice,
    reviewed: false,
  };
}

export default function ClientHistoryPage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const toast = useToast();
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const fetchHistory = useCallback(
    () =>
      ordersApi.list({ status: 'completed' }).then((result) =>
        result.items.map(mapOrderToHistoryEntry)
      ),
    []
  );

  const { data: history = [], loading, refetch } = useApiQuery(fetchHistory, [], {
    initialData: [],
  });

  useRealtimeRefresh('history', refetch);

  const historyWithReviews = history.map((entry) => ({
    ...entry,
    reviewed: entry.reviewed || reviewedIds.has(entry.id),
  }));

  const handleDownloadAll = (entry) => {
    const photos = [...entry.beforePhotos, ...entry.afterPhotos];
    if (!photos.length) {
      toast.warning(t('client.history.noPhotos'));
      return;
    }

    photos.forEach((url, index) => {
      downloadUrl(url, `${entry.property}-${index + 1}.jpg`);
    });
  };

  const handleReviewSubmit = () => {
    if (reviewTarget) {
      setReviewedIds((prev) => new Set(prev).add(reviewTarget.id));
    }
    toast.success(t('toast.reviewSubmitted'), t('toast.reviewSubmittedMessage'));
  };

  return (
    <ClientLayout>
      <div className={styles.page}>
        {loading ? (
          <>
            <PageHeaderSkeleton />
            <CardGridSkeleton variant="history" count={historyWithReviews.length || 3} />
          </>
        ) : (
          <>
            <PageHeader
              title={t('client.history.title')}
              subtitle={t('client.history.subtitle')}
            />

            {historyWithReviews.length === 0 ? (
              <EmptyState
                icon="history"
                title={t('empty.history.title')}
                description={t('empty.history.description')}
              />
            ) : (
              <div className={styles.historyList}>
                {historyWithReviews.map((entry) => {
                  const allPhotos = [...entry.beforePhotos, ...entry.afterPhotos];

                  return (
                    <article key={entry.id} className={styles.historyCard}>
                      <div className={styles.historyHeader}>
                        <div>
                          <h2 className={styles.historyTitle}>{entry.property}</h2>
                          <p className={styles.historyMeta}>
                            {t('client.history.date')}: {formatDate(entry.date, intlLocale)}
                            {entry.provider
                              ? ` · ${t('client.history.provider')}: ${entry.provider}`
                              : ''}
                          </p>
                        </div>
                        <div className={styles.historyActions}>
                          {!entry.reviewed && (
                            <Button type="button" size="sm" onClick={() => setReviewTarget(entry)}>
                              {t('client.history.rateService')}
                            </Button>
                          )}
                          {entry.reviewed && (
                            <Badge variant="success">{t('client.history.reviewed')}</Badge>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownloadAll(entry)}
                            disabled={!allPhotos.length}
                          >
                            <Icon name="download" size={16} />
                            {t('client.history.downloadAll')}
                          </Button>
                        </div>
                      </div>

                      {(entry.beforePhotos.length > 0 || entry.afterPhotos.length > 0) && (
                        <div className={styles.photoCompareSection}>
                          <div className={styles.photoCompareGrid}>
                            <div className={styles.photoCompareColumn}>
                              <p className={styles.photoGroupTitle}>{t('common.before')}</p>
                              <div className={styles.photoCompareStack}>
                                {entry.beforePhotos.length > 0 ? (
                                  entry.beforePhotos.map((photo) => (
                                    <img key={photo} src={photo} alt="" className={styles.photoCompareThumb} />
                                  ))
                                ) : (
                                  <p className={styles.photoCompareEmpty}>{t('client.history.noPhotos')}</p>
                                )}
                              </div>
                            </div>
                            <div className={styles.photoCompareColumn}>
                              <p className={styles.photoGroupTitle}>{t('common.after')}</p>
                              <div className={styles.photoCompareStack}>
                                {entry.afterPhotos.length > 0 ? (
                                  entry.afterPhotos.map((photo) => (
                                    <img key={photo} src={photo} alt="" className={styles.photoCompareThumb} />
                                  ))
                                ) : (
                                  <p className={styles.photoCompareEmpty}>{t('client.history.noPhotos')}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {!allPhotos.length && (
                        <div className={styles.photoSection}>
                          <p className={styles.historyMeta}>{t('client.history.noPhotos')}</p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        <ReviewModal
          isOpen={Boolean(reviewTarget)}
          onClose={() => setReviewTarget(null)}
          service={reviewTarget}
          onSubmit={handleReviewSubmit}
        />
      </div>
    </ClientLayout>
  );
}
