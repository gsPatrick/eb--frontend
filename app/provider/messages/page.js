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
import ProviderLayout from '@/components/templates/ProviderLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useToast } from '@/hooks/useToast';
import { messagesApi } from '@/src/services/api';
import { formatDateTime } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

function messageTypeBadgeVariant(type) {
  if (type === 'invoice') return 'info';
  if (type === 'receipt') return 'success';
  if (type === 'reminder') return 'warning';
  return 'default';
}

export default function ProviderMessagesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);

  const { data: messages = [], loading, refetch, setData } = useApiQuery(
    () => messagesApi.list({ limit: 100 }).then((response) => response.items),
    [],
    { initialData: [] }
  );

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
      toast.success(t('provider.messages.sent'), t('provider.messages.sentMessage'));
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <ProviderLayout>
      <div className={styles.page}>
        <PageHeader title={t('provider.messages.title')} subtitle={t('provider.messages.subtitle')} />

        <Card className={styles.composeCard}>
          <FormField label={t('provider.messages.subject')} htmlFor="provider-msg-subject">
            <Input
              id="provider-msg-subject"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
            />
          </FormField>
          <FormField label={t('provider.messages.body')} htmlFor="provider-msg-body">
            <Textarea
              id="provider-msg-body"
              rows={4}
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            />
          </FormField>
          <Button loading={sending} onClick={handleSend}>
            {t('provider.messages.sendToAdmin')}
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
                      {t(`provider.messages.types.${message.messageType}`, {
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
                    {message.attachmentName || t('provider.messages.downloadAttachment')}
                  </a>
                ) : null}
                <small className={styles.messageFooter}>
                  {message.sender?.role === 'admin'
                    ? t('provider.messages.fromAdmin')
                    : t('provider.messages.fromYou')}
                </small>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
