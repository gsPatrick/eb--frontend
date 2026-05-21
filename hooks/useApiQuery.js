'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useApiQuery(fetcher, deps = [], options = {}) {
  const { initialData = null, enabled = true, onError } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  fetcherRef.current = fetcher;
  onErrorRef.current = onError;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!enabled || inFlightRef.current) {
      return null;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        onErrorRef.current?.(err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled]);

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
