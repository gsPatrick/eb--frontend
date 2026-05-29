'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Modal from '@/components/molecules/Modal';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { notificationsApi } from '@/src/services/api/notifications';
import { formatDateTime } from '@/utils/formatters';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [listResult, count] = await Promise.all([
        notificationsApi.list({ limit: 50 }),
        notificationsApi.getUnreadCount(),
      ]);
      setItems(listResult.items);
      setUnreadCount(count);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtimeRefresh('notifications', fetchNotifications);

  const handleOpen = () => {
    setOpen(true);
    fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      const updated = await notificationsApi.markRead(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button type="button" className={styles.bellButton} onClick={handleOpen} aria-label={t('notifications.title')}>
        <Icon name="bell" size={20} />
        {unreadCount > 0 ? <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('notifications.title')}
        size="lg"
        footer={
          unreadCount > 0 ? (
            <Button variant="ghost" onClick={handleMarkAllRead}>
              {t('notifications.markAllRead')}
            </Button>
          ) : null
        }
      >
        <div className={styles.list}>
          {loading && items.length === 0 ? (
            <p className={styles.empty}>{t('common.loading')}</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>{t('notifications.empty')}</p>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className={`${styles.item} ${item.readAt ? styles.read : styles.unread}`}
                onClick={() => !item.readAt && handleMarkRead(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !item.readAt) handleMarkRead(item.id);
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.itemHeader}>
                  <strong>{item.title}</strong>
                  {!item.readAt ? <Badge variant="warning">{t('notifications.unread')}</Badge> : null}
                </div>
                <p>{item.message}</p>
                <small>{formatDateTime(item.createdAt)}</small>
              </article>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}
