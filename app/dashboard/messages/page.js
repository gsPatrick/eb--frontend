'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { messagesApi, usersApi } from '@/src/services/api';
import { formatDateTime } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ recipientId: '', subject: '', body: '' });

  const fetchMessages = () => messagesApi.list({ limit: 100 }).then((response) => response.items);
  const { data: messages = [], loading, refetch, setData } = useApiQuery(fetchMessages, [], {
    initialData: [],
  });
  const { data: users = [] } = useApiQuery(
    () => usersApi.list({ limit: 200 }).then((response) => response.items),
    [],
    { initialData: [] }
  );

  useRealtimeRefresh('messages', refetch);

  const recipients = useMemo(
    () => users.filter((user) => user.role === 'client' || user.role === 'provider'),
    [users]
  );

  const columns = useMemo(
    () => [
      {
        key: 'from',
        label: t('admin.messages.columns.from'),
        render: (row) => row.sender?.name || '—',
      },
      {
        key: 'to',
        label: t('admin.messages.columns.to'),
        render: (row) => row.recipient?.name || '—',
      },
      { key: 'subject', label: t('admin.messages.columns.subject') },
      {
        key: 'createdAt',
        label: t('admin.messages.columns.date'),
        render: (row) => formatDateTime(row.createdAt),
      },
      {
        key: 'status',
        label: t('admin.messages.columns.status'),
        render: (row) => (
          <Badge variant={row.readAt ? 'default' : 'warning'}>
            {row.readAt ? t('admin.messages.read') : t('admin.messages.unread')}
          </Badge>
        ),
      },
    ],
    [t]
  );

  const openMessage = async (message) => {
    setSelected(message);
    if (!message.readAt && message.recipient?.role === 'admin') {
      try {
        const updated = await messagesApi.markRead(message.id);
        setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch {
        /* ignore */
      }
    }
  };

  const handleSend = async () => {
    if (!form.recipientId || !form.subject.trim() || !form.body.trim()) return;
    setSending(true);
    try {
      const created = await messagesApi.create(form);
      setData((prev) => [created, ...prev]);
      setComposing(false);
      setForm({ recipientId: '', subject: '', body: '' });
      toast.success(t('admin.messages.sent'), t('admin.messages.sentMessage'));
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('admin.messages.title')}
        subtitle={t('admin.messages.subtitle')}
        actions={
          <Button onClick={() => setComposing(true)}>{t('admin.messages.compose')}</Button>
        }
      />

      <DataTable
        columns={columns}
        rows={messages}
        loading={loading}
        emptyMessage={t('common.emptyNoRecords')}
        onRowClick={openMessage}
      />

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subject || t('admin.messages.title')}
      >
        {selected ? (
          <div className={styles.modalBody}>
            <p>
              <strong>{t('admin.messages.columns.from')}:</strong> {selected.sender?.name}
            </p>
            <p>
              <strong>{t('admin.messages.columns.to')}:</strong> {selected.recipient?.name}
            </p>
            <p>{selected.body}</p>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={composing}
        onClose={() => setComposing(false)}
        title={t('admin.messages.compose')}
      >
        <FormField label={t('admin.messages.recipient')} htmlFor="msg-recipient">
          <select
            id="msg-recipient"
            className={styles.selectNative}
            value={form.recipientId}
            onChange={(event) => setForm((prev) => ({ ...prev, recipientId: event.target.value }))}
          >
            <option value="">{t('admin.messages.selectRecipient')}</option>
            {recipients.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('admin.messages.subjectField')} htmlFor="msg-subject">
          <Input
            id="msg-subject"
            value={form.subject}
            onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
          />
        </FormField>
        <FormField label={t('admin.messages.bodyField')} htmlFor="msg-body">
          <Textarea
            id="msg-body"
            rows={5}
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
          />
        </FormField>
        <Button loading={sending} onClick={handleSend}>
          {t('admin.messages.send')}
        </Button>
      </Modal>
    </div>
  );
}
