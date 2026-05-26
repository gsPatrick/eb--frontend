'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Modal from '@/components/molecules/Modal';
import {
  getAttachmentLabel,
  isImageAttachment,
  isPdfAttachment,
  resolveAttachmentUrl,
} from '@/utils/attachments';
import { formatDateTime } from '@/utils/formatters';
import styles from './MessageDetailModal.module.css';

function messageTypeBadgeVariant(type) {
  if (type === 'invoice') return 'info';
  if (type === 'receipt') return 'success';
  if (type === 'reminder') return 'warning';
  return 'default';
}

export default function MessageDetailModal({
  message,
  isOpen,
  onClose,
  translationScope = 'admin.messages',
  showDeliveryBadge = false,
}) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(true);

  const attachmentUrl = useMemo(
    () => resolveAttachmentUrl(message?.attachmentUrl),
    [message?.attachmentUrl]
  );
  const attachmentLabel = useMemo(
    () => getAttachmentLabel(message?.attachmentName, message?.attachmentUrl),
    [message?.attachmentName, message?.attachmentUrl]
  );
  const isPdf = isPdfAttachment(message?.attachmentName, message?.attachmentUrl);
  const isImage = isImageAttachment(message?.attachmentName, message?.attachmentUrl);
  const canPreviewInline = Boolean(attachmentUrl && (isPdf || isImage));

  useEffect(() => {
    setShowPreview(true);
  }, [message?.id]);

  if (!message) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t(`${translationScope}.messageDetail`, { defaultValue: t('common.attachments.messageDetail') })}
      size="xl"
    >
      <article className={styles.emailCard}>
        <header className={styles.emailHeader}>
          <div className={styles.emailMetaRow}>
            {message.messageType && message.messageType !== 'general' ? (
              <Badge variant={messageTypeBadgeVariant(message.messageType)}>
                {t(`${translationScope}.types.${message.messageType}`, {
                  defaultValue: message.messageType,
                })}
              </Badge>
            ) : null}
            {message.readAt ? (
              <Badge variant="default">{t(`${translationScope}.read`, { defaultValue: t('admin.messages.read') })}</Badge>
            ) : (
              <Badge variant="warning">{t(`${translationScope}.unread`, { defaultValue: t('admin.messages.unread') })}</Badge>
            )}
            {showDeliveryBadge && message.recipient?.role ? (
              <Badge variant={message.recipient.role === 'client' ? 'info' : 'success'}>
                {t('admin.messages.deliveredTo', {
                  role: t(`roles.${message.recipient.role}`),
                })}
              </Badge>
            ) : null}
          </div>

          <h3 className={styles.emailSubject}>{message.subject}</h3>

          <dl className={styles.emailField}>
            <dt>{t(`${translationScope}.columns.from`, { defaultValue: t('admin.messages.columns.from') })}</dt>
            <dd>
              {message.sender?.name || '—'}
              {message.sender?.email ? ` · ${message.sender.email}` : ''}
            </dd>
            <dt>{t(`${translationScope}.columns.to`, { defaultValue: t('admin.messages.columns.to') })}</dt>
            <dd>
              {message.recipient?.name || '—'}
              {message.recipient?.email ? ` · ${message.recipient.email}` : ''}
            </dd>
            <dt>{t(`${translationScope}.columns.date`, { defaultValue: t('admin.messages.columns.date') })}</dt>
            <dd>{formatDateTime(message.createdAt)}</dd>
          </dl>
        </header>

        <div className={styles.emailBody}>{message.body}</div>

        {attachmentUrl ? (
          <section className={styles.attachmentSection}>
            <h4 className={styles.attachmentTitle}>{t('common.attachments.title')}</h4>
            <p className={styles.attachmentFileName}>{attachmentLabel}</p>
            <div className={styles.attachmentActions}>
              {canPreviewInline ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPreview((current) => !current)}
                >
                  <Icon name="eye" size={16} />
                  {isPdf ? t('common.attachments.viewPdf') : t('common.attachments.view')}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(attachmentUrl, '_blank', 'noopener,noreferrer')}
              >
                <Icon name="eye" size={16} />
                {t('common.attachments.openInNewTab')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = attachmentUrl;
                  link.download = attachmentLabel || 'attachment';
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  link.click();
                }}
              >
                <Icon name="download" size={16} />
                {t('common.attachments.download')}
              </Button>
            </div>

            {showPreview && canPreviewInline ? (
              isPdf ? (
                <iframe
                  title={attachmentLabel || t('common.attachments.viewPdf')}
                  src={attachmentUrl}
                  className={styles.previewFrame}
                />
              ) : (
                <img
                  src={attachmentUrl}
                  alt={attachmentLabel || t('common.attachments.title')}
                  className={styles.previewImage}
                />
              )
            ) : null}
          </section>
        ) : null}
      </article>
    </Modal>
  );
}
