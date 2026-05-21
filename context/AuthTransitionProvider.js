'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthTransitionOverlay from '@/components/organisms/AuthTransitionOverlay';
import { clearAuthSession } from '@/utils/authSession';

const AuthTransitionContext = createContext(null);

const LOGIN_DURATION_MS = 1400;
const LOGOUT_DURATION_MS = 950;

export function AuthTransitionProvider({ children }) {
  const router = useRouter();
  const [transition, setTransition] = useState(null);

  const playLoginSuccess = useCallback((userName, destination) => {
    setTransition({ type: 'login', userName });

    window.setTimeout(() => {
      router.push(destination);
      window.setTimeout(() => setTransition(null), 320);
    }, LOGIN_DURATION_MS);
  }, [router]);

  const playLogout = useCallback(() => {
    setTransition({ type: 'logout' });

    window.setTimeout(() => {
      clearAuthSession();
      router.push('/login');
      window.setTimeout(() => setTransition(null), 320);
    }, LOGOUT_DURATION_MS);
  }, [router]);

  const value = useMemo(
    () => ({
      playLoginSuccess,
      playLogout,
      isTransitioning: Boolean(transition),
    }),
    [playLoginSuccess, playLogout, transition]
  );

  return (
    <AuthTransitionContext.Provider value={value}>
      {children}
      {transition && (
        <AuthTransitionOverlay type={transition.type} userName={transition.userName} />
      )}
    </AuthTransitionContext.Provider>
  );
}

export function useAuthTransition() {
  const context = useContext(AuthTransitionContext);

  if (!context) {
    throw new Error('useAuthTransition must be used within AuthTransitionProvider');
  }

  return context;
}
