'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import * as contractsApi from '@/src/services/api/contracts';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/client.module.css';

export default function ProviderContractsPage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const toast = useToast();
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchContracts = useCallback(() => contractsApi.listWithAcceptanceStatus(), []);

  const { data: contracts, loading, setData: setContracts } = useApiQuery(fetchContracts, []);
  const contractList = contracts || [];

  const handleAccept = async (contractId) => {
    setAcceptingId(contractId);
    try {
      const acceptance = await contractsApi.accept(contractId);
      setContracts((prev) =>
        (prev || []).map((contract) =>
          contract.id === contractId
            ? {
                ...contract,
                status: 'accepted',
                signedAt: acceptance?.acceptedAt || acceptance?.signedAt || new Date().toISOString(),
              }
            : contract
        )
      );
      toast.success(t('provider.contracts.acceptSuccess'), t('provider.contracts.acceptSuccessMessage'));
    } catch (err) {
      toast.error(t('common.error'), err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <ProviderLayout>
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader title={t('provider.contracts.title')} subtitle={t('provider.contracts.subtitle')} />
        )}

        {loading ? (
          <CardGridSkeleton variant="contract" count={1} />
        ) : !contractList.length ? (
          <EmptyState icon="contracts" title={t('common.emptyNoRecords')} />
        ) : (
          <div className={styles.contractList}>
            {contractList.map((contract) => {
              const accepted = contract.status === 'accepted';

              return (
                <article key={contract.id} className={styles.contractCard}>
                  <div className={styles.contractHeader}>
                    <div>
                      <h2 className={styles.contractTitle}>{contract.title}</h2>
                      <p className={styles.contractMeta}>
                        {t('provider.contracts.version')} {contract.version}
                        {accepted && contract.signedAt
                          ? ` · ${t('provider.contracts.signedAt')} ${formatDate(contract.signedAt, intlLocale)}`
                          : ''}
                      </p>
                    </div>
                    <Badge variant={accepted ? 'success' : 'warning'}>
                      {accepted ? t('common.accepted') : t('common.pending')}
                    </Badge>
                  </div>

                  <p className={styles.contractBody}>{t('provider.contracts.contractText')}</p>

                  <div className={styles.contractActions}>
                    <Button variant="secondary" type="button">
                      {t('provider.contracts.viewContract')}
                    </Button>
                    {!accepted && (
                      <Button
                        type="button"
                        onClick={() => handleAccept(contract.id)}
                        loading={acceptingId === contract.id}
                        disabled={acceptingId !== null}
                      >
                        {t('provider.contracts.acceptContract')}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
