'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import Input from '@/components/atoms/Input';
import PasswordInput from '@/components/molecules/PasswordInput';
import FormField from '@/components/molecules/FormField';
import AuthLayout from '@/components/templates/AuthLayout';
import { useAuthTransition } from '@/context/AuthTransitionProvider';
import { useToast } from '@/hooks/useToast';
import { loginUser } from '@/services/auth.service';
import styles from '@/styles/auth.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { playLoginSuccess, isTransitioning } = useAuthTransition();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleChange = (field) => (event) => {
    const value = field === 'remember' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {};

    if (!form.email.trim()) next.email = t('auth.login.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = t('auth.login.emailInvalid');

    if (!form.password) next.password = t('auth.login.passwordRequired');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const { user } = await loginUser({ email: form.email.trim(), password: form.password });

      const destination =
        user.role === 'client'
          ? '/client/properties'
          : user.role === 'provider'
            ? '/provider/schedule'
            : '/dashboard';

      playLoginSuccess(user.name, destination);
    } catch (error) {
      toast.error(t('toast.loginFailed'), error.message);
      setLoading(false);
    }
  };

  return (
    <div className={isTransitioning ? styles.authExiting : undefined}>
      <AuthLayout
        title={t('auth.login.title')}
        subtitle={t('auth.login.subtitle')}
        authSwitch={
          <>
            {t('auth.login.footer')} <Link href="/register">{t('auth.login.registerLink')}</Link>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField label={t('auth.login.email')} htmlFor="email" error={errors.email} required>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              value={form.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              autoComplete="email"
            />
          </FormField>

          <FormField label={t('auth.login.password')} htmlFor="password" error={errors.password} required>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange('password')}
              error={Boolean(errors.password)}
              autoComplete="current-password"
            />
          </FormField>

          <div className={styles.row}>
            <Checkbox label={t('auth.login.remember')} checked={form.remember} onChange={handleChange('remember')} />
            <Link href="/forgot-password" className={styles.link}>
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {t('auth.login.submit')}
          </Button>
        </form>
      </AuthLayout>
    </div>
  );
}
