'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { inventoryApi, propertiesApi } from '@/src/services/api';
import { INVENTORY_STOCK_STATUS, getStockLabel } from '@/utils/inventoryHelpers';
import styles from '@/styles/admin.module.css';

const EMPTY_FORM = {
  name: '',
  currentQuantity: '0',
  criticalLevel: '1',
  unit: 'unidade',
};

export default function InventoryAdminPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [propertyId, setPropertyId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: properties = [], loading: loadingProperties } = useApiQuery(
    () => propertiesApi.list({ limit: 200 }).then((response) => response.items),
    [],
    { initialData: [] }
  );

  const fetchInventory = useCallback(async () => {
    if (!propertyId) return [];
    const response = await inventoryApi.list({ propertyId, limit: 200 });
    return response.items;
  }, [propertyId]);

  const {
    data: items = [],
    loading: loadingItems,
    refetch,
    setData,
  } = useApiQuery(fetchInventory, [propertyId], { initialData: [], enabled: Boolean(propertyId) });

  const { paginatedItems, paginationProps } = usePagination(items);
  const selectedProperty = properties.find((item) => item.id === propertyId);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.item,
      currentQuantity: String(item.quantity),
      criticalLevel: String(item.minQuantity),
      unit: item.unit === 'un.' ? 'unidade' : item.unit,
    });
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!propertyId) return;

    const payload = {
      propertyId,
      name: form.name.trim(),
      currentQuantity: Number(form.currentQuantity),
      criticalLevel: Number(form.criticalLevel),
      unit: form.unit.trim() || 'unidade',
    };

    setSaving(true);
    try {
      if (editing) {
        const updated = await inventoryApi.update(editing.id, payload);
        setData((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
        toast.success(t('toast.inventoryItemUpdated'), payload.name);
      } else {
        const created = await inventoryApi.create(payload);
        setData((prev) => [...prev, created]);
        toast.success(t('toast.inventoryItemCreated'), payload.name);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (item) => {
      try {
        await inventoryApi.remove(item.id);
        setData((prev) => prev.filter((entry) => entry.id !== item.id));
        toast.warning(t('toast.inventoryItemRemoved'), item.item);
      } catch (err) {
        toast.error(t('toast.actionBlocked'), err.message);
      }
    },
    [setData, t, toast]
  );

  const columns = useMemo(
    () => [
      { key: 'item', label: t('admin.inventory.columns.item') },
      {
        key: 'quantity',
        label: t('admin.inventory.columns.quantity'),
        render: (row) => `${row.quantity} ${row.unit}`,
      },
      {
        key: 'minQuantity',
        label: t('admin.inventory.columns.minimum'),
        render: (row) => `${row.minQuantity} ${row.unit}`,
      },
      {
        key: 'status',
        label: t('admin.inventory.columns.status'),
        render: (row) => {
          const variant =
            row.status === INVENTORY_STOCK_STATUS.CRITICAL
              ? 'error'
              : row.status === INVENTORY_STOCK_STATUS.REVIEW
                ? 'warning'
                : 'success';
          return <Badge variant={variant}>{getStockLabel(row.status, t)}</Badge>;
        },
      },
      {
        key: 'actions',
        label: t('common.actions'),
        align: 'right',
        render: (row) => (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
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

  const loading = loadingProperties || (Boolean(propertyId) && loadingItems);

  return (
    <div className={styles.page}>
      {loadingProperties ? (
        <PageHeaderSkeleton showActions />
      ) : (
        <PageHeader
          title={t('admin.inventory.title')}
          subtitle={t('admin.inventory.subtitle')}
          actions={
            <Button onClick={openCreate} disabled={!propertyId}>
              <Icon name="plus" size={16} />
              {t('admin.inventory.newItem')}
            </Button>
          }
        />
      )}

      <div className={styles.filters}>
        <FormField label={t('admin.inventory.selectProperty')} htmlFor="inventory-property">
          <Select
            id="inventory-property"
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
          >
            <option value="">{t('admin.inventory.selectPropertyPlaceholder')}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} — {property.client}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {selectedProperty ? (
        <p className={styles.filterHint}>
          {t('admin.inventory.propertyHint', {
            property: selectedProperty.name,
            client: selectedProperty.client,
          })}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={paginatedItems}
        loading={loading}
        emptyMessage={
          propertyId ? t('admin.inventory.emptyForProperty') : t('admin.inventory.selectPropertyFirst')
        }
        footer={!loading && items.length > 0 ? <Pagination {...paginationProps} /> : null}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('admin.inventory.editItem') : t('admin.inventory.newItem')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form className={styles.formGrid} onSubmit={handleSave}>
          <FormField label={t('admin.inventory.form.name')} htmlFor="inv-name">
            <Input
              id="inv-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('admin.inventory.form.namePlaceholder')}
              required
            />
          </FormField>
          <FormField label={t('admin.inventory.form.quantity')} htmlFor="inv-qty">
            <Input
              id="inv-qty"
              type="number"
              min="0"
              value={form.currentQuantity}
              onChange={(e) => setForm((prev) => ({ ...prev, currentQuantity: e.target.value }))}
            />
          </FormField>
          <FormField label={t('admin.inventory.form.minimum')} htmlFor="inv-min">
            <Input
              id="inv-min"
              type="number"
              min="0"
              value={form.criticalLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, criticalLevel: e.target.value }))}
            />
          </FormField>
          <FormField label={t('admin.inventory.form.unit')} htmlFor="inv-unit">
            <Input
              id="inv-unit"
              value={form.unit}
              onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
              placeholder={t('admin.inventory.form.unitPlaceholder')}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
