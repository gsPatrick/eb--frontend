'use client';

import { useTranslation } from 'react-i18next';
import { LOCALES } from '@/i18n/config';
import { useLocale } from '@/context/I18nProvider';
import { cn } from '@/utils/cn';
import styles from './LanguageSelector.module.css';

export default function LanguageSelector({ variant = 'grid', className, showHeader = true }) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        styles.wrap,
        variant === 'row' && styles.row,
        variant === 'compact' && styles.compact,
        className
      )}
    >
      {showHeader && variant === 'grid' && (
        <div className={styles.header}>
          <span className={styles.label}>{t('profile.language')}</span>
          <span className={styles.hint}>{t('profile.languageHint')}</span>
        </div>
      )}

      <div className={styles.grid} role="radiogroup" aria-label={t('profile.language')}>
        {LOCALES.map((item) => {
          const active = locale === item.code;

          return (
            <button
              key={item.code}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={item.label}
              title={item.label}
              className={cn(styles.option, active && styles.active)}
              onClick={() => setLocale(item.code)}
            >
              <span className={styles.flag} aria-hidden="true">
                {item.flag}
              </span>

              {variant !== 'compact' && (
                <span className={styles.optionText}>
                  <strong>{variant === 'row' ? item.code.toUpperCase() : item.label}</strong>
                  {variant === 'grid' && <span>{item.code.toUpperCase()}</span>}
                </span>
              )}

              {active && <span className={styles.check} aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
