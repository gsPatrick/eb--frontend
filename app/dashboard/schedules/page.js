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
import { useToast } from '@/hooks/useToast';
import { propertiesApi, recurringSchedulesApi, usersApi } from '@/src/services/api';
import { CLEANING_TYPES, getCleaningTypeLabel } from '@/utils/cleaningTypes';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

const EMPTY_FORM = {
  propertyId: '',
  providerId: '',
  cleaningType: 'regular',
  estimatedDurationMinutes: '',
  frequency: 'weekly',
  dayOfWeek: '1',
  dayOfMonth: '1',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  basePrice: '',
};

export default function AdminSchedulesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: schedules = [], loading, refetch } = useApiQuery(
    () => recurringSchedulesApi.list({ limit: 100 }).then((response) => response.items),
    [],
    { initialData: [] }
  );
  const { data: properties = [] } = useApiQuery(
    () => propertiesApi.list({ limit: 200 }).then((response) => response.items),
    [],
    { initialData: [] }
  );
  const { data: providers = [] } = useApiQuery(
    () => usersApi.list({ limit: 200 }).then((response) => response.items.filter((u) => u.role === 'provider')),
    [],
    { initialData: [] }
  );

  const columns = useMemo(
    () => [
      { key: 'property', label: t('admin.schedules.columns.property') },
      { key: 'provider', label: t('admin.schedules.columns.provider'), render: (row) => row.provider || '—' },
      {
        key: 'frequency',
        label: t('admin.schedules.columns.frequency'),
        render: (row) => t(`admin.schedules.frequencies.${row.frequency}`, row.frequency),
      },
      {
        key: 'nextRunDate',
        label: t('admin.schedules.columns.nextRun'),
        render: (row) => formatDate(row.nextRunDate),
      },
      {
        key: 'cleaningType',
        label: t('admin.schedules.columns.type'),
        render: (row) => getCleaningTypeLabel(row.cleaningType, t),
      },
      {
        key: 'active',
        label: t('admin.schedules.columns.status'),
        render: (row) => (
          <Badge variant={row.active ? 'success' : 'default'}>
            {row.active ? t('common.active') : t('common.inactive')}
          </Badge>
        ),
      },
    ],
    [t]
  );

  const handleCreate = async () => {
    if (!form.propertyId || !form.startDate) return;
    setSaving(true);
    try {
      await recurringSchedulesApi.create({
        propertyId: form.propertyId,
        providerId: form.providerId || undefined,
        cleaningType: form.cleaningType,
        estimatedDurationMinutes: form.estimatedDurationMinutes || undefined,
        frequency: form.frequency,
        dayOfWeek: form.frequency !== 'monthly' ? Number(form.dayOfWeek) : undefined,
        dayOfMonth: form.frequency === 'monthly' ? Number(form.dayOfMonth) : undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        basePrice: form.basePrice || undefined,
      });
      setCreating(false);
      setForm(EMPTY_FORM);
      refetch();
      toast.success(t('admin.schedules.created'), t('admin.schedules.createdMessage'));
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await recurringSchedulesApi.runNow();
      refetch();
      toast.success(t('admin.schedules.runSuccess'), t('admin.schedules.runSuccessMessage'));
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('admin.schedules.title')}
        subtitle={t('admin.schedules.subtitle')}
        actions={
          <>
            <Button variant="secondary" loading={running} onClick={handleRunNow}>
              {t('admin.schedules.runNow')}
            </Button>
            <Button onClick={() => setCreating(true)}>{t('admin.schedules.new')}</Button>
          </>
        }
      />

      <DataTable columns={columns} rows={schedules} loading={loading} emptyMessage={t('common.emptyNoRecords')} />

      <Modal isOpen={creating} onClose={() => setCreating(false)} title={t('admin.schedules.new')} size="lg">
        <FormField label={t('admin.schedules.form.property')} htmlFor="schedule-property">
          <Select
            id="schedule-property"
            value={form.propertyId}
            onChange={(event) => setForm((prev) => ({ ...prev, propertyId: event.target.value }))}
          >
            <option value="">{t('admin.schedules.form.selectProperty')}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('admin.schedules.form.provider')} htmlFor="schedule-provider">
          <Select
            id="schedule-provider"
            value={form.providerId}
            onChange={(event) => setForm((prev) => ({ ...prev, providerId: event.target.value }))}
          >
            <option value="">{t('admin.orders.unassigned')}</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('admin.schedules.form.frequency')} htmlFor="schedule-frequency">
          <Select
            id="schedule-frequency"
            value={form.frequency}
            onChange={(event) => setForm((prev) => ({ ...prev, frequency: event.target.value }))}
          >
            <option value="weekly">{t('admin.schedules.frequencies.weekly')}</option>
            <option value="biweekly">{t('admin.schedules.frequencies.biweekly')}</option>
            <option value="monthly">{t('admin.schedules.frequencies.monthly')}</option>
          </Select>
        </FormField>
        <FormField label={t('admin.orders.form.cleaningType')} htmlFor="schedule-type">
          <Select
            id="schedule-type"
            value={form.cleaningType}
            onChange={(event) => setForm((prev) => ({ ...prev, cleaningType: event.target.value }))}
          >
            {Object.values(CLEANING_TYPES).map((type) => (
              <option key={type} value={type}>
                {getCleaningTypeLabel(type, t)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('admin.schedules.form.startDate')} htmlFor="schedule-start">
          <Input
            id="schedule-start"
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
          />
        </FormField>
        <FormField label={t('admin.schedules.form.basePrice')} htmlFor="schedule-price">
          <Input
            id="schedule-price"
            type="number"
            min="0"
            step="0.01"
            value={form.basePrice}
            onChange={(event) => setForm((prev) => ({ ...prev, basePrice: event.target.value }))}
          />
        </FormField>
        <Button loading={saving} onClick={handleCreate}>
          {t('common.save')}
        </Button>
      </Modal>
    </div>
  );
}
