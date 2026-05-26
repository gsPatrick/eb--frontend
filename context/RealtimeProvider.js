'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/src/services/api/api-client';
import { clearAuthSession } from '@/utils/authSession';
import { useToast } from '@/hooks/useToast';

const RealtimeContext = createContext(null);

export { RealtimeContext };

const ADMIN_EVENTS = new Set(['ORDER_CHECKIN', 'INVENTORY_CRITICAL', 'INBOX_MESSAGE', 'FIELD_REPORT']);
const CLIENT_EVENTS = new Set(['ORDER_COMPLETED', 'INVENTORY_CRITICAL', 'INBOX_MESSAGE', 'CLEANING_REMINDER', 'FIELD_REPORT']);

export function RealtimeProvider({ children, audience = 'admin' }) {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const toastRef = useRef(toast);
  const routerRef = useRef(router);
  const listenersRef = useRef(new Map());
  const socketRef = useRef(null);

  toastRef.current = toast;
  routerRef.current = router;

  const bumpRefresh = useCallback((scope) => {
    listenersRef.current.get(scope)?.forEach((callback) => callback());
  }, []);

  const subscribe = useCallback((scope, callback) => {
    if (!listenersRef.current.has(scope)) {
      listenersRef.current.set(scope, new Set());
    }

    listenersRef.current.get(scope).add(callback);
    return () => listenersRef.current.get(scope)?.delete(callback);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || socketRef.current) {
      return undefined;
    }

    const token = localStorage.getItem('eb_token');
    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('notification', (payload) => {
      const type = payload?.type;
      const allowed =
        audience === 'admin' ? ADMIN_EVENTS.has(type) : CLIENT_EVENTS.has(type);

      if (!allowed) return;

      toastRef.current.info(payload.title || type, payload.message || '');

      if (type === 'ORDER_CHECKIN') {
        bumpRefresh('orders');
        bumpRefresh('dashboard');
      }

      if (type === 'ORDER_COMPLETED') {
        bumpRefresh('history');
        bumpRefresh('properties');
      }

      if (type === 'INVENTORY_CRITICAL') {
        bumpRefresh('inventory');
        bumpRefresh('dashboard');
      }

      if (type === 'INBOX_MESSAGE') {
        bumpRefresh('messages');
      }

      if (type === 'FIELD_REPORT') {
        bumpRefresh('fieldReports');
      }

      if (type === 'CLEANING_REMINDER') {
        bumpRefresh('orders');
      }
    });

    socket.on('force_logout', (payload) => {
      toastRef.current.warning(payload?.title || t('common.sessionEnded'), payload?.message || '');
      clearAuthSession();
      routerRef.current.replace('/login');
    });

    socket.on('connect_error', (error) => {
      console.warn('[realtime] connect_error', error?.message || error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [audience, bumpRefresh, t]);

  const value = useMemo(
    () => ({
      bumpRefresh,
      subscribe,
    }),
    [bumpRefresh, subscribe]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeContext() {
  return useContext(RealtimeContext);
}
