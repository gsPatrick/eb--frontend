'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/src/services/api/api-client';
import { clearAuthSession } from '@/utils/authSession';
import { useToast } from '@/hooks/useToast';

const RealtimeContext = createContext(null);

export { RealtimeContext };

const ADMIN_EVENTS = new Set(['ORDER_CHECKIN', 'INVENTORY_CRITICAL']);
const CLIENT_EVENTS = new Set(['ORDER_COMPLETED', 'INVENTORY_CRITICAL']);

export function RealtimeProvider({ children, audience = 'admin' }) {
  const toast = useToast();
  const router = useRouter();
  const toastRef = useRef(toast);
  const [refreshToken, setRefreshToken] = useState(0);
  const listenersRef = useRef(new Map());

  toastRef.current = toast;

  const bumpRefresh = useCallback((scope) => {
    setRefreshToken((prev) => prev + 1);
    listenersRef.current.get(scope)?.forEach((callback) => callback());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const token = localStorage.getItem('eb_token');
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

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
    });

    socket.on('force_logout', (payload) => {
      toastRef.current.warning(payload?.title || 'Sessão encerrada', payload?.message || '');
      clearAuthSession();
      router.push('/login');
    });

    return () => {
      socket.disconnect();
    };
  }, [audience, bumpRefresh, router]);

  const value = useMemo(
    () => ({
      refreshToken,
      bumpRefresh,
      subscribe(scope, callback) {
        if (!listenersRef.current.has(scope)) {
          listenersRef.current.set(scope, new Set());
        }
        listenersRef.current.get(scope).add(callback);
        return () => listenersRef.current.get(scope)?.delete(callback);
      },
    }),
    [bumpRefresh, refreshToken]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeContext() {
  return useContext(RealtimeContext);
}
