'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import CommissionNotice from '@/components/molecules/CommissionNotice';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import Tabs from '@/components/molecules/Tabs';
import DataTable from '@/components/organisms/DataTable';
import OrderDetailModal from '@/components/organisms/OrderDetailModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { ordersApi, propertiesApi, usersApi } from '@/src/services/api';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { CLEANING_TYPES, formatEstimatedDuration, getCleaningTypeLabel } from '@/utils/cleaningTypes';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

const EMPTY_ORDER_FORM = {
  propertyId: '',
  scheduledDate: '',
  scheduledTime: '',
  cleaningType: 'regular_airbnb',
  estimatedDurationMinutes: '120',
  providerId: '',
  basePrice: '',
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_ORDER_FORM);
  const [saving, setSaving] = useState(false);
  const { data: orders = [], loading, refetch, setData } = useApiQuery(
    () => ordersApi.list().then((response) => response.items),
    [],
    { initialData: [] }
  );
  const { data: providers = [] } = useApiQuery(
    () => usersApi.list().then((response) => response.items),
    [],
    { initialData: [], enabled: !loading }
  );
  const { data: properties = [] } = useApiQuery(
    () => propertiesApi.list({ limit: 200 }).then((response) => response.items),
    [],
    { initialData: [] }
  );
  const { data: extrasCatalog = [] } = useApiQuery(
    () => ordersApi.listExtras({ limit: 200 }).then((response) => response.items),
    [],
    { initialData: [] }
  );

  useRealtimeRefresh('orders', refetch);

  const statusTabs = useMemo(
    () => [
      { id: 'all', label: t('admin.orders.tabs.all') },
      { id: 'pending', label: t('admin.orders.tabs.pending') },
      { id: 'in_progress', label: t('admin.orders.tabs.inProgress') },
      { id: 'completed', label: t('admin.orders.tabs.completed') },
    ],
    [t]
  );

  const filtered =
    activeTab === 'all' ? orders : orders.filter((order) => order.status === activeTab);

  const { paginatedItems, paginationProps, resetPage } = usePagination(filtered);
  const activeProviders = useMemo(
    () => providers.filter((user) => user.role === 'provider' && user.active),
    [providers]
  );
  const previewBasePrice = useMemo(() => {
    if (createForm.basePrice !== '') return Number(createForm.basePrice);
    const selectedProperty = properties.find((item) => item.id === createForm.propertyId);
    return Number(selectedProperty?.defaultCleaningPrice || 0);
  }, [createForm.basePrice, createForm.propertyId, properties]);

  useEffect(() => {
    resetPage();
  }, [activeTab, resetPage]);

  const handleCreateOrder = async (event) => {
    event.preventDefault();

    const basePrice = Number(createForm.basePrice);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      toast.warning(t('toast.actionBlocked'), t('admin.orders.form.basePriceRequired'));
      return;
    }

    setSaving(true);
    try {
      const created = await ordersApi.create({
        propertyId: createForm.propertyId,
        scheduledDate: createForm.scheduledDate,
        scheduledTime: createForm.scheduledTime.trim() || undefined,
        cleaningType: createForm.cleaningType,
        estimatedDurationMinutes: Number(createForm.estimatedDurationMinutes),
        providerId: createForm.providerId || undefined,
        basePrice,
      });
      setData((prev) => [created, ...prev]);
      toast.success(t('toast.orderCreated'), t('toast.orderCreatedMessage'));
      setCreateOpen(false);
      setCreateForm(EMPTY_ORDER_FORM);
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'provider',
        label: t('admin.orders.columns.provider'),
        render: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {row.provider ? (
              <>
                <Avatar name={row.provider} size="sm" />
                {row.provider}
              </>
            ) : (
              t('common.notAvailable')
            )}
          </div>
        ),
      },
      { key: 'property', label: t('admin.orders.columns.property') },
      { key: 'client', label: t('admin.orders.columns.client') },
      {
        key: 'cleaningType',
        label: t('admin.orders.columns.cleaningType'),
        render: (row) => getCleaningTypeLabel(row.cleaningType, t),
      },
      {
        key: 'estimatedDurationMinutes',
        label: t('admin.orders.columns.estimatedTime'),
        render: (row) => formatEstimatedDuration(row.estimatedDurationMinutes, t),
      },
      {
        key: 'status',
        label: t('admin.orders.columns.status'),
        render: (row) => {
          const status = getOrderStatusBadge(row.status, t);
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        key: 'scheduledDate',
        label: t('admin.orders.columns.date'),
        render: (row) => formatDate(row.scheduledDate),
      },
      {
        key: 'totalPrice',
        label: t('admin.orders.columns.total'),
        align: 'right',
        render: (row) => formatCurrency(row.totalPrice),
      },
    ],
    [t]
  );

  return (
    <div className={styles.page}>
      {loading ? (
        <PageHeaderSkeleton showActions />
      ) : (
        <PageHeader
          title={t('admin.orders.title')}
          subtitle={t('admin.orders.subtitle')}
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <Icon name="plus" size={16} />
              {t('admin.orders.newOrder')}
            </Button>
          }
        />
      )}

      {!loading && <Tabs tabs={statusTabs} activeTab={activeTab} onChange={setActiveTab} />}

      <DataTable
        columns={columns}
        rows={paginatedItems}
        onRowClick={loading ? undefined : setSelectedOrder}
        loading={loading}
        emptyMessage={t('common.emptyNoRecords')}
        footer={!loading ? <Pagination {...paginationProps} /> : null}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        providers={providers}
        extrasCatalog={extrasCatalog}
          onAssigned={(updated) => {
            setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setSelectedOrder(updated);
            refetch();
          }}
          onUpdated={(updated) => {
            setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setSelectedOrder(updated);
            refetch();
          }}
      />

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.orders.createModalTitle')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateOrder} loading={saving}>
              {t('common.create')}
            </Button>
          </>
        }
      >
        <form className={styles.formGrid} onSubmit={handleCreateOrder}>
          <FormField label={t('admin.orders.form.property')} htmlFor="order-property">
            <Select
              id="order-property"
              value={createForm.propertyId}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, propertyId: e.target.value }))}
              required
            >
              <option value="">{t('admin.orders.form.propertyPlaceholder')}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} — {property.client}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('admin.orders.form.date')} htmlFor="order-date">
            <Input
              id="order-date"
              type="date"
              value={createForm.scheduledDate}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
              required
            />
          </FormField>
          <FormField label={t('admin.orders.form.scheduledTime')} htmlFor="order-time">
            <Input
              id="order-time"
              type="time"
              value={createForm.scheduledTime}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, scheduledTime: e.target.value }))}
            />
          </FormField>
          <FormField label={t('admin.orders.form.cleaningType')} htmlFor="order-type">
            <Select
              id="order-type"
              value={createForm.cleaningType}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, cleaningType: e.target.value }))}
            >
              {CLEANING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {getCleaningTypeLabel(type, t)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('admin.orders.form.estimatedTime')} htmlFor="order-duration">
            <Input
              id="order-duration"
              type="number"
              min="15"
              step="15"
              value={createForm.estimatedDurationMinutes}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, estimatedDurationMinutes: e.target.value }))
              }
              required
            />
          </FormField>
          <FormField label={t('admin.orders.form.provider')} htmlFor="order-provider">
            <Select
              id="order-provider"
              value={createForm.providerId}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, providerId: e.target.value }))}
            >
              <option value="">{t('admin.orders.selectProvider')}</option>
              {activeProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('admin.orders.form.basePrice')} htmlFor="order-price">
            <Input
              id="order-price"
              type="number"
              min="0.01"
              step="0.01"
              value={createForm.basePrice}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, basePrice: e.target.value }))}
              placeholder={t('admin.orders.form.basePriceRequiredPlaceholder')}
              required
            />
          </FormField>
          <div className={styles.formFullWidth}>
            <CommissionNotice amount={previewBasePrice} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
