'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import Logo from '@/components/atoms/Logo';
import LanguageDropdown from '@/components/molecules/LanguageDropdown';
import { useAuthTransition } from '@/context/AuthTransitionProvider';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import styles from '@/components/organisms/Sidebar/Sidebar.module.css';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { href: '/provider/schedule', labelKey: 'nav.providerSchedule', icon: 'schedule' },
  { href: '/provider/history', labelKey: 'nav.providerHistory', icon: 'history' },
  { href: '/provider/profile', labelKey: 'nav.profile', icon: 'users' },
];

export default function ProviderSidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { playLogout } = useAuthTransition();
  const isDesktop = useMediaQuery('(min-width: 769px)');
  const isCompact = collapsed && isDesktop;

  const isActive = (item) =>
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.href === '/provider/schedule' && pathname.startsWith('/provider/execution')) ||
    (item.href === '/provider/profile' &&
      ['/provider/inventory', '/provider/settings'].some((path) => pathname.startsWith(path)));

  const handleLogout = () => {
    onClose?.();
    playLogout();
  };

  return (
    <>
      {isOpen && !isDesktop && (
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
            <Link
              href="/provider/schedule"
              className={styles.brand}
              onClick={onClose}
              title={t('roles.provider')}
            >
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
                  {active && (
                    <span
                      className={cn(styles.activeDot, isCompact && styles.activeDotCollapsed)}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className={styles.sidebarFooter}>
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
