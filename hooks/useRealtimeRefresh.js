'use client';

import { useContext, useEffect, useRef } from 'react';
import { RealtimeContext } from '@/context/RealtimeProvider';

const MIN_REFRESH_MS = 3000;

export function useRealtimeRefresh(scope, refetch) {
  const context = useContext(RealtimeContext);
  const refetchRef = useRef(refetch);
  const lastRefreshAtRef = useRef(0);

  refetchRef.current = refetch;

  useEffect(() => {
    if (!context?.subscribe || !refetchRef.current) {
      return undefined;
    }

    return context.subscribe(scope, () => {
      const now = Date.now();
      if (now - lastRefreshAtRef.current < MIN_REFRESH_MS) {
        return;
      }

      lastRefreshAtRef.current = now;
      refetchRef.current?.();
    });
  }, [context?.subscribe, scope]);
}
