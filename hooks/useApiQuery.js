'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePanelLoadingContext } from '@/context/PanelLoadingContext';

export function useApiQuery(fetcher, deps = [], options = {}) {
  const { beginLoading, endLoading } = usePanelLoadingContext();
  const { initialData = null, enabled = true, onError } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);

  fetcherRef.current = fetcher;
  onErrorRef.current = onError;

  const refetch = useCallback(async () => {
    if (!enabled) return null;

    setLoading(true);
    beginLoading();
    setError(null);

    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      onErrorRef.current?.(err);
      return null;
    } finally {
      setLoading(false);
      endLoading();
    }
  }, [beginLoading, enabled, endLoading]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, ...deps]);

  return {
    data,
    setData,
    loading,
    error,
    refetch,
  };
}
