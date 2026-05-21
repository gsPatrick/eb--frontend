'use client';

import { createPortal } from 'react-dom';
import Toast from '@/components/molecules/Toast';
import { useToast } from '@/hooks/useToast';
import styles from './ToastContainer.module.css';

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (typeof window === 'undefined' || !toasts.length) return null;

  return createPortal(
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}
