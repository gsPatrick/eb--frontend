'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const PanelLoadingContext = createContext(null);

export function PanelLoadingProvider({ children }) {
  const inFlightRef = useRef(0);
  const [loading, setLoading] = useState(false);

  const beginLoading = useCallback(() => {
    inFlightRef.current += 1;
    if (inFlightRef.current === 1) {
      setLoading(true);
    }
  }, []);

  const endLoading = useCallback(() => {
    inFlightRef.current = Math.max(0, inFlightRef.current - 1);
    if (inFlightRef.current === 0) {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      loading,
      beginLoading,
      endLoading,
      setLoading: (next) => {
        if (next) beginLoading();
        else endLoading();
      },
    }),
    [beginLoading, endLoading, loading]
  );

  return <PanelLoadingContext.Provider value={value}>{children}</PanelLoadingContext.Provider>;
}

export function usePanelLoadingContext() {
  const context = useContext(PanelLoadingContext);

  if (!context) {
    return {
      loading: false,
      beginLoading: () => {},
      endLoading: () => {},
      setLoading: () => {},
    };
  }

  return context;
}
