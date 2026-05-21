'use client';

import { createContext, useContext, useMemo, useState } from 'react';

const PanelLoadingContext = createContext(null);

export function PanelLoadingProvider({ children }) {
  const [loading, setLoading] = useState(true);

  const value = useMemo(
    () => ({
      loading,
      setLoading,
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
