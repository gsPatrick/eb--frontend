'use client';

import { useContext, useEffect, useRef } from 'react';
import { RealtimeContext } from '@/context/RealtimeProvider';

export function useRealtimeRefresh(scope, refetch) {
  const context = useContext(RealtimeContext);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!context?.subscribe || !refetchRef.current) return undefined;
    return context.subscribe(scope, () => refetchRef.current?.());
  }, [context, scope]);
}
