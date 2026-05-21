'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import Logo from '@/components/atoms/Logo';
import LanguageDropdown from '@/components/molecules/LanguageDropdown';
import { CURRENT_CLIENT } from '@/constants/clientMockData';
import { useAuthTransition } from '@/context/AuthTransitionProvider';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { loadProfileUser } from '@/utils/profileHelpers';
import styles from '@/components/organisms/Sidebar/Sidebar.module.css';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/client/properties', labelKey: 'nav.myProperties', icon: 'properties' },
  { href: '/client/inventory', labelKey: 'nav.inventory', icon: 'inventory' },
  { href: '/client/contracts', labelKey: 'nav.contracts', icon: 'contracts' },
  { href: '/client/history', labelKey: 'nav.history', icon: 'history' },
  { href: '/client/billing', labelKey: 'nav.billing', icon: 'billing' },
  { href: '/client/settings', labelKey: 'nav.settings', icon: 'settings' },
];

export default function ClientSidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { playLogout } = useAuthTransition();
  const isDesktop = useMediaQuery('(min-width: 769px)');
  const isCompact = collapsed && isDesktop;
  const [user, setUser] = useState(CURRENT_CLIENT);

  useEffect(() => {
    setUser(loadProfileUser(CURRENT_CLIENT));
  }, []);

  const isActive = (item) => pathname === item.href || pathname.startsWith(`${item.href}/`);

  const handleLogout = () => {
    onClose?.();
    playLogout();
  };

  return (
    <>
      {isOpen && !isDesktop && (
        <button type="button" className={styles.backdrop} onClick={onClose} aria-label={t('common.closeMenu')} />
      )}
      <div className={cn(styles.shell, isOpen && styles.open, isCompact && styles.collapsed)}>
        <aside className={cn(styles.sidebar, isCompact && styles.sidebarCollapsed)}>
          <div className={cn(styles.miniHeader, isCompact && styles.miniHeaderCollapsed)}>
            <Link href="/client/properties" className={styles.brand} onClick={onClose} title={t('client.portalTitle')}>
              <Logo variant={isCompact ? 'sidebarIcon' : 'sidebarClean'} />
            </Link>

            {isDesktop && (
              <button
                type="button"
                className={styles.collapseBtn}
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expandir sidebar' : 'Retrair sidebar'}
              >
                <Icon name={collapsed ? 'sidebarExpand' : 'sidebarCollapse'} size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const label = item.label || t(item.labelKey);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(styles.link, active && styles.active, isCompact && styles.linkCollapsed)}
                  onClick={onClose}
                  title={isCompact ? label : undefined}
                >
                  <span className={styles.iconWrap}>
                    <Icon name={item.icon} size={20} strokeWidth={1.5} />
                  </span>
                  {!isCompact && <span className={styles.linkLabel}>{label}</span>}
                  {active && <span className={cn(styles.activeDot, isCompact && styles.activeDotCollapsed)} aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>

          {!isCompact && (
            <Link
              href="/client/profile"
              className={cn(styles.promoCard, pathname === '/client/profile' && styles.promoCardActive)}
              onClick={onClose}
            >
              <p className={styles.promoTitle}>
                <strong>{user.firstName}</strong> · {t('roles.client')}
              </p>
              <p className={styles.promoText}>{user.email}</p>
            </Link>
          )}

          <div className={cn(styles.sidebarFooter, isCompact && styles.sidebarFooterCollapsed)}>
            {isCompact && (
              <Link
                href="/client/profile"
                className={cn(styles.promoCompact, pathname === '/client/profile' && styles.promoCompactActive)}
                onClick={onClose}
                title={`${user.firstName} · ${t('roles.client')}`}
              >
                {user.firstName.charAt(0)}
              </Link>
            )}

            <LanguageDropdown
              theme="sidebar"
              iconOnly={isCompact}
              placement="top"
              className={styles.langDropdown}
            />

            <button
              type="button"
              className={cn(styles.logout, isCompact && styles.logoutCollapsed)}
              onClick={handleLogout}
              title={isCompact ? t('common.logout') : undefined}
            >
              {!isCompact && <span>{t('common.logout')}</span>}
              <Icon name="logout" size={18} strokeWidth={1.5} />
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
