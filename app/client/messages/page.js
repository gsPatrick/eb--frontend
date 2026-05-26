'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import FormField from '@/components/molecules/FormField';
import PageHeader from '@/components/molecules/PageHeader';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import ClientLayout from '@/components/templates/ClientLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { messagesApi } from '@/src/services/api';
import { formatDateTime } from '@/utils/formatters';
import styles from '@/styles/client.module.css';

function messageTypeBadgeVariant(type) {
  if (type === 'invoice') return 'info';
  if (type === 'receipt') return 'success';
  if (type === 'reminder') return 'warning';
  return 'default';
}

export default function ClientMessagesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);

  const fetchMessages = () => messagesApi.list({ limit: 100 }).then((response) => response.items);
  const { data: messages = [], loading, refetch, setData } = useApiQuery(fetchMessages, [], {
    initialData: [],
  });

  useRealtimeRefresh('messages', refetch);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [messages]
  );

  const handleSend = async () => {
    if (!form.subject.trim() || !form.body.trim()) return;
    setSending(true);
    try {
      const created = await messagesApi.create(form);
      setData((prev) => [created, ...prev]);
      setForm({ subject: '', body: '' });
      toast.success(t('client.messages.sent'), t('client.messages.sentMessage'));
    } catch (error) {
      toast.error(t('toast.actionBlocked'), error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <ClientLayout>
      <div className={styles.page}>
        <PageHeader title={t('client.messages.title')} subtitle={t('client.messages.subtitle')} />

        <Card className={styles.composeCard}>
          <FormField label={t('client.messages.subject')} htmlFor="client-msg-subject">
            <Input
              id="client-msg-subject"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
            />
          </FormField>
          <FormField label={t('client.messages.body')} htmlFor="client-msg-body">
            <Textarea
              id="client-msg-body"
              rows={4}
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            />
          </FormField>
          <Button loading={sending} onClick={handleSend}>
            {t('client.messages.sendToAdmin')}
          </Button>
        </Card>

        {loading ? null : sorted.length === 0 ? (
          <EmptyState icon="orders" title={t('common.emptyNoRecords')} />
        ) : (
          <div className={styles.messageList}>
            {sorted.map((message) => (
              <Card key={message.id} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <strong>{message.subject}</strong>
                  <span>{formatDateTime(message.createdAt)}</span>
                </div>
                {message.messageType && message.messageType !== 'general' ? (
                  <div className={styles.messageMeta}>
                    <Badge variant={messageTypeBadgeVariant(message.messageType)}>
                      {t(`client.messages.types.${message.messageType}`, {
                        defaultValue: message.messageType,
                      })}
                    </Badge>
                  </div>
                ) : null}
                <p>{message.body}</p>
                {message.attachmentUrl ? (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.attachmentLink}
                  >
                    <Icon name="download" size={16} />
                    {message.attachmentName || t('client.messages.downloadAttachment')}
                  </a>
                ) : null}
                <small className={styles.messageFooter}>
                  {message.sender?.role === 'admin'
                    ? t('client.messages.fromAdmin')
                    : t('client.messages.fromYou')}
                </small>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
