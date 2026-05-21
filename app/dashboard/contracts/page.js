'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Textarea from '@/components/atoms/Textarea';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { contractsApi } from '@/src/services/api';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

const EMPTY_FORM = {
  title: '',
  type: 'client_eb',
  version: '',
  content: '',
  active: true,
};

function normalizeContract(contract) {
  return {
    ...contract,
    content: contract.content || contract.body || '',
    active: contract.active ?? true,
    updatedAt: contract.updatedAt || contract.signedAt,
  };
}

export default function AdminContractsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: templates = [], loading, setData } = useApiQuery(
    () => contractsApi.list().then((response) => response.items.map(normalizeContract)),
    [],
    { initialData: [] }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { paginatedItems, paginationProps } = usePagination(templates);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (template) => {
    setEditing(template);
    setForm({
      title: template.title,
      type: template.type,
      version: String(template.version),
      content: template.content,
      active: template.active,
    });
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      type: form.type,
      version: form.version.trim(),
      content: form.content.trim(),
      active: form.active,
    };

    setSaving(true);
    try {
      if (editing) {
        const updated = normalizeContract(await contractsApi.update(editing.id, payload));
        setData((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
        toast.success(t('toast.templateUpdated'), payload.title);
      } else {
        const created = normalizeContract(await contractsApi.create(payload));
        setData((prev) => [...prev, created]);
        toast.success(t('toast.templateCreated'), payload.title);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'title', label: t('admin.contracts.columns.template') },
      { key: 'type', label: t('admin.contracts.columns.type') },
      { key: 'version', label: t('admin.contracts.columns.version') },
      {
        key: 'active',
        label: t('admin.contracts.columns.status'),
        render: (row) => (row.active ? t('status.user.active') : t('status.user.inactive')),
      },
      {
        key: 'updatedAt',
        label: t('admin.contracts.columns.updatedAt'),
        render: (row) => formatDate(row.updatedAt),
      },
      {
        key: 'actions',
        label: t('common.actions'),
        align: 'right',
        render: (row) => (
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Icon name="edit" size={16} />
            {t('common.edit')}
          </Button>
        ),
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
            title={t('admin.contracts.title')}
            subtitle={t('admin.contracts.subtitle')}
            actions={
              <Button onClick={openCreate}>
                <Icon name="plus" size={16} />
                {t('admin.contracts.newTemplate')}
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
          title={editing ? t('admin.contracts.editTemplate') : t('admin.contracts.createTemplate')}
          size="lg"
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
          <form className={styles.geoForm} onSubmit={handleSave} style={{ gridTemplateColumns: '1fr' }}>
            <FormField label={t('admin.contracts.form.title')} htmlFor="contract-title" required>
              <Input
                id="contract-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </FormField>
            <FormField label={t('admin.contracts.form.type')} htmlFor="contract-type" required>
              <Select
                id="contract-type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="client_eb">{t('admin.contracts.types.clientEb')}</option>
                <option value="provider_eb">{t('admin.contracts.types.providerEb')}</option>
              </Select>
            </FormField>
            <FormField label={t('admin.contracts.form.version')} htmlFor="contract-version" required>
              <Input
                id="contract-version"
                value={form.version}
                onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
                placeholder={t('admin.contracts.form.versionPlaceholder')}
              />
            </FormField>
            <FormField label={t('admin.contracts.form.content')} htmlFor="contract-content" required>
              <Textarea
                id="contract-content"
                rows={8}
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </FormField>
          </form>
        </Modal>
      </div>
  );
}
