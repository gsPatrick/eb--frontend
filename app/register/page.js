'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import Input from '@/components/atoms/Input';
import PasswordInput from '@/components/molecules/PasswordInput';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import AuthLayout from '@/components/templates/AuthLayout';
import { useToast } from '@/hooks/useToast';
import { registerUser } from '@/services/auth.service';
import styles from '@/styles/auth.module.css';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const roleOptions = [
    { value: 'client', label: t('roles.client') },
    { value: 'provider', label: t('roles.provider') },
  ];

  const handleChange = (field) => (event) => {
    const value = field === 'terms' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = t('auth.register.nameRequired');
    if (!form.email.trim()) next.email = t('auth.register.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = t('auth.register.emailInvalid');

    if (!form.password) next.password = t('auth.register.passwordRequired');
    else if (form.password.length < 8) next.password = t('auth.register.passwordMinLength');

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = t('auth.register.confirmPasswordMismatch');
    }

    if (!form.terms) next.terms = t('auth.register.termsRequired');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || undefined,
        locale: 'pt',
      });

      toast.success(t('toast.registerSuccess'), t('toast.registerSuccessMessage'));
      router.push('/login');
    } catch (error) {
      toast.error(t('toast.registerFailed'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      authSwitch={
        <>
          {t('auth.register.hasAccount')} <Link href="/login">{t('auth.register.loginLink')}</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <FormField label={t('auth.register.fullName')} htmlFor="name" error={errors.name} required>
          <Input
            id="name"
            type="text"
            placeholder={t('auth.register.namePlaceholder')}
            value={form.name}
            onChange={handleChange('name')}
            error={Boolean(errors.name)}
            autoComplete="name"
          />
        </FormField>

        <FormField label={t('auth.register.email')} htmlFor="email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.register.emailPlaceholder')}
            value={form.email}
            onChange={handleChange('email')}
            error={Boolean(errors.email)}
            autoComplete="email"
          />
        </FormField>

        <FormField label={t('auth.register.phone')} htmlFor="phone" hint={t('auth.register.phoneOptional')}>
          <Input
            id="phone"
            type="tel"
            placeholder={t('auth.register.phonePlaceholder')}
            value={form.phone}
            onChange={handleChange('phone')}
            autoComplete="tel"
          />
        </FormField>

        <FormField label={t('auth.register.role')} htmlFor="role" required>
          <Select id="role" value={form.role} onChange={handleChange('role')}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={t('auth.register.password')} htmlFor="password" error={errors.password} required>
          <PasswordInput
            id="password"
            placeholder={t('auth.register.passwordPlaceholder')}
            value={form.password}
            onChange={handleChange('password')}
            error={Boolean(errors.password)}
            autoComplete="new-password"
          />
        </FormField>

        <FormField
          label={t('auth.register.confirmPassword')}
          htmlFor="confirmPassword"
          error={errors.confirmPassword}
          required
        >
          <PasswordInput
            id="confirmPassword"
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
          />
        </FormField>

        <FormField error={errors.terms}>
          <Checkbox
            id="terms"
            label={
              <span className={styles.terms}>
                {t('auth.register.terms')}{' '}
                <Link href="#">{t('auth.register.termsOfUse')}</Link> e a{' '}
                <Link href="#">{t('auth.register.privacyPolicy')}</Link>
              </span>
            }
            checked={form.terms}
            onChange={handleChange('terms')}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.register.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
