'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import FormField from '@/components/molecules/FormField';
import AuthLayout from '@/components/templates/AuthLayout';
import { useToast } from '@/hooks/useToast';
import styles from '@/styles/auth.module.css';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError(t('auth.forgot.emailRequired'));
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.forgot.emailInvalid'));
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSent(true);
      toast.success(t('toast.emailSent'), t('toast.emailSentMessage'));
    } catch {
      toast.error(t('toast.emailError'), t('toast.emailErrorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      authSwitch={
        <>
          {t('auth.forgot.footer')} <Link href="/login">{t('auth.forgot.backToLogin')}</Link>
        </>
      }
    >
      {sent ? (
        <div className={styles.successBox}>
          <h3>{t('auth.forgot.successTitle')}</h3>
          <p>{t('auth.forgot.successMessage', { email })}</p>
          <Link href="/login" className={styles.backLink}>
            ← {t('auth.forgot.backToLogin')}
          </Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField label={t('auth.forgot.email')} htmlFor="email" error={error} required>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.forgot.emailPlaceholder')}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              error={Boolean(error)}
              autoComplete="email"
            />
          </FormField>

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {t('auth.forgot.submit')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
