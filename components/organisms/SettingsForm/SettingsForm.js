'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Switch from '@/components/atoms/Switch';
import LanguageSelector from '@/components/molecules/LanguageSelector';
import SettingsLayout from '@/components/templates/SettingsLayout';
import { useLocale } from '@/context/I18nProvider';
import { getLocaleMeta } from '@/i18n/config';
import { useToast } from '@/hooks/useToast';
import styles from './SettingsForm.module.css';

const SETTINGS_KEY = 'eb_settings';

function loadSettings() {
  if (typeof window === 'undefined') {
    return { emailNotifications: true, pushNotifications: false };
  }

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }

  return { emailNotifications: true, pushNotifications: false };
}

export default function SettingsForm({ homeHref = '/dashboard' }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(loadSettings);

  const localeMeta = getLocaleMeta(locale);
  const statusLabel = (enabled) => (enabled ? t('settings.enabled') : t('settings.disabled'));

  const handleToggle = (field) => (event) => {
    setSettings((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setLoading(false);
    toast.success(t('settings.saved'), t('settings.savedMessage'));
  };

  const summaryStats = [
    {
      icon: localeMeta.flag,
      label: t('settings.currentLanguage'),
      value: localeMeta.label,
    },
    {
      icon: settings.emailNotifications ? '✉️' : '📭',
      label: t('settings.emailAlerts'),
      value: statusLabel(settings.emailNotifications),
    },
    {
      icon: settings.pushNotifications ? '🔔' : '🔕',
      label: t('settings.pushAlerts'),
      value: statusLabel(settings.pushNotifications),
    },
  ];

  return (
    <SettingsLayout
      homeHref={homeHref}
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      stats={summaryStats}
    >
      <div className={styles.wrap}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{t('settings.language')}</h2>
              <p className={styles.cardHint}>{t('settings.languageDescription')}</p>
            </div>

            <LanguageSelector variant="row" />

            <p className={styles.selectedLanguage}>
              {localeMeta.flag} {localeMeta.label} · {localeMeta.code.toUpperCase()}
            </p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{t('settings.notifications')}</h2>
            </div>

            <div className={styles.toggleList}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleCopy}>
                  <strong>{t('settings.emailNotifications')}</strong>
                  <span>{t('settings.emailNotificationsHint')}</span>
                </div>
                <Switch checked={settings.emailNotifications} onChange={handleToggle('emailNotifications')} />
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleCopy}>
                  <strong>{t('settings.pushNotifications')}</strong>
                  <span>{t('settings.pushNotificationsHint')}</span>
                </div>
                <Switch checked={settings.pushNotifications} onChange={handleToggle('pushNotifications')} />
              </div>
            </div>
          </section>

          <div className={styles.actions}>
            <Button type="submit" loading={loading}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
