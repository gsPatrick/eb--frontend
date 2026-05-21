'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Icon from '@/components/atoms/Icon';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ClientLayout from '@/components/templates/ClientLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { propertiesApi } from '@/src/services/api';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/client.module.css';

function getCleanLabel(cleanStatus, t) {
  if (cleanStatus === 'clean') return t('common.clean');
  if (cleanStatus === 'dirty') return t('common.dirty');
  return t('common.scheduled');
}

function getCleanMessage(cleanStatus, t) {
  if (cleanStatus === 'clean') return t('client.properties.statusClean');
  if (cleanStatus === 'dirty') return t('client.properties.statusDirty');
  return t('client.properties.statusScheduled');
}

export default function ClientPropertiesPage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  const fetchProperties = useCallback(
    () => propertiesApi.list().then((result) => result.items),
    []
  );

  const { data: properties = [], loading, refetch } = useApiQuery(fetchProperties, [], {
    initialData: [],
  });

  useRealtimeRefresh('properties', refetch);

  return (
    <ClientLayout>
      <div className={styles.page}>
        {loading ? (
          <>
            <PageHeaderSkeleton />
            <CardGridSkeleton variant="property" count={properties.length || 3} />
          </>
        ) : (
          <>
            <PageHeader
              title={t('client.properties.title')}
              subtitle={t('client.properties.subtitle')}
            />

            {properties.length === 0 ? (
              <EmptyState
                icon="properties"
                title={t('empty.properties.title')}
                description={t('empty.properties.description')}
              />
            ) : (
              <div className={styles.propertyGrid}>
                {properties.map((property) => {
                  const isClean = property.cleanStatus === 'clean';
                  const badgeClass =
                    property.cleanStatus === 'clean'
                      ? styles.cleanBadgeSuccess
                      : property.cleanStatus === 'dirty'
                        ? styles.cleanBadgeWarning
                        : styles.cleanBadgeInfo;
                  const iconClass =
                    property.cleanStatus === 'clean'
                      ? styles.cleanIcon
                      : property.cleanStatus === 'dirty'
                        ? `${styles.cleanIcon} ${styles.cleanIconWarning}`
                        : `${styles.cleanIcon} ${styles.cleanIconInfo}`;

                  return (
                    <article key={property.id} className={styles.propertyCard}>
                      <div className={styles.propertyImageWrap}>
                        <img src={property.photo} alt={property.name} className={styles.propertyImage} />
                        <div className={`${styles.cleanBadge} ${badgeClass}`}>
                          <span className={iconClass}>
                            {isClean ? (
                              <Icon name="check" size={14} strokeWidth={2.5} />
                            ) : (
                              <Icon name="alert" size={14} strokeWidth={2} />
                            )}
                          </span>
                          {getCleanLabel(property.cleanStatus, t)}
                        </div>
                      </div>

                      <div className={styles.propertyBody}>
                        <div>
                          <h2 className={styles.propertyName}>{property.name}</h2>
                          <p className={styles.propertyAddress}>{property.address}</p>
                        </div>

                        <Badge
                          variant={
                            isClean ? 'success' : property.cleanStatus === 'dirty' ? 'warning' : 'info'
                          }
                        >
                          {getCleanMessage(property.cleanStatus, t)}
                        </Badge>

                        <div className={styles.propertyMeta}>
                          <div className={styles.metaItem}>
                            <span>{t('client.properties.lastCleaning')}</span>
                            <strong>{formatDate(property.lastCleaningAt, intlLocale)}</strong>
                          </div>
                          <div className={styles.metaItem}>
                            <span>{t('client.properties.nextCleaning')}</span>
                            <strong>{formatDate(property.nextCleaningAt, intlLocale)}</strong>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
}
