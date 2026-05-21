'use client';

import { ToastProvider } from '@/hooks/useToast';
import ToastContainer from '@/components/organisms/ToastContainer';
import { I18nProvider } from '@/context/I18nProvider';
import { AuthTransitionProvider } from '@/context/AuthTransitionProvider';

export default function Providers({ children }) {
  return (
    <I18nProvider>
      <AuthTransitionProvider>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </AuthTransitionProvider>
    </I18nProvider>
  );
}
