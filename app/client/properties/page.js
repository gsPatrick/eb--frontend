'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import ClientLayout from '@/components/templates/ClientLayout';
import { useLocale } from '@/context/I18nProvider';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { fieldReportsApi, propertiesApi } from '@/src/services/api';
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
  const toast = useToast();
  const [accessEditing, setAccessEditing] = useState(null);
  const [accessForm, setAccessForm] = useState({
    entryInstructions: '',
    gateCode: '',
    doorCode: '',
    lockboxCode: '',
  });
  const [reportsProperty, setReportsProperty] = useState(null);
  const [propertyReports, setPropertyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);

  const fetchProperties = useCallback(
    () => propertiesApi.list().then((result) => result.items),
    []
  );

  const { data: properties = [], loading, refetch, setData } = useApiQuery(fetchProperties, [], {
    initialData: [],
  });

  useRealtimeRefresh('properties', refetch);
  useRealtimeRefresh('fieldReports', () => {
    if (reportsProperty) {
      openFieldReports(reportsProperty);
    }
  });

  const openAccessEdit = (property) => {
    setAccessEditing(property);
    setAccessForm({
      entryInstructions: property.entryInstructions || '',
      gateCode: property.gateCode || '',
      doorCode: property.doorCode || '',
      lockboxCode: property.lockboxCode || '',
    });
  };

  const handleSaveAccess = async (event) => {
    event.preventDefault();
    if (!accessEditing) return;

    setSavingAccess(true);
    try {
      const updated = await propertiesApi.updateAccess(accessEditing.id, {
        entryInstructions: accessForm.entryInstructions.trim() || null,
        gateCode: accessForm.gateCode.trim() || null,
        doorCode: accessForm.doorCode.trim() || null,
        lockboxCode: accessForm.lockboxCode.trim() || null,
      });
      setData((prev) => prev.map((item) => (item.id === accessEditing.id ? updated : item)));
      toast.success(t('client.properties.accessSaved'), t('client.properties.accessSavedMessage'));
      setAccessEditing(null);
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setSavingAccess(false);
    }
  };

  const openFieldReports = async (property) => {
    setReportsProperty(property);
    setLoadingReports(true);
    try {
      const result = await fieldReportsApi.list({ propertyId: property.id, limit: 50 });
      setPropertyReports(result.items);
    } catch {
      setPropertyReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

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

            <div className={styles.icalHelp}>
              <Icon name="info" size={18} />
              <div>
                <strong>{t('client.properties.icalHelpTitle')}</strong>
                <p>{t('client.properties.icalHelpText')}</p>
              </div>
            </div>

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

                        <div className={styles.propertyActions}>
                          <Button type="button" size="sm" variant="secondary" onClick={() => openAccessEdit(property)}>
                            {t('client.properties.editAccess')}
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => openFieldReports(property)}>
                            {t('client.properties.viewFieldReports')}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={Boolean(accessEditing)}
          onClose={() => setAccessEditing(null)}
          title={t('client.properties.accessModalTitle', { name: accessEditing?.name || '' })}
          footer={
            <>
              <Button variant="ghost" onClick={() => setAccessEditing(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveAccess} loading={savingAccess}>
                {t('common.save')}
              </Button>
            </>
          }
        >
          <form className={styles.accessForm} onSubmit={handleSaveAccess}>
            <FormField label={t('admin.properties.form.entryInstructions')} htmlFor="client-entry">
              <Textarea
                id="client-entry"
                rows={3}
                value={accessForm.entryInstructions}
                onChange={(e) => setAccessForm((prev) => ({ ...prev, entryInstructions: e.target.value }))}
              />
            </FormField>
            <FormField label={t('admin.properties.form.gateCode')} htmlFor="client-gate">
              <Input
                id="client-gate"
                value={accessForm.gateCode}
                onChange={(e) => setAccessForm((prev) => ({ ...prev, gateCode: e.target.value }))}
              />
            </FormField>
            <FormField label={t('admin.properties.form.doorCode')} htmlFor="client-door">
              <Input
                id="client-door"
                value={accessForm.doorCode}
                onChange={(e) => setAccessForm((prev) => ({ ...prev, doorCode: e.target.value }))}
              />
            </FormField>
            <FormField label={t('admin.properties.form.lockboxCode')} htmlFor="client-lockbox">
              <Input
                id="client-lockbox"
                value={accessForm.lockboxCode}
                onChange={(e) => setAccessForm((prev) => ({ ...prev, lockboxCode: e.target.value }))}
              />
            </FormField>
          </form>
        </Modal>

        <Modal
          isOpen={Boolean(reportsProperty)}
          onClose={() => setReportsProperty(null)}
          title={t('client.properties.fieldReportsTitle', { name: reportsProperty?.name || '' })}
          size="lg"
        >
          {loadingReports ? (
            <p>{t('common.loading')}</p>
          ) : propertyReports.length === 0 ? (
            <p>{t('client.properties.noFieldReports')}</p>
          ) : (
            <ul className={styles.fieldReportsList}>
              {propertyReports.map((report) => (
                <li key={report.id} className={styles.fieldReportItem}>
                  <div className={styles.fieldReportHeader}>
                    <Badge variant={report.status === 'resolved' ? 'success' : 'warning'}>
                      {t(`admin.fieldReports.statuses.${report.status}`, report.status)}
                    </Badge>
                    <span>{formatDate(report.createdAt, intlLocale)}</span>
                  </div>
                  <strong>{t(`admin.fieldReports.types.${report.type}`, report.type)}</strong>
                  <p>{report.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      </div>
    </ClientLayout>
  );
}
