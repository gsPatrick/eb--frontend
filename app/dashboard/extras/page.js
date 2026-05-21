'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import DataTable from '@/components/organisms/DataTable';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { ordersApi } from '@/src/services/api';
import { formatCurrency } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

const EMPTY_FORM = { name: '', defaultPrice: '', estimatedTime: '' };

export default function ExtrasPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: extras = [], loading, setData } = useApiQuery(
    () => ordersApi.listExtras().then((response) => response.items),
    [],
    { initialData: [] }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { paginatedItems, paginationProps } = usePagination(extras);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (extra) => {
    setEditing(extra);
    setForm({
      name: extra.name,
      defaultPrice: String(extra.defaultPrice),
      estimatedTime: String(extra.estimatedTime),
    });
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      defaultPrice: Number(form.defaultPrice),
      estimatedTime: Number(form.estimatedTime),
    };

    setSaving(true);
    try {
      if (editing) {
        const updated = await ordersApi.updateExtra(editing.id, payload);
        setData((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
        toast.success(t('toast.extraUpdated'), payload.name);
      } else {
        const created = await ordersApi.createExtra(payload);
        setData((prev) => [...prev, created]);
        toast.success(t('toast.extraCreated'), payload.name);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (extra) => {
      try {
        await ordersApi.removeExtra(extra.id);
        setData((prev) => prev.filter((item) => item.id !== extra.id));
        toast.warning(t('toast.extraRemoved'), extra.name);
      } catch (err) {
        toast.error(t('toast.actionBlocked'), err.message);
      }
    },
    [setData, t, toast]
  );

  const columns = useMemo(
    () => [
      { key: 'name', label: t('admin.extras.columns.service') },
      {
        key: 'defaultPrice',
        label: t('admin.extras.columns.price'),
        render: (row) => formatCurrency(row.defaultPrice),
      },
      {
        key: 'estimatedTime',
        label: t('admin.extras.columns.estimatedTime'),
        render: (row) => `${row.estimatedTime} ${t('common.minutes')}`,
      },
      {
        key: 'actions',
        label: t('common.actions'),
        align: 'right',
        render: (row) => (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
              <Icon name="edit" size={16} />
              {t('common.edit')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
              {t('common.remove')}
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete, t]
  );

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton showActions />
        ) : (
          <PageHeader
            title={t('admin.extras.title')}
            subtitle={t('admin.extras.subtitle')}
            actions={
              <Button onClick={openCreate}>
                <Icon name="plus" size={16} />
                {t('admin.extras.newService')}
              </Button>
            }
          />
        )}

        <DataTable
          columns={columns}
          rows={paginatedItems}
          loading={loading}
          emptyMessage={t('common.emptyNoRecords')}
          footer={!loading ? <Pagination {...paginationProps} /> : null}
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? t('admin.extras.editService') : t('admin.extras.createService')}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editing ? t('common.save') : t('common.create')}
              </Button>
            </>
          }
        >
          <form className={styles.geoForm} onSubmit={handleSave}>
            <FormField label={t('admin.extras.form.name')} htmlFor="extra-name" required>
              <Input
                id="extra-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t('admin.extras.form.namePlaceholder')}
              />
            </FormField>
            <FormField label={t('admin.extras.form.price')} htmlFor="extra-price" required>
              <Input
                id="extra-price"
                type="number"
                min="0"
                step="0.01"
                value={form.defaultPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, defaultPrice: e.target.value }))}
                placeholder={t('admin.extras.form.pricePlaceholder')}
              />
            </FormField>
            <FormField label={t('admin.extras.form.time')} htmlFor="extra-time" required>
              <Input
                id="extra-time"
                type="number"
                min="1"
                value={form.estimatedTime}
                onChange={(e) => setForm((prev) => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder={t('admin.extras.form.timePlaceholder')}
              />
            </FormField>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
