'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ClientLayout from '@/components/templates/ClientLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { inventoryApi, propertiesApi } from '@/src/services/api';
import styles from '@/styles/client.module.css';

function getStockLabel(status, t) {
  if (status === 'critical') return t('common.criticalStock');
  if (status === 'low') return t('common.lowStock');
  return t('common.okStock');
}

function getStockVariant(status) {
  if (status === 'critical') return 'error';
  if (status === 'low') return 'warning';
  return 'success';
}

export default function ClientInventoryPage() {
  const { t } = useTranslation();
  const [propertyFilter, setPropertyFilter] = useState('all');

  const fetchProperties = useCallback(
    () => propertiesApi.list().then((result) => result.items),
    []
  );

  const fetchInventory = useCallback(
    () => inventoryApi.list().then((result) => result.items),
    []
  );

  const { data: properties = [] } = useApiQuery(fetchProperties, [], { initialData: [] });

  const { data: inventory = [], loading, refetch } = useApiQuery(fetchInventory, [], {
    initialData: [],
  });

  useRealtimeRefresh('inventory', refetch);

  const filteredItems = useMemo(() => {
    if (propertyFilter === 'all') return inventory;
    return inventory.filter((item) => item.propertyId === propertyFilter);
  }, [inventory, propertyFilter]);

  return (
    <ClientLayout>
      <div className={styles.page}>
        {loading ? (
          <>
            <PageHeaderSkeleton showActions />
            <CardGridSkeleton variant="inventory" count={filteredItems.length || 4} />
          </>
        ) : (
          <>
            <PageHeader
              title={t('client.inventory.title')}
              subtitle={t('client.inventory.subtitle')}
              actions={
                <select
                  value={propertyFilter}
                  onChange={(event) => setPropertyFilter(event.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">{t('client.inventory.filterAll')}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              }
            />

            {filteredItems.length === 0 ? (
              <EmptyState
                icon="inventory"
                title={t('empty.inventory.title')}
                description={t('empty.inventory.description')}
              />
            ) : (
              <div className={styles.inventoryGrid}>
                {filteredItems.map((item) => {
                  const ratio = Math.min(item.quantity / item.minQuantity, 1);
                  const cardClass =
                    item.status === 'critical'
                      ? `${styles.inventoryCard} ${styles.inventoryCardCritical}`
                      : item.status === 'low'
                        ? `${styles.inventoryCard} ${styles.inventoryCardLow}`
                        : styles.inventoryCard;
                  const fillClass =
                    item.status === 'critical'
                      ? `${styles.stockFill} ${styles.stockFillCritical}`
                      : item.status === 'low'
                        ? `${styles.stockFill} ${styles.stockFillLow}`
                        : styles.stockFill;

                  return (
                    <article key={item.id} className={cardClass}>
                      <div className={styles.inventoryHeader}>
                        <div>
                          <h2 className={styles.inventoryTitle}>{item.item}</h2>
                          <p className={styles.inventoryProperty}>{item.property}</p>
                        </div>
                        <Badge variant={getStockVariant(item.status)}>
                          {getStockLabel(item.status, t)}
                        </Badge>
                      </div>

                      <div className={styles.stockBar}>
                        <div className={fillClass} style={{ width: `${Math.max(ratio * 100, 8)}%` }} />
                      </div>

                      <div className={styles.stockMeta}>
                        <span>
                          {t('client.inventory.quantity')}: {item.quantity} {item.unit}
                        </span>
                        <span>
                          {t('client.inventory.minimum')}: {item.minQuantity} {item.unit}
                        </span>
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
