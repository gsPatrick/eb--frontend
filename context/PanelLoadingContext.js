'use client';

import { createContext, useContext, useMemo, useRef, useState } from 'react';

const PanelLoadingContext = createContext(null);

export function PanelLoadingProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const setLoadingRef = useRef(setLoading);
  setLoadingRef.current = setLoading;

  const value = useMemo(
    () => ({
      loading,
      setLoading: (next) => setLoadingRef.current(next),
    }),
    [loading]
  );

  return <PanelLoadingContext.Provider value={value}>{children}</PanelLoadingContext.Provider>;
}

export function usePanelLoadingContext() {
  const context = useContext(PanelLoadingContext);

  if (!context) {
    return { loading: false, setLoading: () => {} };
  }

  return context;
}
