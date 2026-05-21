'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RealtimeProvider } from '@/context/RealtimeProvider';
import Icon from '@/components/atoms/Icon';
import Sidebar from '@/components/organisms/Sidebar';
import { PanelLoadingProvider } from '@/context/PanelLoadingContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';
import styles from './DashboardLayout.module.css';

const STORAGE_KEY = 'eb_sidebar_collapsed';

function DashboardLayoutShell({ children }) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 769px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div
      className={styles.layout}
      data-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className={styles.main}>
        <button
          type="button"
          className={styles.mobileMenu}
          onClick={() => setSidebarOpen(true)}
          aria-label={t('common.openMenu')}
        >
          <Icon name="menu" size={20} />
        </button>
        <main className={cn(styles.content, styles.contentFlush)}>{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <PanelLoadingProvider>
      <RealtimeProvider audience="admin">
        <DashboardLayoutShell>{children}</DashboardLayoutShell>
      </RealtimeProvider>
    </PanelLoadingProvider>
  );
}
