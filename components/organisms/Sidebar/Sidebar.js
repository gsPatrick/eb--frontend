'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import Logo from '@/components/atoms/Logo';
import LanguageDropdown from '@/components/molecules/LanguageDropdown';
import { CURRENT_ADMIN } from '@/constants/adminMockData';
import { useAuthTransition } from '@/context/AuthTransitionProvider';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { loadProfileUser } from '@/utils/profileHelpers';
import styles from './Sidebar.module.css';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard', exact: true },
  { href: '/dashboard/properties', labelKey: 'nav.properties', icon: 'properties' },
  { href: '/dashboard/users', labelKey: 'nav.users', icon: 'users' },
  { href: '/dashboard/orders', labelKey: 'nav.orders', icon: 'orders' },
  { href: '/dashboard/extras', labelKey: 'nav.extras', icon: 'extras' },
  { href: '/dashboard/billing', labelKey: 'nav.billing', icon: 'billing' },
  { href: '/dashboard/contracts', labelKey: 'nav.contractTemplates', icon: 'contracts' },
  { href: '/dashboard/reviews', labelKey: 'nav.quality', icon: 'reviews' },
  { href: '/dashboard/sync-log', labelKey: 'nav.syncLog', icon: 'sync' },
  { href: '/dashboard/settings', labelKey: 'nav.settings', icon: 'settings' },
];

export default function Sidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { playLogout } = useAuthTransition();
  const isDesktop = useMediaQuery('(min-width: 769px)');
  const isCompact = collapsed && isDesktop;
  const [user, setUser] = useState(CURRENT_ADMIN);

  useEffect(() => {
    setUser(loadProfileUser(CURRENT_ADMIN));
  }, []);

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const handleLogout = () => {
    onClose?.();
    playLogout();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={onClose}
          aria-label={t('common.closeMenu')}
        />
      )}
      <div className={cn(styles.shell, isOpen && styles.open, isCompact && styles.collapsed)}>
        <aside className={cn(styles.sidebar, isCompact && styles.sidebarCollapsed)}>
          <div className={cn(styles.miniHeader, isCompact && styles.miniHeaderCollapsed)}>
            <Link href="/dashboard" className={styles.brand} onClick={onClose} title={t('nav.dashboard')}>
              <Logo variant={isCompact ? 'sidebarIcon' : 'sidebarClean'} />
            </Link>

            {isDesktop && (
              <button
                type="button"
                className={styles.collapseBtn}
                onClick={onToggleCollapse}
                aria-label={collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
              >
                <Icon name={collapsed ? 'sidebarExpand' : 'sidebarCollapse'} size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const label = t(item.labelKey);

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
              href="/dashboard/profile"
              className={cn(styles.promoCard, pathname === '/dashboard/profile' && styles.promoCardActive)}
              onClick={onClose}
            >
              <p className={styles.promoTitle}>
                <strong>{user.firstName}</strong> · {t('roles.admin')}
              </p>
              <p className={styles.promoText}>{user.email}</p>
            </Link>
          )}

          <div className={cn(styles.sidebarFooter, isCompact && styles.sidebarFooterCollapsed)}>
            {isCompact && (
              <Link
                href="/dashboard/profile"
                className={cn(styles.promoCompact, pathname === '/dashboard/profile' && styles.promoCompactActive)}
                onClick={onClose}
                title={`${user.firstName} · ${t('roles.admin')}`}
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
