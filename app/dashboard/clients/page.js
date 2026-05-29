'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import AddressSearchField from '@/components/molecules/AddressSearchField';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import Pagination from '@/components/molecules/Pagination';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/src/services/api';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  propertyName: '',
  propertyAddress: '',
  latitude: null,
  longitude: null,
};

export default function ClientsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: clients = [], loading, refetch, setData } = useApiQuery(
    () =>
      usersApi
        .list({ role: 'client', search: search.trim() || undefined, limit: 200 })
        .then((response) => response.items),
    [search],
    { initialData: [] }
  );

  const { paginatedItems, paginationProps } = usePagination(clients);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await usersApi.createClient({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        propertyName: form.propertyName.trim() || undefined,
        propertyAddress: form.propertyAddress.trim() || undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      });
      setData((prev) => [result.user, ...prev]);
      toast.success(t('admin.clients.created'), t('admin.clients.createdMessage', { name: result.user.name }));
      setCreateOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: t('admin.clients.columns.name') },
    { key: 'email', label: t('admin.clients.columns.email') },
    { key: 'phone', label: t('admin.clients.columns.phone') },
    {
      key: 'active',
      label: t('admin.clients.columns.status'),
      render: (row) => (row.active ? t('status.user.active') : t('status.user.inactive')),
    },
    {
      key: 'lastLoginAt',
      label: t('admin.clients.columns.lastLogin'),
      render: (row) => formatDate(row.lastLoginAt),
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('admin.clients.title')}
        subtitle={t('admin.clients.subtitle')}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="plus" size={16} />
            {t('admin.clients.newClient')}
          </Button>
        }
      />

      <div className={styles.toolbar} style={{ marginBottom: '1rem' }}>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('admin.clients.searchPlaceholder')}
        />
      </div>

      <DataTable
        columns={columns}
        rows={paginatedItems}
        loading={loading}
        emptyMessage={t('common.emptyNoRecords')}
      />

      {!loading && clients.length > 0 ? (
        <div className={styles.listFooter}>
          <Pagination {...paginationProps} />
        </div>
      ) : null}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.clients.createModalTitle')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              {t('common.create')}
            </Button>
          </>
        }
      >
        <form className={styles.formGrid} onSubmit={handleCreate}>
          <FormField label={t('admin.clients.form.name')} htmlFor="client-name">
            <Input
              id="client-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </FormField>
          <FormField label={t('admin.clients.form.email')} htmlFor="client-email">
            <Input
              id="client-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </FormField>
          <FormField label={t('admin.clients.form.password')} htmlFor="client-password">
            <Input
              id="client-password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </FormField>
          <FormField label={t('admin.clients.form.phone')} htmlFor="client-phone">
            <Input
              id="client-phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </FormField>
          <FormField label={t('admin.clients.form.address')} htmlFor="client-address" className={styles.formFullWidth}>
            <Textarea
              id="client-address"
              rows={2}
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </FormField>
          <FormField label={t('admin.clients.form.propertyName')} htmlFor="client-prop-name" className={styles.formFullWidth}>
            <Input
              id="client-prop-name"
              value={form.propertyName}
              onChange={(e) => setForm((prev) => ({ ...prev, propertyName: e.target.value }))}
              placeholder={t('admin.clients.form.propertyOptional')}
            />
          </FormField>
          <FormField
            label={t('admin.clients.form.propertyAddress')}
            htmlFor="client-prop-address"
            className={styles.formFullWidth}
            hint={t('location.searchHint')}
          >
            <AddressSearchField
              id="client-prop-address"
              value={{
                address: form.propertyAddress,
                latitude: form.latitude,
                longitude: form.longitude,
              }}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  propertyAddress: next.address,
                  latitude: next.latitude,
                  longitude: next.longitude,
                }))
              }
              placeholder={t('admin.properties.addressPlaceholder')}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
