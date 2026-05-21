'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ClientLayout from '@/components/templates/ClientLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import { contractsApi } from '@/src/services/api';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/client.module.css';

export default function ClientContractsPage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const toast = useToast();

  const fetchContracts = useCallback(() => contractsApi.listWithAcceptanceStatus(), []);

  const { data: contracts = [], loading, refetch } = useApiQuery(fetchContracts, [], {
    initialData: [],
  });

  const handleAccept = async (contractId) => {
    try {
      await contractsApi.accept(contractId);
      await refetch({ force: true });
      toast.success(t('client.contracts.acceptSuccess'), t('client.contracts.acceptSuccessMessage'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <ClientLayout>
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader title={t('client.contracts.title')} subtitle={t('client.contracts.subtitle')} />
        )}

        {loading ? (
          <CardGridSkeleton variant="contract" count={2} />
        ) : !contracts.length ? (
          <EmptyState icon="contracts" title={t('common.emptyNoRecords')} />
        ) : (
          <div className={styles.contractList}>
            {contracts.map((contract) => {
              const accepted = contract.status === 'accepted';

              return (
                <article key={contract.id} className={styles.contractCard}>
                  <div className={styles.contractHeader}>
                    <div>
                      <h2 className={styles.contractTitle}>{contract.title}</h2>
                      <p className={styles.contractMeta}>
                        {t('client.contracts.version')} {contract.version}
                        {accepted && contract.signedAt
                          ? ` · ${t('client.contracts.signedAt')} ${formatDate(contract.signedAt, intlLocale)}`
                          : ''}
                      </p>
                    </div>
                    <Badge variant={accepted ? 'success' : 'warning'}>
                      {accepted ? t('common.accepted') : t('common.pending')}
                    </Badge>
                  </div>

                  <p className={styles.contractBody}>{t('client.contracts.contractText')}</p>

                  <div className={styles.contractActions}>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => contract.pdfUrl && window.open(contract.pdfUrl, '_blank')}
                      disabled={!contract.pdfUrl}
                    >
                      {t('client.contracts.viewContract')}
                    </Button>
                    {!accepted && (
                      <Button type="button" onClick={() => handleAccept(contract.id)}>
                        {t('client.contracts.acceptContract')}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
