'use client';

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Switch from '@/components/atoms/Switch';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/src/services/api';
import { getRoleLabel } from '@/utils/adminHelpers';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

export default function UsersPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: users = [], loading, setData } = useApiQuery(
    () => usersApi.list().then((response) => response.items),
    [],
    { initialData: [] }
  );
  const { paginatedItems, paginationProps } = usePagination(users);

  const toggleActive = useCallback(
    async (user) => {
      if (user.role === 'admin') {
        toast.warning(t('toast.actionBlocked'), t('toast.cannotDeactivateAdmin'));
        return;
      }

      try {
        const updated = await usersApi.updateStatus(user.id, !user.active);
        setData((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
        toast.success(
          user.active ? t('toast.userDeactivated') : t('toast.userActivated'),
          t('toast.userStatusChanged', {
            name: user.name,
            status: user.active ? t('status.user.inactive') : t('status.user.active'),
          })
        );
      } catch (err) {
        toast.error(t('toast.actionBlocked'), err.message);
      }
    },
    [setData, t, toast]
  );

  const changeRole = useCallback(
    async (user, role) => {
      if (user.role === 'admin') {
        toast.warning(t('toast.actionBlocked'), t('toast.cannotChangeAdminRole'));
        return;
      }

      try {
        const updated = await usersApi.updateRole(user.id, role);
        setData((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
        toast.success(
          t('toast.permissionUpdated'),
          t('toast.roleChanged', { name: user.name, role: getRoleLabel(role, t) })
        );
      } catch (err) {
        toast.error(t('toast.actionBlocked'), err.message);
      }
    },
    [setData, t, toast]
  );

  const columns = useMemo(
    () => [
      { key: 'name', label: t('admin.users.columns.name') },
      { key: 'email', label: t('admin.users.columns.email') },
      {
        key: 'role',
        label: t('admin.users.columns.permission'),
        render: (row) => (
          <Select
            value={row.role}
            onChange={(e) => changeRole(row, e.target.value)}
            disabled={row.role === 'admin'}
          >
            <option value="client">{t('roles.client')}</option>
            <option value="provider">{t('roles.provider')}</option>
            <option value="admin">{t('roles.admin')}</option>
          </Select>
        ),
      },
      {
        key: 'active',
        label: t('admin.users.columns.status'),
        render: (row) => (
          <Badge variant={row.active ? 'success' : 'error'}>
            {row.active ? t('status.user.active') : t('status.user.inactive')}
          </Badge>
        ),
      },
      {
        key: 'lastLoginAt',
        label: t('admin.users.columns.lastLogin'),
        render: (row) => formatDate(row.lastLoginAt),
      },
      {
        key: 'actions',
        label: t('admin.users.columns.actions'),
        align: 'right',
        render: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <Switch
              checked={row.active}
              onChange={() => toggleActive(row)}
              disabled={row.role === 'admin'}
              aria-label={t('admin.users.activateUser', { name: row.name })}
            />
            <Button variant="ghost" size="sm" onClick={() => toggleActive(row)} disabled={row.role === 'admin'}>
              {row.active ? t('common.deactivate') : t('common.activate')}
            </Button>
          </div>
        ),
      },
    ],
    [changeRole, t, toggleActive]
  );

  return (
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton showActions />
        ) : (
          <PageHeader
            title={t('admin.users.title')}
            subtitle={t('admin.users.subtitle')}
            actions={<Button variant="secondary">{t('admin.users.exportList')}</Button>}
          />
        )}
        <DataTable
          columns={columns}
          rows={paginatedItems}
          loading={loading}
          emptyMessage={t('common.emptyNoRecords')}
          footer={!loading ? <Pagination {...paginationProps} /> : null}
        />
      </div>
  );
}
