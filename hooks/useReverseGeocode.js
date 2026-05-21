'use client';

import { useEffect, useState } from 'react';
import { geocodingApi } from '@/src/services/api';

function formatCoords(lat, lng) {
  if (lat == null || lng == null) return '';
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

export function useReverseGeocode(latitude, longitude, enabled = true) {
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || latitude == null || longitude == null) {
      setLabel('');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    geocodingApi
      .reverse(latitude, longitude)
      .then((result) => {
        if (!cancelled) {
          setLabel(result.label || result.address || '');
        }
      })
      .catch(() => {
        if (!cancelled) setLabel('');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, enabled]);

  return {
    label,
    loading,
    coords: formatCoords(latitude, longitude),
  };
}
