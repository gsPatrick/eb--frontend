'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import DataTable from '@/components/organisms/DataTable';
import MessageDetailModal from '@/components/organisms/MessageDetailModal/MessageDetailModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { messagesApi, usersApi } from '@/src/services/api';
import { formatDateTime } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

const EMPTY_FORM = { recipientId: '', subject: '', body: '' };

function messageTypeBadgeVariant(type) {
  if (type === 'invoice') return 'info';
  if (type === 'receipt') return 'success';
  if (type === 'reminder') return 'warning';
  return 'default';
}

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const clients = useMemo(
    () => users.filter((user) => user.role === 'client' && user.active),
    [users]
  );
  const providers = useMemo(
    () => users.filter((user) => user.role === 'provider' && user.active),
    [users]
  );
  const selectedRecipient = useMemo(
    () => users.find((user) => user.id === form.recipientId) || null,
    [form.recipientId, users]
  );

  const columns = useMemo(
    () => [
      {
        key: 'type',
        label: t('admin.messages.columns.type'),
        render: (row) => (
          <Badge variant={messageTypeBadgeVariant(row.messageType)}>
            {t(`admin.messages.types.${row.messageType}`, { defaultValue: row.messageType })}
          </Badge>
        ),
      },
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

  const resetCompose = () => {
    setForm(EMPTY_FORM);
    setAttachmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      const created = await messagesApi.create(form, attachmentFile);
      setData((prev) => [created, ...prev]);
      setComposing(false);
      resetCompose();
      toast.success(t('admin.messages.sent'), t('admin.messages.sentToInboxMessage'));
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

      <div className={styles.inboxInfoBanner}>
        <Icon name="info" size={20} />
        <div>
          <strong>{t('admin.messages.inboxHelpTitle')}</strong>
          <p>{t('admin.messages.inboxHelpText')}</p>
          <ul>
            <li>{t('admin.messages.inboxHelpInvoice')}</li>
            <li>{t('admin.messages.inboxHelpReceipt')}</li>
            <li>{t('admin.messages.inboxHelpManual')}</li>
          </ul>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={messages}
        loading={loading}
        emptyMessage={t('common.emptyNoRecords')}
        onRowClick={openMessage}
      />

      <MessageDetailModal
        message={selected}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        translationScope="admin.messages"
        showDeliveryBadge
      />

      <Modal
        isOpen={composing}
        onClose={() => {
          setComposing(false);
          resetCompose();
        }}
        title={t('admin.messages.compose')}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setComposing(false);
                resetCompose();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button loading={sending} onClick={handleSend}>
              {t('admin.messages.sendToInbox')}
            </Button>
          </>
        }
      >
        <p className={styles.composeIntro}>{t('admin.messages.composeIntro')}</p>

        <FormField label={t('admin.messages.recipient')} htmlFor="msg-recipient">
          <select
            id="msg-recipient"
            className={styles.selectNative}
            value={form.recipientId}
            onChange={(event) => setForm((prev) => ({ ...prev, recipientId: event.target.value }))}
          >
            <option value="">{t('admin.messages.selectRecipient')}</option>
            {clients.length ? (
              <optgroup label={t('admin.messages.recipientGroupClients')}>
                {clients.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {providers.length ? (
              <optgroup label={t('admin.messages.recipientGroupProviders')}>
                {providers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </FormField>

        {selectedRecipient ? (
          <div className={styles.deliveryNotice}>
            <Icon name="info" size={18} />
            <p>
              {t('admin.messages.deliveryNotice', {
                name: selectedRecipient.name,
                role: t(`roles.${selectedRecipient.role}`),
              })}
            </p>
          </div>
        ) : null}

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
        <FormField
          label={t('admin.messages.attachmentField')}
          htmlFor="msg-attachment"
          hint={t('admin.messages.attachmentHint')}
        >
          <input
            ref={fileInputRef}
            id="msg-attachment"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
            className={styles.fileInput}
            onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)}
          />
          {attachmentFile ? (
            <span className={styles.attachmentName}>{attachmentFile.name}</span>
          ) : null}
        </FormField>
      </Modal>
    </div>
  );
}
