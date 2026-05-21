'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/atoms/Icon';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import styles from './Modal.module.css';
import { cn } from '@/utils/cn';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}) {
  const overlayRef = useRef(null);
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (closeOnOverlay && e.target === overlayRef.current) {
      onClose();
    }
  }

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={cn(styles.modal, styles[size])}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || onClose) && (
          <header className={styles.header}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
              <Icon name="close" size={20} />
            </button>
          </header>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
