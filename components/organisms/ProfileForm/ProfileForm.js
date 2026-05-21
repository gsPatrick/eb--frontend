'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import AvatarUpload from '@/components/molecules/AvatarUpload';
import FormField from '@/components/molecules/FormField';
import LanguageSelector from '@/components/molecules/LanguageSelector';
import { useToast } from '@/hooks/useToast';
import { loadProfileUser, persistProfileUser } from '@/utils/profileHelpers';
import styles from './ProfileForm.module.css';

export default function ProfileForm({ fallbackUser, onUserChange }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [user, setUser] = useState(fallbackUser);
  const [loading, setLoading] = useState(false);
  const onUserChangeRef = useRef(onUserChange);
  onUserChangeRef.current = onUserChange;

  const [form, setForm] = useState({
    name: fallbackUser.name,
    email: fallbackUser.email,
    phone: fallbackUser.phone || '',
    avatar: fallbackUser.avatar || null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const profile = loadProfileUser(fallbackUser);
    setUser(profile);
    setForm((prev) => ({
      ...prev,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      avatar: profile.avatar || null,
    }));
    onUserChangeRef.current?.(profile);
  }, [fallbackUser.id, fallbackUser.email, fallbackUser.role]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.warning(t('profile.passwordMismatch'), t('profile.passwordMismatchMessage'));
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updatedUser = {
      ...user,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      avatar: form.avatar,
      firstName: form.name.trim().split(' ')[0],
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('eb_token') : null;
    persistProfileUser(updatedUser, token);

    setUser(updatedUser);
    onUserChange?.(updatedUser);
    setForm((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));

    setLoading(false);
    toast.success(t('profile.saved'), t('profile.savedMessage'));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('profile.title')}</h2>
        <p className={styles.subtitle}>{t('profile.subtitle')}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <AvatarUpload
          name={form.name}
          src={form.avatar}
          onChange={(avatar) => setForm((prev) => ({ ...prev, avatar }))}
        />

        <h3 className={styles.sectionTitle}>{t('profile.personalInfo')}</h3>

        <FormField label={t('profile.fullName')} htmlFor="profile-name" required>
          <Input id="profile-name" value={form.name} onChange={handleChange('name')} />
        </FormField>

        <FormField label={t('profile.email')} htmlFor="profile-email" required>
          <Input id="profile-email" type="email" value={form.email} onChange={handleChange('email')} />
        </FormField>

        <FormField label={t('profile.phone')} htmlFor="profile-phone">
          <Input id="profile-phone" value={form.phone} onChange={handleChange('phone')} />
        </FormField>

        <LanguageSelector variant="row" showHeader={false} />

        <div className={styles.divider} />

        <h3 className={styles.sectionTitle}>{t('profile.security')}</h3>

        <FormField label={t('profile.currentPassword')} htmlFor="profile-current-password">
          <Input
            id="profile-current-password"
            type="password"
            value={form.currentPassword}
            onChange={handleChange('currentPassword')}
          />
        </FormField>

        <FormField label={t('profile.newPassword')} htmlFor="profile-new-password">
          <Input
            id="profile-new-password"
            type="password"
            value={form.newPassword}
            onChange={handleChange('newPassword')}
          />
        </FormField>

        <FormField label={t('profile.confirmPassword')} htmlFor="profile-confirm-password">
          <Input
            id="profile-confirm-password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
          />
        </FormField>

        <div className={styles.actions}>
          <Button type="submit" loading={loading}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
