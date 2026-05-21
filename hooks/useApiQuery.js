'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePanelLoadingContext } from '@/context/PanelLoadingContext';

export function useApiQuery(fetcher, deps = [], options = {}) {
  const { setLoading: setPanelLoading } = usePanelLoadingContext();
  const { initialData = null, enabled = true, onError } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled) return null;

    setLoading(true);
    setPanelLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
      setPanelLoading(false);
    }
  }, [enabled, fetcher, onError, setPanelLoading]);

  useEffect(() => {
    refetch();
  }, [refetch, ...deps]);

  return {
    data,
    setData,
    loading,
    error,
    refetch,
  };
}
