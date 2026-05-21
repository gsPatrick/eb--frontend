'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_REFETCH_MS = 3000;

export function useApiQuery(fetcher, deps = [], options = {}) {
  const { initialData = null, enabled = true, onError } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const enabledRef = useRef(enabled);
  const lastFetchAtRef = useRef(0);
  const depsKey = JSON.stringify(deps);

  fetcherRef.current = fetcher;
  onErrorRef.current = onError;
  enabledRef.current = enabled;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async (refetchOptions = {}) => {
    const { force = false } = refetchOptions;

    if (!enabledRef.current || inFlightRef.current) {
      return null;
    }

    const now = Date.now();
    if (!force && now - lastFetchAtRef.current < MIN_REFETCH_MS) {
      return null;
    }

    inFlightRef.current = true;
    lastFetchAtRef.current = now;
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
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    refetch({ force: true });
  }, [enabled, depsKey, refetch]);

  return {
    data,
    setData,
    loading,
    error,
    refetch,
  };
}
