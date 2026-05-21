'use client';

import { useEffect, useState } from 'react';
import { usePanelLoadingContext } from '@/context/PanelLoadingContext';

const DEFAULT_DELAY_MS = 900;

export function usePageLoading(delay = DEFAULT_DELAY_MS) {
  const { setLoading: setPanelLoading } = usePanelLoadingContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPanelLoading(true);
    setLoading(true);

    const timer = window.setTimeout(() => {
      setPanelLoading(false);
      setLoading(false);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      setPanelLoading(false);
    };
  }, [delay, setPanelLoading]);

  return loading;
}
