'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALES, getLocaleMeta } from '@/i18n/config';
import { useLocale } from '@/context/I18nProvider';
import { cn } from '@/utils/cn';
import styles from './LanguageDropdown.module.css';

export default function LanguageDropdown({
  theme = 'light',
  iconOnly = false,
  align = 'left',
  placement = 'bottom',
  className,
}) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = getLocaleMeta(locale);

  const labelKey = theme === 'dark' ? 'landing.nav.languageLabel' : 'profile.language';

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (code) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        styles.root,
        styles[`theme_${theme}`],
        styles[`align_${align}`],
        iconOnly && styles.iconOnly,
        className
      )}
      ref={rootRef}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t(labelKey)}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.flag}>{current.flag}</span>
        {!iconOnly && <span className={styles.code}>{current.code.toUpperCase()}</span>}
        {!iconOnly && (
          <span className={cn(styles.chevron, open && styles.chevronOpen)} aria-hidden="true">
            ▾
          </span>
        )}
      </button>

      {open && (
        <ul
          className={cn(styles.menu, placement === 'top' && styles.menuTop)}
          role="listbox"
          aria-label={t(labelKey)}
        >
          {LOCALES.map((item) => {
            const active = locale === item.code;
            return (
              <li key={item.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(styles.option, active && styles.optionActive)}
                  onClick={() => handleSelect(item.code)}
                >
                  <span className={styles.flag}>{item.flag}</span>
                  <span className={styles.optionLabel}>{item.label}</span>
                  <span className={styles.optionCode}>{item.code.toUpperCase()}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
